from contextlib import asynccontextmanager
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4
from typing import Literal

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .agent import recommend
from .config import settings
from .database import Base, engine, SessionLocal, get_db
from .governance import amount, evaluate, first_violation, make_snapshot, digests, verify_snapshot, duplicate_capture_guard
from .models import Product, Policy, Purchase, Payment, SpendReservation, SecurityTest, Audit
from .paypal import paypal, PayPalFailure, approve_url, capture_from_order, order_matches_purchase
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MVP-only table creation. Use Alembic before production deployment.
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="GuardCart AI 2.0 API", version="2.0-demo", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatInput(BaseModel):
    message: str = Field(min_length=3, max_length=2000)


class ProposeInput(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=5)
    original_request: str = Field(default="User selected catalog product", max_length=2000)


class PolicyInput(BaseModel):
    max_transaction: Decimal = Field(gt=0)
    daily_limit: Decimal = Field(gt=0)
    merchants: list[str] = Field(min_length=1)
    blocked_categories: list[str] = Field(default_factory=list)
    require_approval: bool = True


class OrderInput(BaseModel):
    proposal_id: str


class TestInput(BaseModel):
    scenario: Literal[
        "normal_purchase", "budget_violation", "prompt_injection",
        "unauthorized_merchant", "duplicate_payment"
    ]


def iso(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def audit(db: Session, event: str, reference: str, details: dict) -> None:
    db.add(Audit(id=str(uuid4()), event=event, reference=reference, details=details))


def product_json(product: Product) -> dict:
    # Exact contract expected by the existing frontend's shoppingService.ts.
    return {
        "id": product.id,
        "name": product.name,
        "price": float(product.price),
        "merchant": product.merchant,
        "description": product.description,
        "features": product.features,
    }


def policy_json(policy: Policy) -> dict:
    return {
        "max_transaction": float(policy.max_transaction),
        "daily_limit": float(policy.daily_limit),
        "merchants": policy.merchants,
        "blocked_categories": policy.blocked_categories,
        "require_approval": policy.require_approval,
        "version": policy.version,
    }


def today_total(db: Session) -> Decimal:
    value = db.scalar(select(func.coalesce(func.sum(SpendReservation.amount), 0)).where(
        SpendReservation.day_utc == datetime.now(timezone.utc).date(),
        SpendReservation.status.in_(["RESERVED", "COMPLETED"]),
    ))
    return amount(value or 0)


def current_checks(db: Session, purchase: Purchase, spent_today: Decimal = Decimal("0")) -> list[dict]:
    policy = db.get(Policy, 1)
    product = db.get(Product, purchase.product_id)
    if not policy or not product:
        raise HTTPException(409, "Product or financial policy no longer exists")
    checks, total = evaluate(product, purchase.quantity, policy, spent_today)
    if (
        amount(product.price) != amount(purchase.unit_price)
        or amount(total) != amount(purchase.total_amount)
        or product.merchant != purchase.merchant
        or product.currency != purchase.currency
    ):
        checks.append({"name": "ORDER_INTEGRITY", "status": "FAIL", "reason": "Trusted catalog details changed after purchase proposal"})
    if policy.version != purchase.policy_version:
        checks.append({"name": "POLICY_VERSION", "status": "FAIL", "reason": "Financial policy changed; propose and approve a new purchase"})
    return checks


def require_approved_purchase(db: Session, purchase: Purchase) -> None:
    if not verify_snapshot(purchase, approved=True):
        raise HTTPException(409, "Exact purchase snapshot or human approval verification failed")
    checks = current_checks(db, purchase)
    problem = first_violation(checks)
    if problem:
        raise HTTPException(409, {"rule": problem["name"], "reason": problem["reason"]})


def api_order(payment: Payment) -> dict:
    response = payment.last_response or {}
    approval = approve_url(response)
    if not approval:
        raise HTTPException(409, "PayPal order exists but no approval link is available; reconcile it first")
    return {"order_id": payment.order_id, "approval_url": approval, "status": payment.state}


def validate_capture(capture: dict, purchase: Purchase) -> tuple[str, str | None]:
    unit_capture = capture_from_order(capture)
    if unit_capture is None:
        return "PENDING", None
    capture_amount = unit_capture.get("amount", {})
    if capture_amount.get("currency_code") != purchase.currency or capture_amount.get("value") != f"{purchase.total_amount:.2f}":
        raise HTTPException(409, "PayPal captured amount/currency mismatch; manual reconciliation required")
    raw_status = unit_capture.get("status", "PENDING")
    return raw_status if raw_status in {"COMPLETED", "PENDING"} else "FAILED", unit_capture.get("id")


def commit_capture_result(db: Session, payment: Payment, purchase: Purchase, response: dict) -> dict:
    if not order_matches_purchase(response, purchase):
        payment.state = "CAPTURE_UNKNOWN"
        db.commit()
        raise HTTPException(409, "PayPal order details do not match purchase; manual reconciliation required")
    status, capture_id = validate_capture(response, purchase)
    if status == "COMPLETED" and not capture_id:
        payment.state = "CAPTURE_UNKNOWN"
        db.commit()
        raise HTTPException(409, "PayPal reports complete without capture reference; manual reconciliation required")
    payment.state = status
    payment.capture_id = capture_id
    payment.last_response = response
    purchase.status = status
    reservation = db.scalar(select(SpendReservation).where(SpendReservation.purchase_id == purchase.id))
    if reservation:
        reservation.status = "COMPLETED" if status == "COMPLETED" else ("RELEASED" if status == "FAILED" else "RESERVED")
    audit(db, "PAYPAL_CAPTURE_RECORDED", purchase.id, {"order_id": payment.order_id, "capture_id": capture_id, "status": status})
    db.commit()
    return {"order_id": payment.order_id, "capture_id": capture_id, "status": status}


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "demo_user": True, "paypal_configured": settings.paypal_configured}


