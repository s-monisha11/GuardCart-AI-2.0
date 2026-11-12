import time
from typing import Any
import httpx
from .config import settings


class PayPalFailure(RuntimeError):
    pass


class PayPalClient:
    def __init__(self):
        self._token = None
        self._expires = 0.0

    def token(self) -> str:
        if not settings.paypal_configured:
            raise PayPalFailure("PayPal Sandbox credentials are not configured")
        if self._token and time.time() < self._expires - 60:
            return self._token
        try:
            r = httpx.post(
                f"{settings.paypal_base_url}/v1/oauth2/token",
                auth=(settings.paypal_client_id, settings.paypal_client_secret),
                data={"grant_type": "client_credentials"},
                timeout=20,
            )
            r.raise_for_status()
            data = r.json()
            self._token = data["access_token"]
            self._expires = time.time() + data.get("expires_in", 300)
            return self._token
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            raise PayPalFailure("PayPal Sandbox OAuth request failed") from exc

    def request(self, method: str, path: str, body: dict | None = None, request_id: str | None = None) -> dict:
        headers = {
            "Authorization": f"Bearer {self.token()}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        if request_id:
            headers["PayPal-Request-Id"] = request_id
        try:
            r = httpx.request(
                method, f"{settings.paypal_base_url}{path}",
                headers=headers, json=body, timeout=30,
            )
            r.raise_for_status()
            return r.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PayPalFailure(f"PayPal Sandbox {method} {path.split('?')[0]} failed; check server logs") from exc

    def create(self, purchase, request_id: str) -> dict:
        return self.request("POST", "/v2/checkout/orders", {
            "intent": "CAPTURE",
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "return_url": settings.paypal_return_url,
                        "cancel_url": settings.paypal_cancel_url,
                        "user_action": "PAY_NOW",
                        "shipping_preference": "NO_SHIPPING",
                    }
                }
            },
            "purchase_units": [{
                "reference_id": purchase.id,
                "custom_id": purchase.id,
                "description": "GuardCart AI Sandbox approved purchase",
                "amount": {"currency_code": purchase.currency, "value": f"{purchase.total_amount:.2f}"},
            }],
        }, request_id=request_id)

    def get(self, order_id: str) -> dict:
        return self.request("GET", f"/v2/checkout/orders/{order_id}")

    def capture(self, order_id: str, request_id: str) -> dict:
        return self.request("POST", f"/v2/checkout/orders/{order_id}/capture", {}, request_id=request_id)


paypal = PayPalClient()


def approve_url(response: dict) -> str | None:
    return next((item.get("href") for item in response.get("links", []) if item.get("rel") in ("approve", "payer-action")), None)


def capture_from_order(response: dict) -> dict | None:
    try:
        return response["purchase_units"][0]["payments"]["captures"][0]
    except (KeyError, IndexError, TypeError):
        return None


def order_matches_purchase(response: dict, purchase) -> bool:
    try:
        unit = response["purchase_units"][0]
        order_amount = unit["amount"]
        return (
            unit.get("custom_id") == purchase.id
            and order_amount["currency_code"] == purchase.currency
            and order_amount["value"] == f"{purchase.total_amount:.2f}"
        )
    except (KeyError, IndexError, TypeError):
        return False
