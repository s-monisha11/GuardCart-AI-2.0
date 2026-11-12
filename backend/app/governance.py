import hashlib
import hmac
import json
from decimal import Decimal
from typing import Any

from .config import settings


def amount(value: Any) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))


def evaluate(product: Any, quantity: int, policy: Any, spent_today: Decimal = Decimal("0")) -> tuple[list[dict], Decimal]:
    total = amount(product.price * quantity)
    tests = [
        ("PRODUCT_ACTIVE", product.active, "Product is active"),
        ("QUANTITY", 1 <= quantity <= 5, "Quantity must be between 1 and 5"),
        ("TRANSACTION_LIMIT", total <= amount(policy.max_transaction), f"USD {total} must not exceed the per-transaction limit USD {policy.max_transaction}"),
        ("DAILY_LIMIT", amount(spent_today) + total <= amount(policy.daily_limit), "Total must fit remaining daily spending allowance"),
        ("MERCHANT_NOT_ALLOWED", product.merchant in policy.merchants, f"Merchant {product.merchant} must be allowlisted"),
        ("BLOCKED_CATEGORY", product.category not in policy.blocked_categories, f"Category {product.category} must not be blocked"),
        ("CURRENCY", product.currency == "USD", "Only USD purchases are supported in this demo"),
    ]
    return [
        {"name": name, "status": "PASS" if passed else "FAIL", "reason": reason}
        for name, passed, reason in tests
    ], total


def first_violation(checks: list[dict]) -> dict | None:
    return next((check for check in checks if check["status"] == "FAIL"), None)


def make_snapshot(purchase_id: str, product: Any, quantity: int, total: Decimal, policy_version: int) -> dict:
    return {
        "purchase_id": purchase_id,
        "product_id": product.id,
        "name": product.name,
        "merchant": product.merchant,
        "quantity": quantity,
        "unit_price": f"{amount(product.price):.2f}",
        "amount": f"{amount(total):.2f}",
        "currency": product.currency,
        "policy_version": policy_version,
    }


def digests(snapshot: dict) -> tuple[str, str]:
    canonical = json.dumps(snapshot, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    sha = hashlib.sha256(canonical).hexdigest()
    mac = hmac.new(settings.app_signing_secret.encode(), canonical, hashlib.sha256).hexdigest()
    return sha, mac


def verify_snapshot(purchase: Any, approved: bool = False) -> bool:
    sha, mac = digests(purchase.snapshot_json)
    good = hmac.compare_digest(sha, purchase.snapshot_sha256) and hmac.compare_digest(mac, purchase.snapshot_hmac)
    if approved:
        good = good and hmac.compare_digest(purchase.approved_sha256 or "", purchase.snapshot_sha256)
    return good


def duplicate_capture_guard(state: str) -> tuple[bool, str, str]:
    if state == "COMPLETED":
        return False, "DUPLICATE_CAPTURE", "Payment is already completed; a second capture is forbidden"
    if state in {"CAPTURE_IN_PROGRESS", "CAPTURE_UNKNOWN"}:
        return False, "PAYMENT_IN_PROGRESS", "Capture is in progress or requires reconciliation"
    return True, "CAPTURE_ALLOWED", "No completed capture is recorded"