@app.get("/api/products")
def products(db: Session = Depends(get_db)):
    rows = db.scalars(select(Product).where(Product.active.is_(True)).order_by(Product.id)).all()
    return [product_json(row) for row in rows]


@app.post("/api/agent/chat")
def chat(payload: ChatInput, db: Session = Depends(get_db)):
    policy = db.get(Policy, 1)
    rows = db.scalars(select(Product).where(Product.active.is_(True)).order_by(Product.id)).all()
    result = recommend(payload.message, rows, policy.max_transaction, policy.merchants)
    by_id = {p.id: p for p in rows}
    return {"reply": result["reply"], "recommendations": [product_json(by_id[i]) for i in result["product_ids"]], "ai_mode": result["ai_mode"]}


@app.get("/api/policies")
def get_policy(db: Session = Depends(get_db)):
    return policy_json(db.get(Policy, 1))


@app.put("/api/policies")
def save_policy(payload: PolicyInput, db: Session = Depends(get_db)):
    if not payload.require_approval:
        raise HTTPException(422, "GuardCart MVP requires human approval for every purchase")
    policy = db.get(Policy, 1)
    policy.max_transaction = amount(payload.max_transaction)
    policy.daily_limit = amount(payload.daily_limit)
    policy.merchants = list(dict.fromkeys(payload.merchants))
    policy.blocked_categories = list(dict.fromkeys(payload.blocked_categories))
    policy.require_approval = True
    policy.version += 1
    audit(db, "POLICY_UPDATED", "demo-user", {"version": policy.version})
    db.commit()
    return policy_json(policy)


