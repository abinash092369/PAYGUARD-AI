# PayGuard AI — Intelligent Payment Fraud Detection & Risk Engine

**Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

PayGuard AI is an intelligent payment fraud detection and real-time risk engine designed to analyze transaction telemetry, compute 0–100 risk scores, enforce automated decision policies (`ALLOW`, `REVIEW`, `BLOCK`), generate human-interpretable explanations, and provide automated security alert management for risk analysts.

---

## System Architecture

```text
payguard-ai/
├── frontend/             # Vite + React 18 + Tailwind CSS + Recharts + Lucide UI
├── backend/              # FastAPI + SQLAlchemy + Pydantic REST API
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
  - Manual Risk Analyzer console with interactive inputs and demo presets ("Normal Clean", "Suspicious Spikes", "Critical ATO Vector").
- **Phase 6 Alerts, Risk Analytics & Transaction Monitoring**:
  - Automated Alert Generation & Deduplication Engine (`AlertService`).
  - Alert Triage Workflow Console (`OPEN` -> `INVESTIGATING` -> `RESOLVED` / `DISMISSED`).
  - High-Risk Queue & Critical Transaction Monitoring endpoints.
  - Recharts Risk Analytics with Merchant Category Risk, Payment Rail Risk, and Time-Range Filters (7d, 30d, 90d, All).

---

## API Endpoints

### Alert APIs
- `GET /api/alerts`: Paginated list of security alerts (`status`, `severity`, `risk_level`, `search`).
- `GET /api/alerts/stats`: Summary counts (`total`, `open`, `investigating`, `resolved`, `dismissed`, `critical`, `high`).
- `GET /api/alerts/recent`: Recent alerts stream (`limit`).
- `GET /api/alerts/{id}`: Detailed alert payload with underlying transaction telemetry.
- `PATCH /api/alerts/{id}`: Update alert status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`).

### Analytics APIs
- `GET /api/analytics/fraud-rate`: Aggregated fraud rate trends over time.
- `GET /api/analytics/risk-trends`: Risk level distribution over time.
- `GET /api/analytics/risk-signals`: Frequency distribution of risk factor codes.
- `GET /api/analytics/merchant-risk`: Fraud statistics grouped by merchant category.
- `GET /api/analytics/payment-method-risk`: Fraud statistics grouped by payment rail.

### Monitoring Queue APIs
- `GET /api/monitoring/high-risk`: High-risk transactions queue (score >= 50).
- `GET /api/monitoring/critical`: Critical-risk transactions queue (score >= 75).
- `GET /api/monitoring/summary`: Real-time monitoring KPI summary.

### Dashboard & Risk APIs
- `GET /api/dashboard/stats`: Aggregate volume, fraud count, fraud rate, and risk counts.
- `POST /api/risk/analyze`: Evaluates payload and returns score, decision, and risk factors.
- `GET /api/transactions`: Server-side searchable, filtered, and paginated transaction list.

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
