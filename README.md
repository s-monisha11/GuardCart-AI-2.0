# 🛡️ GuardCart AI 2.0

### Secure Agentic Commerce with Explainable Payment Governance

**Let AI Shop. Keep Humans in Control.**

[![Python](https://img.shields.io/badge/Python-FastAPI-009688)](backend/) [![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6)](frontend/) [![Payments](https://img.shields.io/badge/PayPal-Sandbox-003087)](https://developer.paypal.com/) [![Tests](https://img.shields.io/badge/Backend%20Tests-10%20Passing-2ea44f)](backend/tests/)

**GuardCart AI 2.0** is a full-stack hackathon prototype that combines a Gemini-powered shopping assistant with a **separate, deterministic Financial Safety Gateway**. The AI recommends products; backend policies validate the proposed purchase; a human explicitly approves; and PayPal **Sandbox** handles checkout. Every outcome is recorded for review.

Built for the **PayPal AI Hackathon 2026**.

**Repository:** https://github.com/s-monisha11/GuardCart-AI-2.0

> **Scope:** This is a **demo-user, Sandbox-only MVP**, not a production-ready financial service. Do not connect it to live PayPal funds or publicly expose its unauthenticated payment endpoints.

---

## The Problem

An AI shopping agent can recommend attractive products, but recommendations alone should never be sufficient to spend money. Real purchases require explicit consent, bounded spending, trusted catalog values, merchant restrictions, protection from duplicate capture, and an understandable audit trail.

## Our Solution

**GuardCart separates the AI's recommendation authority from payment authority.** The shopping assistant cannot create or approve payments. An independent FastAPI gateway evaluates structured catalog data against financial policies, checks snapshot integrity, requires human approval, and orchestrates Sandbox payment processing.

### End-to-end flow

```text
User prompt
    |
    v
Gemini shopping assistant ──> Trusted product catalog
    |                              |
    v                              v
Product recommendations ──> Purchase proposal
                                   |
                                   v
                       Financial Safety Gateway
                       - Per-transaction spending cap
                       - Daily remaining allowance
                       - Merchant and category policy
                       - Price / quantity / currency checks
                                   |
                         +---------+---------+
                         |                   |
                       BLOCK                ALLOW
                         |                   |
                         v                   v
                    Audit trail       Human approval
                                             |
                                             v
                                   Signed order snapshot check
                                             |
                                             v
                                   PayPal Orders v2 (Sandbox)
                                             |
                                             v
                                   Buyer approval and capture
                                             |
                                             v
                                   PostgreSQL + audit history
                                             |
                                      +------+------+
                                      |             |
                                   AG Grid       AG Charts
```

A `BLOCK` decision stops the purchase workflow before a PayPal order can be created.

---

## Implemented Features

| Feature | Implementation |
|---|---|
| **AI shopping assistant** | Google Gemini recommendations from an allowlisted, budget-filtered product catalog; explicitly labeled catalog fallback if Gemini is unavailable |
| **Independent policy engine** | Server-side per-transaction and daily limits, merchant allowlist, category checks, active-product, quantity, and USD currency validation |
| **Human-in-the-loop approval** | Purchase proposals require an explicit approval API call before order creation |
| **Order integrity** | Canonical order snapshots with SHA-256 digest and HMAC; trusted catalog data and policy version are rechecked |
| **PayPal integration** | Real PayPal **Sandbox** Orders v2 `CAPTURE` flow: create order, buyer approval redirect, capture verification, persist result |
| **Duplicate capture protection** | Persisted payment state, PayPal request IDs, and return of the existing result for already completed captures |
| **Security Test Lab** | Five backend-governance test scenarios using an isolated spending fixture; no PayPal actions executed by the lab |
| **Transaction history** | AG Grid with sorting, filtering, pagination, and CSV export |
| **Security analytics** | AG Charts for payment-status outcomes and security-rule violations |
| **Audit and persistence** | SQLAlchemy-backed purchases, payments, reservations, test records, and audit events |
| **Automated verification** | 10 backend pytest tests; React/TypeScript production build verified |

### Security Test Lab scenarios

The lab invokes backend governance functions with **controlled test inputs**. Its budget checks use an isolated `$0` spent-today fixture so prior Sandbox payments do not change the expected scenario outcome.

| Scenario | Expected decision | Key rule or behavior |
|---|---|---|
| Normal purchase ($39) | `ALLOW` | `ALL_CHECKS_PASSED` |
| Budget violation ($299) | `BLOCK` | `TRANSACTION_LIMIT` |
| Prompt-injection example | `BLOCK` | `TRANSACTION_LIMIT`; untrusted product description cannot override this backend rule |
| Unauthorized merchant | `BLOCK` | `MERCHANT_NOT_ALLOWED` |
| Duplicate completed payment | `BLOCK` | `DUPLICATE_CAPTURE`; evaluated without another capture request |

**Important distinctions:** The prompt-injection example demonstrates **separation of untrusted AI/product text from backend financial enforcement**, not universal prompt-injection detection. The lab logs `[TEST]` entries that may also appear in transaction history and analytics; those entries **are not PayPal payments**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router |
| UI | Tailwind CSS, Lucide React |
| Data grid | AG Grid Community |
| Analytics | AG Charts Community |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| AI | Google Gemini via `google-genai`; catalog fallback |
| Database | PostgreSQL (recommended); SQLite for lightweight local evaluation |
| Payments | PayPal REST Orders v2, **Sandbox only** |
| Testing | pytest, FastAPI TestClient, TypeScript compiler, Vite build |
| Packaging | Backend Dockerfile and PostgreSQL Docker Compose service |

## Repository Structure

```text
GuardCart-AI-2.0/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI routes and payment orchestration
│   │   ├── agent.py            # Gemini agent and catalog fallback
│   │   ├── governance.py       # Financial rules and order integrity
│   │   ├── paypal.py           # PayPal Sandbox REST client
│   │   ├── models.py           # Database models
│   │   ├── database.py         # SQLAlchemy engine and sessions
│   │   ├── config.py           # Environment settings
│   │   └── seed.py             # Seed products and demonstration policy
│   ├── tests/                 # 10 automated backend tests
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/              # Shopping, approvals, lab, analytics, etc.
│   │   ├── services/           # API and domain services
│   │   ├── data/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── LICENSE
└── README.md
```

---

## Quick Start — Windows PowerShell

### Requirements

- **Python 3.11+**
- **Node.js** and npm compatible with the frontend's Vite version
- **PostgreSQL** (recommended), or use local SQLite for a simpler evaluation
- **Git**
- Optional: Google Gemini API key and PayPal **Sandbox** REST app credentials

### 1. Clone the project

```powershell
git clone https://github.com/s-monisha11/GuardCart-AI-2.0.git
cd GuardCart-AI-2.0
```

### 2. Configure and start the backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

The example configuration runs with SQLite by default. For a PostgreSQL database, set `DATABASE_URL` to your PostgreSQL connection URL. You can use the included demonstration database container:

```powershell
# Optional: run from backend/ if Docker is installed
docker compose up -d db
```

Then in `backend/.env`, set the database URL to a matching local PostgreSQL instance, for example:

```dotenv
DATABASE_URL=postgresql+psycopg://guardcart:change_me@localhost:5432/guardcart
FRONTEND_ORIGIN=http://localhost:5173
APP_SIGNING_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_RETURN_URL=http://localhost:5173/payment-return
PAYPAL_CANCEL_URL=http://localhost:5173/approvals
```

The password `change_me` above belongs only to the optional **local demo Docker configuration**. Replace it before any shared deployment. Generate a signing secret locally using:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copy that value into `APP_SIGNING_SECRET`; **never commit or share `backend/.env`**. The application creates demo tables and seeds sample products/policies on startup.

Start FastAPI:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Backend health: http://127.0.0.1:8000/api/health
Interactive API docs: http://127.0.0.1:8000/docs

> Without a Gemini key, the assistant uses a clearly labeled **catalog fallback**. Without PayPal Sandbox credentials, checkout endpoints are disabled, but you can still explore the policy engine and Security Test Lab.

### 3. Configure and start the frontend

Open **another PowerShell terminal** in the project root:

```powershell
cd frontend
npm install
```

Create `frontend/.env` containing:

```dotenv
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then run:

```powershell
npm run dev
```

Open **http://localhost:5173**. Keep both backend and frontend terminals running.

`VITE_DEMO_MODE=false` connects to the live local FastAPI backend; `true` uses frontend simulation data and **does not execute PayPal checkout**. Restart Vite after changing this setting.

### 4. Verify the build

Backend terminal:

```powershell
python -m pytest -q
```

Frontend terminal:

```powershell
npm run build
```

**Verified during development:** 10 backend tests passed, and the frontend production build completed. A Starlette/httpx deprecation warning and a Vite bundle-size warning were non-failing warnings.

---

## Reproduce the Demo

1. Open **AI Shopping** (`/shopping`) and ask: `Recommend a wireless keyboard under $50`.
2. Select a recommended catalog product and open **Purchase Approvals** (`/approvals`).
3. Validate the proposal. The gateway shows an explainable `ALLOW` or `BLOCK` decision and individual policy checks.
4. Explicitly approve an allowed purchase. If Sandbox credentials are configured, choose **Continue to PayPal**.
5. Approve payment using a **PayPal Sandbox buyer account**, return to GuardCart, and complete the capture. Verify the displayed capture status. **Never use a real-money buyer account.**
6. Open **Security Test Lab** (`/security-lab`) and execute all five scenarios. Expected: **1 allowed, 4 blocked**, with `payment_executed: false` for each test.
7. Open **Transaction History** (`/transactions`) to inspect recorded attempts, completed Sandbox payments, and the AG Grid audit table.
8. Open **Security Analytics** (`/analytics`) to view outcome distributions and policy violations via AG Charts.

To avoid changing the remaining daily Sandbox budget, **demonstrate an already-completed Sandbox capture from transaction history**, or start with a fresh dedicated test database if performing the entire purchase flow live.

## Main API Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend status and Sandbox configuration indicator |
| `GET` | `/api/products` | Trusted demo catalog |
| `POST` | `/api/agent/chat` | Shopping recommendations (`message`) |
| `GET` | `/api/policies` | Current financial policy |
| `PUT` | `/api/policies` | Update demo policy (human approval remains mandatory) |
| `POST` | `/api/purchases/propose` | Validate product ID and quantity |
| `POST` | `/api/purchases/{purchase_id}/approve` | Record explicit approval |
| `POST` | `/api/paypal/orders` | Create a PayPal Sandbox order for approved proposal |
| `POST` | `/api/paypal/orders/{order_id}/capture` | Verify/capture approved Sandbox payment |
| `POST` | `/api/security-tests/run` | Execute isolated backend-governance test |
| `GET` | `/api/transactions` | Purchases, payments, and clearly labeled lab entries |
| `GET` | `/api/analytics/summary` | Aggregated transaction metrics |

**Example: query the agent via PowerShell**

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/agent/chat' `
  -Method Post -ContentType 'application/json' `
  -Body '{"message":"Recommend a wireless keyboard under $50"}'
```

**Example: run an isolated security test**

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/security-tests/run' `
  -Method Post -ContentType 'application/json' `
  -Body '{"scenario":"unauthorized_merchant"}'
```

See [`backend/README.md`](backend/README.md) for additional backend contract examples and implementation notes.

---

## Security Design and Limitations

**Implemented defensive boundaries**

- AI outputs are limited to numeric IDs from the trusted catalog. The agent does **not** invoke payment APIs.
- Backend validation uses authoritative database product, merchant, amount, and policy values—not free-form AI descriptions.
- Human approval is required for purchase progression; policy changes invalidate old approval snapshots.
- Canonical order snapshots are protected with SHA-256 and a secret-key HMAC.
- Daily reservations account for both `RESERVED` and `COMPLETED` spending; PostgreSQL row locking serializes order reservation against the demo policy row.
- PayPal operations use persistent request IDs, verified amount/currency, capture-state checks, and duplicate-capture protection.
- Test Lab exercises governance rules without submitting a real capture.

**Not production-ready**

- Single shared **demo user**; no authentication, per-user authorization, or tenant isolation.
- No production hardening such as public API rate limiting, secure session management, or end-to-end deployment security review.
- SQLite is useful for local demos but does not provide PostgreSQL-equivalent row-locking behavior.
- Uses SQLAlchemy `create_all`; production schema evolution would require migrations.
- Security scenarios are intentionally scoped; they are **not** a comprehensive penetration test or generalized injection-detection system.
- Payments are **Sandbox only**. Do not configure live PayPal credentials or expose this API as a real purchasing service.

## Team and Hackathon

**Frontend:** React/TypeScript experience, purchase and checkout screens, AG Grid transaction history, AG Charts analytics, and UI integration.
**Backend:** Gemini/catalog recommendation integration, financial governance, purchase approval, PostgreSQL, PayPal Sandbox checkout, and automated testing.

**Event:** PayPal AI Hackathon 2026
**Project:** GuardCart AI 2.0 — Secure Agentic Commerce with Explainable Payment Governance
**Source:** https://github.com/s-monisha11/GuardCart-AI-2.0
**Demo video:** Link to be added to the Devpost project submission.

---

**GuardCart AI 2.0 — Let AI Shop. Keep Humans in Control.**