@app.post("/api/purchases/propose")
def propose(payload: ProposeInput, db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(404, "Product does not exist")
    policy = db.get(Policy, 1)
    checks, total = evaluate(product, payload.quantity, policy, today_total(db))
    decision = "BLOCK" if first_violation(checks) else "ALLOW"
    purchase_id = str(uuid4())
    snapshot = make_snapshot(purchase_id, product, payload.quantity, total, policy.version)
    sha, mac = digests(snapshot)
    purchase = Purchase(
        id=purchase_id, product_id=product.id, quantity=payload.quantity,
        unit_price=product.price, total_amount=total, currency=product.currency,
        merchant=product.merchant, policy_version=policy.version,
        status="BLOCKED" if decision == "BLOCK" else "AWAITING_APPROVAL",
        snapshot_json=snapshot, snapshot_sha256=sha, snapshot_hmac=mac,
        approved_sha256=None, checks_json=checks, original_request=payload.original_request,
    )
    db.add(purchase)
    audit(db, "PROPOSAL_EVALUATED", purchase.id, {"decision": decision, "checks": checks})
    db.commit()
    return {
        "id": purchase.id, "product_id": product.id, "quantity": purchase.quantity,
        "total_amount": float(total), "currency": product.currency,
        "decision": decision, "checks": checks, "snapshot_sha256": sha,
    }


@app.post("/api/purchases/{purchase_id}/approve")
def approve(purchase_id: str, db: Session = Depends(get_db)):
    purchase = db.get(Purchase, purchase_id)
    if not purchase:
        raise HTTPException(404, "Purchase proposal does not exist")
    if purchase.status == "APPROVED":
        return {"proposal_id": purchase.id, "approval_status": "APPROVED"}
    if purchase.status != "AWAITING_APPROVAL":
        raise HTTPException(409, "This proposal cannot be approved")
    if not verify_snapshot(purchase):
        raise HTTPException(409, "Purchase snapshot integrity check failed")
    checks = current_checks(db, purchase, today_total(db))
    problem = first_violation(checks)
    if problem:
        purchase.status = "BLOCKED"
        purchase.checks_json = checks
        audit(db, "APPROVAL_BLOCKED", purchase.id, {"rule": problem["name"]})
        db.commit()
        raise HTTPException(409, {"rule": problem["name"], "reason": problem["reason"]})
    purchase.approved_sha256 = purchase.snapshot_sha256
    purchase.status = "APPROVED"
    audit(db, "HUMAN_APPROVED", purchase.id, {"snapshot_sha256": purchase.snapshot_sha256})
    db.commit()
    return {"proposal_id": purchase.id, "approval_status": "APPROVED"}


@app.post("/api/paypal/orders")
def create_order(payload: OrderInput, db: Session = Depends(get_db)):
    if not settings.paypal_configured:
        raise HTTPException(503, "Configure PayPal Sandbox credentials in backend/.env")
    # Lock the shared policy row to serialize daily reservations on PostgreSQL.
    db.execute(select(Policy).where(Policy.id == 1).with_for_update()).scalar_one()
    purchase = db.execute(select(Purchase).where(Purchase.id == payload.proposal_id).with_for_update()).scalar_one_or_none()
    if purchase is None:
        raise HTTPException(404, "Purchase proposal not found")
    if purchase.status not in {"APPROVED", "ORDER_CREATED"}:
        raise HTTPException(409, "Purchase must have explicit human approval")
    require_approved_purchase(db, purchase)
    payment = db.scalar(select(Payment).where(Payment.purchase_id == purchase.id))
    if payment:
        if payment.order_id:
            return api_order(payment)
        if payment.state == "ORDER_CREATING":
            raise HTTPException(409, "Order creation is already in progress")
        if payment.state != "ORDER_CREATE_UNKNOWN":
            raise HTTPException(409, "Existing payment record needs reconciliation")
    else:
        # Atomic reservation under the PostgreSQL policy lock.
        if today_total(db) + amount(purchase.total_amount) > amount(db.get(Policy, 1).daily_limit):
            raise HTTPException(409, "Insufficient daily spending allowance")
        db.add(SpendReservation(
            id=str(uuid4()), purchase_id=purchase.id,
            day_utc=datetime.now(timezone.utc).date(), amount=purchase.total_amount, status="RESERVED",
        ))
        payment = Payment(
            id=str(uuid4()), purchase_id=purchase.id, state="ORDER_CREATING",
            create_request_id=str(uuid4()), capture_request_id=str(uuid4()),
        )
        db.add(payment)
    payment.state = "ORDER_CREATING"
    db.commit()
    try:
        response = paypal.create(purchase, payment.create_request_id)
    except PayPalFailure as exc:
        payment.state = "ORDER_CREATE_UNKNOWN"  # Keep the budget reservation until reconciled.
        audit(db, "PAYPAL_ORDER_UNCERTAIN", purchase.id, {"reason": "Provider request did not return confirmed result"})
        db.commit()
        raise HTTPException(502, str(exc)) from exc
    payment.order_id = response.get("id")
    payment.last_response = response
    payment.state = "ORDER_CREATED"
    purchase.status = "ORDER_CREATED"
    audit(db, "PAYPAL_ORDER_CREATED", purchase.id, {"order_id": payment.order_id})
    db.commit()
    return api_order(payment)


@app.post("/api/paypal/orders/{order_id}/capture")
def capture_order(order_id: str, db: Session = Depends(get_db)):
    if not settings.paypal_configured:
        raise HTTPException(503, "PayPal Sandbox credentials are not configured")
    payment = db.execute(select(Payment).where(Payment.order_id == order_id).with_for_update()).scalar_one_or_none()
    if payment is None:
        raise HTTPException(404, "Unknown PayPal order ID")
    purchase = db.get(Purchase, payment.purchase_id)
    if payment.state == "COMPLETED":
        return {"order_id": order_id, "capture_id": payment.capture_id, "status": "COMPLETED", "duplicate_prevented": True}
    if payment.state == "CAPTURE_IN_PROGRESS":
        raise HTTPException(409, "Capture already in progress")
    if payment.state not in {"ORDER_CREATED", "CAPTURE_UNKNOWN", "PENDING"}:
        raise HTTPException(409, f"Cannot capture payment in state {payment.state}")
    require_approved_purchase(db, purchase)
    reservation = db.scalar(select(SpendReservation).where(SpendReservation.purchase_id == purchase.id))
    if reservation is None or reservation.status not in {"RESERVED", "COMPLETED"}:
        raise HTTPException(409, "Spending reservation not present")
    payment.state = "CAPTURE_IN_PROGRESS"
    db.commit()
    try:
        remote = paypal.get(order_id)
        if not order_matches_purchase(remote, purchase):
            payment.state = "CAPTURE_UNKNOWN"
            db.commit()
            raise HTTPException(409, "PayPal order does not match approved purchase")
        if remote.get("status") == "COMPLETED":
            return commit_capture_result(db, payment, purchase, remote)
        if remote.get("status") != "APPROVED":
            payment.state = "ORDER_CREATED"
            db.commit()
            raise HTTPException(409, f"Buyer approval required; PayPal order status is {remote.get('status')}")
        response = paypal.capture(order_id, payment.capture_request_id)
    except PayPalFailure as exc:
        payment.state = "CAPTURE_UNKNOWN"  # Do not automatically issue a second capture.
        db.commit()
        raise HTTPException(502, "PayPal capture uncertain; retry verification with the same order ID") from exc
    return commit_capture_result(db, payment, purchase, response)


@app.post("/api/security-tests/run")
def security_test(payload: TestInput, db: Session = Depends(get_db)):
    scenarios = {
        "normal_purchase": 1,
        "budget_violation": 4,
        "prompt_injection": 4,
        "unauthorized_merchant": 5,
    }
    policy = db.get(Policy, 1)
    fixture_used = False
    if payload.scenario == "duplicate_payment":
        payment = db.scalar(select(Payment).where(Payment.state == "COMPLETED").order_by(Payment.created_at.desc()))
        fixture_used = payment is None
        allowed, rule, reason = duplicate_capture_guard(payment.state if payment else "COMPLETED")
        decision = "ALLOW" if allowed else "BLOCK"
        product = db.get(Product, 1)
        reason += "; using a test fixture because no completed Sandbox payment exists yet" if fixture_used else "; evaluated using a real completed payment record"
        total = amount(product.price)
    else:
        product = db.get(Product, scenarios[payload.scenario])

        # Security Test Lab uses an isolated spending fixture.
        # The actual financial policy and governance rules remain unchanged.
        # Real PayPal payments and reservations are not modified.
        lab_spent_today = Decimal("0.00")
        fixture_used = True

        checks, total = evaluate(
            product,
            1,
            policy,
            lab_spent_today,
        )

        problem = first_violation(checks)
        decision = "BLOCK" if problem else "ALLOW"
        rule = problem["name"] if problem else "ALL_CHECKS_PASSED"
        reason = problem["reason"] if problem else "Trusted product and current financial policy checks passed; user approval is still required"
        if payload.scenario == "prompt_injection":
            reason += "; untrusted description cannot alter backend policy (not a universal injection detector)"
    ref = str(uuid4())
    db.add(SecurityTest(
        id=ref, scenario=payload.scenario, decision=decision,
        rule=rule, reason=reason, product_name=product.name,
        merchant=product.merchant, amount=total, fixture_used=fixture_used,
    ))
    audit(db, "SECURITY_LAB_EXECUTED", ref, {"scenario": payload.scenario, "decision": decision, "rule": rule, "fixture_used": fixture_used, "paypal_called": False})
    db.commit()
    return {
        "decision": decision, "rule": rule, "reason": reason,
        "reference": ref, "payment_executed": False,
        "fixture_used": fixture_used, "engine": "backend_governance",
    }


@app.get("/api/transactions")
def transactions(db: Session = Depends(get_db)):
    rows = []
    for purchase in db.scalars(select(Purchase).order_by(Purchase.created_at.desc()).limit(200)):
        product = db.get(Product, purchase.product_id)
        payment = db.scalar(select(Payment).where(Payment.purchase_id == purchase.id))
        violation = first_violation(purchase.checks_json)
        status = (
            "BLOCKED" if purchase.status == "BLOCKED" else
            "COMPLETED" if purchase.status == "COMPLETED" else
            "CANCELLED" if purchase.status == "ABANDONED" else
            "FAILED" if purchase.status == "FAILED" else
            "PENDING"
        )
        rows.append({
            "id": purchase.id, "product_name": product.name if product else "Unknown product",
            "merchant": purchase.merchant, "amount": float(purchase.total_amount), "currency": purchase.currency,
            "created_at": iso(purchase.created_at), "payment_status": status,
            "security_decision": "BLOCK" if purchase.status == "BLOCKED" else "ALLOW",
            "violated_rule": violation["name"] if violation else None,
            "paypal_order_id": payment.order_id if payment else None,
            "capture_id": payment.capture_id if payment else None,
            "original_request": purchase.original_request,
            "approval_status": "APPROVED" if purchase.approved_sha256 else "NOT_APPROVED",
            "integrity_status": "VERIFIED" if verify_snapshot(purchase, approved=bool(purchase.approved_sha256)) else "FAILED",
        })
    # Display lab attempts separately marked as TEST, never claim they were PayPal payments.
    for t in db.scalars(select(SecurityTest).order_by(SecurityTest.created_at.desc()).limit(200)):
        rows.append({
            "id": t.id, "product_name": f"[TEST] {t.product_name}", "merchant": t.merchant,
            "amount": float(t.amount), "currency": "USD", "created_at": iso(t.created_at),
            "payment_status": "BLOCKED" if t.decision == "BLOCK" else "PENDING",
            "security_decision": t.decision, "violated_rule": t.rule if t.decision == "BLOCK" else None,
            "paypal_order_id": None, "capture_id": None,
            "original_request": f"Security Test Lab: {t.scenario}; no PayPal action executed",
            "approval_status": "TEST_ONLY", "integrity_status": "TEST_ONLY",
        })
    return sorted(rows, key=lambda r: r["created_at"], reverse=True)


@app.get("/api/analytics/summary")
def summary(db: Session = Depends(get_db)):
    records = transactions(db)
    return {
        "total_records": len(records),
        "completed": sum(x["payment_status"] == "COMPLETED" for x in records),
        "blocked": sum(x["payment_status"] == "BLOCKED" for x in records),
        "pending": sum(x["payment_status"] == "PENDING" for x in records),
        "total_spent": round(sum(x["amount"] for x in records if x["payment_status"] == "COMPLETED"), 2),
    }
