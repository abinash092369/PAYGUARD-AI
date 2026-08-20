# PayGuard AI — Intelligent Payment Fraud Detection & Risk Engine

**Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

PayGuard AI is an intelligent payment fraud detection and real-time risk engine designed to analyze transaction telemetry, compute 0–100 risk scores, enforce automated decision policies (`ALLOW`, `REVIEW`, `BLOCK`), generate human-interpretable explanations, provide automated security alert management, and integrate seamlessly with Razorpay Test Mode checkout.

---

## System Architecture

```text
payguard-ai/
├── frontend/             # Vite + React 18 + Tailwind CSS + Recharts + Lucide UI + Razorpay Checkout
├── backend/              # FastAPI + SQLAlchemy + Pydantic + Razorpay Python SDK
├── ml-engine/            # Scikit-Learn Random Forest ML Model & Risk Engine
├── data/                 # 50,000 Synthetic Payment Transactions Dataset
├── docs/                 # System Architecture & Diagrams
```

---

## Features

- **Phase 1 Foundation**: FastAPI backend, Vite+React frontend, Python 3.11 ML environment setup.
- **Phase 2 Synthetic Dataset**: 50,000 synthetic transaction records with realistic fraud vectors.
- **Phase 3 Machine Learning Model**: Evaluated Logistic Regression, Random Forest, and Gradient Boosting. Selected **Random Forest** (F1: 0.9658, PR-AUC: 0.9915).
- **Phase 4 Risk Scoring & Explainability**:
  - Calibrated 0–100 Risk Score & Levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Automated Decision Engine (`ALLOW`, `REVIEW`, `BLOCK`).
  - 11 Grounded Risk Factor Detection Codes & Dynamic Explanations.
- **Phase 5 Real-Time Risk Analysis & Dashboard**:
  - Enterprise Fintech Monitoring Console with KPI cards, Fraud Velocity charts (Recharts), and Risk Level distribution.
  - Server-side searchable and paginated Transaction Telemetry Explorer.
  - Manual Risk Analyzer console with interactive inputs and demo presets.
- **Phase 6 Alerts, Risk Analytics & Transaction Monitoring**:
  - Automated Alert Generation & Deduplication Engine (`AlertService`).
  - Alert Triage Workflow Console (`OPEN` -> `INVESTIGATING` -> `RESOLVED` / `DISMISSED`).
  - High-Risk Queue & Critical Transaction Monitoring endpoints.
- **Phase 7 Razorpay Test-Mode Payment Integration**:
  - Server-Side Razorpay Test Mode Order Creation & HMAC-SHA256 Signature Verification.
  - Razorpay Checkout modal UI integration.
  - Real-Time post-checkout risk scoring & automatic security alert generation.
  - Test payment history audit log (`GET /api/payments`).

---

## Environment Variables (.env)

```env
DATABASE_URL=sqlite:///./payguard.db
FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestKeySecretHere

VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

---

## Prototype Limitations & Security Disclaimer

> [!IMPORTANT]
> **Prototype Disclaimer**: PayGuard AI is an independent academic/internship prototype developed for the Razorpay AI Builder 2026 Track 2.
> - Uses Razorpay Test Mode credentials only.
> - Never processes real funds or live cardholder credentials.
> - Post-authorization risk recommendations do not alter Razorpay production capture rules.

---

## How to Run locally

### 1. Run Backend Server
```bash
cd payguard-ai/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will run at `http://127.0.0.1:8000`. Swagger API docs available at `http://127.0.0.1:8000/docs`.

### 2. Run Frontend Dashboard
```bash
cd payguard-ai/frontend
npm run dev
```
Frontend console will run at `http://localhost:5173`.

### 3. Run Automated Tests
- **ML Engine Tests**: `cd ml-engine && python -m unittest discover tests`
- **Backend API Tests**: `cd backend && python -m pytest tests`
- **Frontend Build Verification**: `cd frontend && npm run build`
