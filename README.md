# PayGuard AI — Intelligent Payment Fraud Detection & Risk Engine

**Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

PayGuard AI is an intelligent payment fraud detection and real-time risk engine designed to analyze transaction telemetry, compute 0–100 risk scores, enforce automated decision policies (`ALLOW`, `REVIEW`, `BLOCK`), and generate human-interpretable explanations for flagged threat vectors.

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
  - Risk Analytics breakdown.

---

## API Endpoints

### Dashboard APIs
- `GET /api/dashboard/stats`: Aggregate volume, fraud count, fraud rate, and risk counts.
- `GET /api/dashboard/risk-distribution`: Counts for `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `GET /api/dashboard/fraud-trends`: Daily aggregated fraud velocity over time.
- `GET /api/dashboard/risk-signals`: Top suspicious threat vector frequency counts.
- `GET /api/dashboard/recent-transactions`: Recent telemetry records stream.

### Risk APIs
- `POST /api/risk/analyze`: Evaluates transaction payload and returns score, decision, and risk factors.
- `GET /api/transactions/{id}/risk`: Real-time risk analysis for a specific transaction ID.

### Transaction APIs
- `GET /api/transactions`: Server-side searchable, filtered, and paginated transaction list.
- `GET /api/transactions/{id}`: Single transaction details lookup.
- `GET /api/transactions/stats`: Summary transaction statistics.

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
