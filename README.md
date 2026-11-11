# 🛡️ GuardCart AI 2.0
### Secure Agentic Commerce with Explainable Payment Governance

**Let AI Shop. Keep Humans in Control.**

GuardCart AI 2.0 is an AI-powered shopping platform designed to combine intelligent product recommendations with independent financial safety checks, human purchase approval, and PayPal payment processing.

Developed for the **PayPal AI Hackathon 2026**.

## 🎯 Project Overview

AI shopping agents can discover products and suggest purchases, but financial transactions require stronger controls.

GuardCart introduces a **Financial Safety Gateway** between the AI shopping agent and the payment system.

The intended workflow is:

1. The user asks the AI assistant to find a product.
2. The AI recommends suitable products.
3. The user selects a product and submits a purchase proposal.
4. The Financial Safety Gateway validates the proposed purchase.
5. The user explicitly approves an eligible transaction.
6. PayPal Sandbox handles payment authorization.
7. The backend verifies payment capture.
8. The transaction appears in the audit dashboard.

**The AI recommends. The security gateway validates. The human authorizes.**

## ✨ Features

### Frontend

The React frontend includes the following implemented or prepared interfaces:

- **Overview Dashboard:** Transaction statistics, recent activity, and quick navigation.
- **AI Shopping Assistant:** Conversational shopping UI with demo recommendations, loading states, and error handling.
- **Product Catalog:** Searchable product listings and product details.
- **Product Comparison:** Comparison of product prices, merchants, and features.
- **Purchase Approvals:** Quantity selection, order summary, security decisions, and human approval interface.
- **Security Test Lab:** Demonstration of normal purchases, budget violations, prompt injection, unauthorized merchants, and duplicate payments.
- **Transaction History:** AG Grid table with search, filtering, sorting, pagination, and CSV export.
- **Security Analytics:** AG Charts for transaction outcomes and security-rule violations.
- **Spending Policies:** Interface for transaction limits, daily budgets, merchant restrictions, and approval requirements.
- **Settings:** Application configuration and backend connectivity checks.
- **PayPal Checkout UI:** Sandbox checkout redirect and payment return screens, pending backend integration.

### Backend — 

The backend is responsible for:

- FastAPI REST endpoints
- PostgreSQL transaction and audit records
- AI shopping agent
- Deterministic Financial Safety Gateway
- Budget and merchant validation
- Purchase approval enforcement
- SHA-256 order snapshot integrity
- Idempotency and duplicate payment prevention
- PayPal Orders v2 integration
- Security scenario testing

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| API Client | Axios |
| Data Tables | AG Grid |
| Analytics | AG Charts |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| AI Agent | To be finalized by backend team |
| Payments | PayPal Sandbox |
| Frontend Hosting | Vercel (planned) |
| Backend Hosting | Render (planned) |

## 📁 Project Structure

```text
GuardCart-AI-2.0/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── shopping/
│   │   │   ├── purchase/
│   │   │   ├── payment/
│   │   │   ├── security/
│   │   │   └── transactions/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── data/
│   │   ├── types/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   ├── AppRoutes.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

The backend directory structure will be documented after the backend implementation is finalized.

## 🚀 Running the Frontend Locally

### Prerequisites

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/s-monisha11/GuardCart-AI-2.0.git
cd GuardCart-AI-2.0
```

### 2. Open the frontend directory

```bash
cd frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file inside `frontend/`.

```env
VITE_DEMO_MODE=true
VITE_API_BASE_URL=http://localhost:8000
```

**Demo mode** uses simulated shopping, transaction, and security data. It does not process real payments.

### 5. Start the development server

```bash
npm run dev
```

Open:

`http://localhost:5173`

### 6. Verify the production build

```bash
npm run build
```

## 🔌 Proposed Backend API Integration

The frontend services currently expect these endpoints. The backend team must confirm the final endpoint names and request/response structures.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/agent/chat` | AI shopping recommendations |
| POST | `/api/security-tests/run` | Security scenario execution |
| POST | `/api/purchases/propose` | Validate purchase proposal |
| POST | `/api/purchases/{id}/approve` | Record human approval |
| POST | `/api/paypal/orders` | Create PayPal order |
| POST | `/api/paypal/orders/{id}/capture` | Capture authorized payment |
| GET | `/api/transactions` | Retrieve transaction history |
| GET | `/api/health` | Check backend availability |

All payment-sensitive validation and transaction operations must be performed on the backend.

## 🔐 Security Model

GuardCart is designed around independent payment governance.

Key planned controls include:

- Transaction spending limits
- Merchant allow-list validation
- Product price and quantity verification
- Human approval before payment
- SHA-256 order snapshot verification
- Idempotent payment capture
- Duplicate payment prevention
- Prompt-injection resistance
- Explainable allow/block decisions

Frontend validations are for user experience only. The backend must enforce every financial security control independently.

## 🧪 Security Test Lab

Five scenarios are included in the demonstration interface:

| Scenario | Expected Gateway Decision |
|---|---|
| Normal Purchase | ALLOW |
| Budget Violation | BLOCK |
| Prompt Injection | BLOCK |
| Unauthorized Merchant | BLOCK |
| Duplicate Payment | BLOCK |

Demo results are simulated. Real security test results require the backend gateway and test endpoints.

## 📊 Transaction Monitoring

The transaction interface uses AG Grid to display purchase and payment records.

The analytics dashboard uses AG Charts to visualize transaction outcomes and security violations.

Both interfaces are prepared to use transaction records returned by FastAPI.


## 👥 Team Responsibilities

**Frontend Developer**

Responsible for React UI development, TypeScript components, routing, product comparison, dashboards, AG Grid, AG Charts, API integration, frontend testing, and frontend deployment.

**Backend Developer**

Responsible for FastAPI, PostgreSQL, AI agent orchestration, financial security enforcement, PayPal Sandbox integration, order integrity, idempotency, and backend testing.

Both developers collaborate on API integration and end-to-end verification.



## 🏆 Hackathon

**Event:** PayPal AI Hackathon 2026

**Project:** GuardCart AI 2.0

**Category:** AI-powered agentic commerce and secure payment governance

**Repository:** https://github.com/s-monisha11/GuardCart-AI-2.0

---

**GuardCart AI 2.0 — Let AI Shop. Keep Humans in Control.**
