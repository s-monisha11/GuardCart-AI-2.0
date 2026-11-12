from types import SimpleNamespace

from app.governance import digests, verify_snapshot, evaluate, duplicate_capture_guard
from app.models import Product, Policy
from app.config import settings
from app.main import app
from app import main


def test_health_and_catalog(client):
    assert client.get("/api/health").json()["status"] == "ok"
    catalog = client.get("/api/products").json()
    assert catalog[0]["id"] == 1
    assert catalog[0]["price"] == 39.0
    assert catalog[0]["merchant"] == "Demo Store 01"


def test_fallback_chat_matches_frontend_contract(client, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    data = client.post("/api/agent/chat", json={"message": "wireless keyboard under 50"}).json()
    assert isinstance(data["reply"], str)
    assert len(data["recommendations"]) == 3
    assert all(type(x["id"]) is int and isinstance(x["price"], float) for x in data["recommendations"])
    assert data["ai_mode"] == "catalog_fallback"


def test_propose_approve_and_tamper_guard(client):
    result = client.post("/api/purchases/propose", json={"product_id": 1, "quantity": 1})
    assert result.status_code == 200
    proposal = result.json()
    assert proposal["decision"] == "ALLOW"
    assert proposal["total_amount"] == 39.0
    assert proposal["snapshot_sha256"]
    approved = client.post(f'/api/purchases/{proposal["id"]}/approve')
    assert approved.json()["approval_status"] == "APPROVED"

    snapshot = {"id": 1, "amount": "39.00"}
    sha, mac = digests(snapshot)
    obj = SimpleNamespace(snapshot_json=snapshot, snapshot_sha256=sha, snapshot_hmac=mac, approved_sha256=sha)
    assert verify_snapshot(obj, approved=True)
    snapshot["amount"] = "399.00"
    assert not verify_snapshot(obj, approved=True)


def test_budget_blocked(client):
    proposal = client.post("/api/purchases/propose", json={"product_id": 4, "quantity": 1}).json()
    assert proposal["decision"] == "BLOCK"
    assert any(x["name"] == "TRANSACTION_LIMIT" and x["status"] == "FAIL" for x in proposal["checks"])
    assert client.post(f'/api/purchases/{proposal["id"]}/approve').status_code == 409


def test_unauthorized_merchant(client):
    proposal = client.post("/api/purchases/propose", json={"product_id": 5, "quantity": 1}).json()
    assert proposal["decision"] == "BLOCK"
    assert any(x["name"] == "MERCHANT_NOT_ALLOWED" and x["status"] == "FAIL" for x in proposal["checks"])


def test_lab_runs_real_policy_functions(client):
    expected = {
        "normal_purchase": "ALLOW",
        "budget_violation": "BLOCK",
        "prompt_injection": "BLOCK",
        "unauthorized_merchant": "BLOCK",
        "duplicate_payment": "BLOCK",
    }
    for scenario, decision in expected.items():
        result = client.post("/api/security-tests/run", json={"scenario": scenario})
        assert result.status_code == 200
        actual = result.json()
        assert actual["decision"] == decision
        assert actual["engine"] == "backend_governance"
        assert actual["payment_executed"] is False
    rows = client.get("/api/transactions").json()
    assert len(rows) == 5
    assert all("[TEST]" in r["product_name"] for r in rows)


def test_policy_requires_human_approval(client):
    response = client.put("/api/policies", json={
        "max_transaction": 50, "daily_limit": 100,
        "merchants": ["Demo Store 01"], "blocked_categories": [],
        "require_approval": False,
    })
    assert response.status_code == 422


def test_policy_version_invalidates_approved_proposal(client):
    proposal = client.post("/api/purchases/propose", json={"product_id": 1, "quantity": 1}).json()
    client.put("/api/policies", json={
        "max_transaction": 50, "daily_limit": 100,
        "merchants": ["Demo Store 01"], "blocked_categories": [],
        "require_approval": True,
    })
    assert client.post(f'/api/purchases/{proposal["id"]}/approve').status_code == 409


def test_paypal_mocked_checkout_and_duplicate(client, monkeypatch):
    monkeypatch.setattr(settings, "paypal_client_id", "fake-test-id")
    monkeypatch.setattr(settings, "paypal_client_secret", "fake-test-secret")
    state = {"purchase_id": None, "create_calls": 0, "capture_calls": 0}

    def create(purchase, request_id):
        state["purchase_id"] = purchase.id
        state["create_calls"] += 1
        return {
            "id": "ORDER-123", "status": "CREATED",
            "links": [{"rel": "payer-action", "href": "https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123"}],
        }

    def get(order_id):
        return {
            "id": order_id, "status": "APPROVED",
            "purchase_units": [{"custom_id": state["purchase_id"], "amount": {"currency_code": "USD", "value": "39.00"}}],
        }

    def capture(order_id, request_id):
        state["capture_calls"] += 1
        return {
            "id": order_id, "status": "COMPLETED",
            "purchase_units": [{
                "custom_id": state["purchase_id"],
                "amount": {"currency_code": "USD", "value": "39.00"},
                "payments": {"captures": [{"id": "CAP-123", "status": "COMPLETED", "amount": {"currency_code": "USD", "value": "39.00"}}]},
            }],
        }

    monkeypatch.setattr(main.paypal, "create", create)
    monkeypatch.setattr(main.paypal, "get", get)
    monkeypatch.setattr(main.paypal, "capture", capture)

    proposal = client.post("/api/purchases/propose", json={"product_id": 1, "quantity": 1}).json()
    assert client.post(f'/api/purchases/{proposal["id"]}/approve').status_code == 200
    first = client.post("/api/paypal/orders", json={"proposal_id": proposal["id"]})
    assert first.status_code == 200, first.text
    assert first.json()["order_id"] == "ORDER-123"
    retry = client.post("/api/paypal/orders", json={"proposal_id": proposal["id"]})
    assert retry.status_code == 200
    assert state["create_calls"] == 1
    capture_result = client.post("/api/paypal/orders/ORDER-123/capture")
    assert capture_result.status_code == 200, capture_result.text
    assert capture_result.json()["capture_id"] == "CAP-123"
    duplicate = client.post("/api/paypal/orders/ORDER-123/capture")
    assert duplicate.json()["duplicate_prevented"] is True
    assert state["capture_calls"] == 1
    rows = client.get("/api/transactions").json()
    assert rows[0]["payment_status"] == "COMPLETED"

def test_security_lab_ignores_real_spending(client, monkeypatch):
    from decimal import Decimal
    from app import main

    # Simulate $78 already spent in the real workflow.
    monkeypatch.setattr(
        main,
        "today_total",
        lambda db: Decimal("78.00"),
    )

    # A new real $39 purchase must still be blocked.
    real = client.post(
        "/api/purchases/propose",
        json={"product_id": 1, "quantity": 1},
    )

    assert real.status_code == 200
    assert real.json()["decision"] == "BLOCK"

    # The isolated Security Test Lab should allow
    # the same product under its fresh test budget.
    lab = client.post(
        "/api/security-tests/run",
        json={"scenario": "normal_purchase"},
    )

    assert lab.status_code == 200

    result = lab.json()

    assert result["decision"] == "ALLOW"
    assert result["rule"] == "ALL_CHECKS_PASSED"
    assert result["fixture_used"] is True
    assert result["payment_executed"] is False
