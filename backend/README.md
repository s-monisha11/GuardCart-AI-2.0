# GuardCart AI 2.0 Backend — Matched to Existing React Frontend

This backend deliberately matches `s-monisha11/GuardCart-AI-2.0` frontend service contracts as inspected on 2026-11-12.

## MVP security limitations

- This is a **hackathon prototype**, not a production-safe multi-user payment service.
- The API uses a single demonstration user **without authentication**. Do **not** enable live PayPal or run production money through it.
- Keep PayPal in **Sandbox**. For a public internet deployment, add authenticated sessions, per-user authorization checks, HTTPS, anti-CSRF safeguards (if using cookies), rate limiting, and observability.
- Start with local SQLite if C: storage is limited. To claim concurrency-safe daily spending enforcement, switch to PostgreSQL; SQLite ignores `SELECT FOR UPDATE` locking semantics.
- The Security Test Lab's duplicate scenario uses an explicitly labeled fixture until a Sandbox capture has been completed. It invokes the same capture guard but **does not send a second PayPal capture**.
- The prompt-injection example demonstrates independent budget enforcement, not universal malicious-text detection.
- This MVP uses SQLAlchemy `create_all`; production needs Alembic migrations.

## Quick start (Windows PowerShell)

```powershell
cd C:\Users\Master\Desktop\GuardCart-Workspace\GuardCart-AI-2.0\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
notepad .env
python -m pytest -q
python -m uvicorn app.main:app --reload --port 8000
```

Paste your generated signing secret into `APP_SIGNING_SECRET` in `.env`. Add Gemini and PayPal Sandbox credentials to run real provider requests. Never share or commit `.env`.

You can use SQLite without Docker. For PostgreSQL, run `docker compose up -d db` and change `DATABASE_URL` to `postgresql+psycopg://guardcart:change_me@localhost:5432/guardcart`.

Open `http://127.0.0.1:8000/docs`.

## Frontend connection

Frontend `.env`:

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart Vite after editing `.env`.

The existing frontend's `ProductCatalog` has IDs 1–3, which match the backend seeded products. The Security Test Lab uses two additional products, IDs 4 and 5. The integration kit includes a small optional patch that enables AI-recommended product review in live mode and connects the Policies screen to FastAPI.

## PayPal redirect and capture flow

1. `POST /api/purchases/propose` with `{ "product_id": 1, "quantity": 1 }`.
2. `POST /api/purchases/{id}/approve`.
3. `POST /api/paypal/orders` with `{ "proposal_id": "{id}" }`.
4. Open returned HTTPS `approval_url` in the Sandbox buyer account.
5. PayPal redirects to `PAYPAL_RETURN_URL` (`http://localhost:5173/payment-return?token=...`).
6. Click `Confirm Sandbox Payment`. Frontend calls `POST /api/paypal/orders/{id}/capture`.
7. Backend verifies PayPal amount/currency and capture ID, then records `COMPLETED`.

## Contract examples

### `POST /api/agent/chat`

Request:

```json
{ "message": "Find a wireless keyboard for under $50" }
```

Response shape:

```json
{
  "reply": "Here are suitable products from the demo catalog.",
  "recommendations": [
    {"id": 1, "name": "Logitech K380 Wireless Keyboard", "price": 39, "merchant": "Demo Store 01", "description": "Compact wireless keyboard with multi-device support.", "features": ["Bluetooth", "Compact", "Multi-device"]}
  ],
  "ai_mode": "gemini"
}
```

AI mode will be `catalog_fallback` if Gemini is not configured or its API request fails.

### `POST /api/security-tests/run`

Request:

```json
{ "scenario": "budget_violation" }
```

Response shape:

```json
{
  "decision": "BLOCK",
  "rule": "TRANSACTION_LIMIT",
  "reason": "USD 299.00 must not exceed the per-transaction limit USD 50.00",
  "reference": "uuid",
  "payment_executed": false,
  "fixture_used": false,
  "engine": "backend_governance"
}
```

### Key endpoints

- `GET /api/health`
- `GET /api/products`
- `POST /api/agent/chat`
- `GET /api/policies`
- `PUT /api/policies`
- `POST /api/purchases/propose`
- `POST /api/purchases/{id}/approve`
- `POST /api/paypal/orders`
- `POST /api/paypal/orders/{id}/capture`
- `POST /api/security-tests/run`
- `GET /api/transactions`
- `GET /api/analytics/summary`

## Test and build checkpoints

```powershell
python -m pytest -q
python -m compileall -q app tests
```

For frontend after applying patch:

```powershell
cd ..\frontend
npm run build
npm run dev
```

If a C: drive has less than 5 GB free, avoid Docker and additional npm installations until space is recovered.
