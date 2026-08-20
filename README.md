# PayGuard AI — Intelligent Payment Fraud Detection & Risk Engine

**Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

PayGuard AI is an intelligent payment fraud detection and real-time risk engine designed to analyze transaction telemetry, compute calibrated 0–100 risk scores, enforce automated decision policies (`ALLOW`, `REVIEW`, `BLOCK`), generate human-interpretable explanations, provide automated security alert management, and integrate seamlessly with Razorpay Test Mode checkout.

---

## Problem Statement

Modern digital payment gateways handle millions of high-velocity transactions daily. Legitimate transactions must pass frictionlessly, while sophisticated fraudulent attacks—such as Account Takeover (ATO), velocity bursts, synthetic identities, and card testing—must be identified and mitigated in real time without causing false positive friction for honest users.

## Solution

PayGuard AI combines machine learning classification, grounded risk factor rule engines, dynamic explainability, automated alert triage queues, and server-side payment gateway signature verification into a unified fintech risk management console.

---

## Key Features

- **50,000 Synthetic Payment Dataset**: Generated with realistic fraud signals (device changes, IP anomalies, velocity spikes, distance anomalies, chargeback history).
- **Machine Learning Fraud Engine**: Evaluated Logistic Regression, Random Forest, and Gradient Boosting. Selected **Random Forest Classifier** ($F1=0.9658$, $\text{PR-AUC}=0.9915$).
- **Calibrated Risk Scoring Engine**: Converts model fraud probability into 0–100 risk scores and 4 distinct risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Automated Decision Engine**: Enforces policy recommendations (`ALLOW` for LOW, `REVIEW` for MEDIUM/HIGH, `BLOCK` for CRITICAL).
- **Grounded Explainability**: Detects 11 explainable risk factor codes and synthesizes natural-language threat summaries.
- **Security Alert Lifecycle Engine**: Automatically generates and deduplicates security alerts with full triage workflow (`OPEN` -> `INVESTIGATING` -> `RESOLVED` / `DISMISSED`).
- **Razorpay Test Mode Integration**: Real-time order creation, server-side HMAC-SHA256 signature verification, checkout modal popup, and post-payment risk assessment.
- **Executive Security Console**: React 18 dashboard with interactive charts (Recharts), transaction search, manual analyzer, and analytics queues.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide UI, Razorpay Checkout SDK
- **Backend**: FastAPI, SQLAlchemy, Pydantic V2, Razorpay Python SDK, Uvicorn
- **ML Engine**: Python 3.11, Scikit-Learn, Pandas, NumPy, Joblib
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)
- **Containerization**: Docker, Docker Compose

---

## Project Structure

```text
payguard-ai/
├── frontend/             # Vite + React 18 SPA Frontend Console
│   ├── src/
│   │   ├── api/          # Axios API integration layers
│   │   ├── components/   # UI components, badges, modals, error boundary
│   │   ├── pages/        # Dashboard, Transactions, Analyze, Alerts, Analytics, Payment
│   │   └── App.jsx
├── backend/              # FastAPI Backend API Service
│   ├── app/
│   │   ├── models/       # SQLAlchemy ORM models (Transaction, Alert, Payment)
│   │   ├── routes/       # API endpoints (transactions, risk, alerts, payments, analytics)
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── services/     # PaymentService, AlertService, RiskService, DataLoader
│   │   ├── database.py   # Database connection & auto-migrations
│   │   └── main.py       # FastAPI application entrypoint & middleware
│   ├── tests/            # Pytest suite
│   └── Dockerfile
├── ml-engine/            # ML Training & Evaluation Engine
│   ├── models/           # Serialized model artifacts (.joblib, metadata)
│   ├── src/              # Feature engineering, model training, risk scoring, explainability
│   └── tests/            # Unittest test cases
├── data/                 # Synthetic Transaction Dataset (transactions.csv)
├── docs/                 # System Architecture & Demo Documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Installation & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Backend Setup & Run
```bash
cd payguard-ai/backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API runs at `http://127.0.0.1:8000`. API Swagger documentation available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup & Run
```bash
cd payguard-ai/frontend
npm install
npm run dev
```
Frontend console runs at `http://localhost:5173`.

---

## Automated Test Suite

- **ML Unit Tests**: `cd ml-engine && python -m unittest discover tests` (12/12 PASS)
- **Backend API Tests**: `cd backend && python -m pytest tests` (27+ PASS)
- **Frontend Production Build**: `cd frontend && npm run build` (PASS)

---

## Security Considerations

- **Secret Protection**: `RAZORPAY_KEY_SECRET` is strictly restricted to backend environment variables.
- **Server Signature Verification**: All Razorpay payment signatures are validated on the backend using HMAC-SHA256.
- **Sensitive Data Handling**: PayGuard AI never processes, logs, or stores card numbers, CVVs, expiry dates, or UPI PINs.
- **Input Validation**: Pydantic schemas enforce bounds on amounts, pagination, enum statuses, and IDs.
- **Security Headers**: API responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy`.

---

## Limitations & Prototype Disclaimer

> [!IMPORTANT]
> **Prototype Disclaimer**: PayGuard AI is an independent academic/internship prototype built for the Razorpay AI Builder 2026 Track 2 competition.
> - Operates on a synthetic transaction dataset and Razorpay Test Mode credentials.
> - Post-authorization risk scoring demonstrates risk engine integration without altering live Razorpay settlement rules.
> - Metrics presented apply to the project synthetic dataset and test split.
