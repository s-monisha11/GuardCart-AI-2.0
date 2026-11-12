# GuardCart AI 2.0 — FastAPI Backend

The backend implements **AI-assisted catalog recommendations**, an independent **Financial Safety Gateway**, explicit **human approval**, **PayPal Orders v2 Sandbox** processing, and audit-ready transaction data for the React dashboard.

> **Hackathon MVP / Sandbox only.** This is a single-user demonstration API without authentication or production payment safeguards. Do **not** connect live PayPal credentials or expose payment endpoints publicly.

For a full project overview, start with the [root README](../README.md).

## Architecture

```text
FastAPI routes (app/main.py)
  ├── Gemini recommendations + catalog fallback (app/agent.py)
  ├── Deterministic governance + order digest/HMAC (app/governance.py)
  ├── SQLAlchemy products, policies, purchases, reservations, payments, audits
  │   ├── Models: app/models.py
  │   └── Database: app/database.py
  ├── PayPal Sandbox Orders v2 client (app/paypal.py)
  └── Five isolated Security Test Lab scenarios
```

### Key properties

- **Untrusted AI output cannot authorize spending.** AI returns catalog IDs; backend governance decides on payment eligibility.
- **Policy enforcement:** per-transaction cap, daily allowance, merchant allowlist, blocked categories, product active state, quantity, and USD currency.
- **Snapshot integrity:** SHA-256 digest and secret-key HMAC over the canonical approved order snapshot. Catalog data and policy version are rechecked before checkout.
- **Human approval:** purchases must be explicitly approved before creating a PayPal order.
- **Daily reservations:** `RESERVED` and `COMPLETED` amounts count against the shared demo budget. PostgreSQL locking is used during order reservation.
- **Capture protection:** verified PayPal order amounts and currencies; persisted capture request IDs, state checks, and duplicate-return behavior for completed payments.
- **Audit evidence:** purchase/payment records, security-lab executions, and audit events.

## Windows PowerShell — Run Locally

Requires Python 3.11+ and optionally Docker or a local PostgreSQL server.

From the repository root:

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

The included `.env.example` defaults to local SQLite for easiest setup. To use PostgreSQL, start the demo database:

```powershell
docker compose up -d db
```

Then set `DATABASE_URL=postgresql+psycopg://guardcart:change_me@localhost:5432/guardcart` inside `backend/.env`, matching your local container credentials. For a manually installed PostgreSQL instance, use its real URL instead.

Generate a strong `APP_SIGNING_SECRET` with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Use only **PayPal Sandbox** credentials in `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`; set `GEMINI_API_KEY` for actual Gemini recommendations. Without these values, the agent falls back to catalog matching and checkout endpoints remain unavailable.

Start the API:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

- Health: http://127.0.0.1:8000/api/health
- Interactive API docs: http://127.0.0.1:8000/docs

In `frontend/.env`, use:

```dotenv
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Never commit `.env` files or real API credentials. The demo starts with seeded products and a default policy (`$50` per transaction; `$100` per day; `Demo Store 01` allowlisted).

## API Contract

| Method | Path | Request / result |
|---|---|---|
| `GET` | `/api/health` | API health and Sandbox configuration indicator |
| `GET` | `/api/products` | Seeded catalog |
| `POST` | `/api/agent/chat` | `{ "message": "Find a wireless keyboard under $50" }` |
| `GET` | `/api/policies` | Current policy |
| `PUT` | `/api/policies` | Update policy (human approval cannot be disabled) |
| `POST` | `/api/purchases/propose` | `{ "product_id": 1, "quantity": 1 }` |
| `POST` | `/api/purchases/{purchase_id}/approve` | Approve an eligible proposal |
| `POST` | `/api/paypal/orders` | `{ "proposal_id": "..." }` |
| `POST` | `/api/paypal/orders/{order_id}/capture` | Verify and capture a Sandbox order |
| `POST` | `/api/security-tests/run` | `{ "scenario": "normal_purchase" }` |
| `GET` | `/api/transactions` | Purchases plus clearly labeled `[TEST]` lab rows |
| `GET` | `/api/analytics/summary` | Aggregated transaction metrics |

### Shopping API response

`POST /api/agent/chat` returns:

```json
{
  "reply": "Recommendations from the trusted catalog",
  "recommendations": [
    {"id": 1, "name": "Logitech K380 Wireless Keyboard", "price": 39.0, "merchant": "Demo Store 01", "description": "Compact wireless keyboard with multi-device support.", "features": ["Bluetooth", "Compact", "Multi-device"]}
  ],
  "ai_mode": "gemini"
}
```

The illustration shows the **response shape**, not a guaranteed text response. `ai_mode` is `catalog_fallback` when Gemini is not configured or available.

## PayPal Sandbox CAPTURE Workflow

1. `POST /api/purchases/propose` checks the trusted catalog and current budget.
2. `POST /api/purchases/{id}/approve` verifies the proposal's snapshot and records human approval.
3. `POST /api/paypal/orders` rechecks policy, reserves daily spend, and creates a Sandbox order with a persistent request ID.
4. The frontend opens the returned `approval_url`. A Sandbox buyer authorizes the payment.
5. PayPal redirects to `http://localhost:5173/payment-return?token=...`.
6. The frontend invokes `POST /api/paypal/orders/{order_id}/capture`.
7. The backend verifies the order and capture; completed payments are persisted with a capture ID. Repeat calls for an already-completed payment return `duplicate_prevented: true` without a second capture.

**Do not attempt to re-capture abandoned orders**. Failed or uncertain provider responses require careful reconciliation; this MVP is not a production payment recovery service.

## Isolated Security Test Lab

The five scenarios invoke **backend governance**, not frontend-only fixture decisions. The lab uses an isolated `$0` spent-today test input, so it does not consume or reset actual spending reservations.

| Scenario ID | Expected decision | Expected rule |
|---|---|---|
| `normal_purchase` | `ALLOW` | `ALL_CHECKS_PASSED` |
| `budget_violation` | `BLOCK` | `TRANSACTION_LIMIT` |
| `prompt_injection` | `BLOCK` | `TRANSACTION_LIMIT` |
| `unauthorized_merchant` | `BLOCK` | `MERCHANT_NOT_ALLOWED` |
| `duplicate_payment` | `BLOCK` | `DUPLICATE_CAPTURE` |

Each test returns a decision, reason, rule, reference, `fixture_used`, and **`payment_executed: false`**. Duplicate-payment evaluation uses a completed local payment record when available and a labeled fixture otherwise. The prompt-injection scenario checks that an instruction embedded in an untrusted product description cannot override **this specific transaction-budget rule**; it does not claim generalized injection detection.

Example request:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/security-tests/run' `
  -Method Post -ContentType 'application/json' `
  -Body '{"scenario":"normal_purchase"}'
```

The lab inserts `[TEST]` transaction rows for auditability; **they are not live or Sandbox payment captures**.

## Tests

```powershell
python -m pytest -q
python -m compileall -q app tests
```

**Verified during implementation:** 10 pytest tests passed. Tests cover catalog contracts, fallback agent, order integrity, policy limits, merchant checks, human approval, policy-version invalidation, mocked PayPal idempotency/capture behavior, and lab spending isolation.

## Production Limitations

This code is not a deployable payment product: it has no authenticated identities, per-user authorization, HTTPS/session hardening, rate limiting, production-grade transaction reconciliation, or schema migrations. Prefer PostgreSQL for concurrency experiments; SQLite does not guarantee equivalent row-level locking. Never change the Sandbox base URL to live PayPal for this prototype.
