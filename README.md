# PayGuard AI

## Intelligent Payment Fraud Detection & Risk Engine

### Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager

---

### Project Overview
PayGuard AI is an enterprise-grade payment fraud detection and risk scoring engine designed to analyze transaction telemetry, detect complex fraud attack vectors in real-time, and provide explainable risk indicators for payment managers.

> **Disclaimer**: PayGuard AI is an independent prototype built for educational and demonstration purposes as part of the Razorpay AI Builder Internship 2026 application. Prototype evaluation on synthetic payment data. It does not use Razorpay proprietary data or internal systems.

---

### Current Status
- **Phase 1**: Project Foundation — COMPLETE
- **Phase 2**: Synthetic Transaction Dataset & Pipeline — COMPLETE
- **Phase 3**: ML Fraud Detection Model — COMPLETE
- **Phase 4**: AI Risk Scoring & Explainability Engine — PLANNED

---

## Phase 3 — ML Fraud Detection Engine

PayGuard AI includes a trained machine-learning fraud detection pipeline evaluated on synthetic transaction data.

### 1. Model Pipeline
- **Feature Pipeline**: Preprocesses numerical/categorical fields and derives behavioral signals (`amount_deviation_ratio`, `risk_signal_count`, `distance_velocity_relationship`).
- **Data Leakage Safeguard**: Strict target separation with 80/20 stratified train/test split (`random_state=42`).
- **Evaluated Models**: Logistic Regression, Random Forest Classifier, and HistGradientBoostingClassifier.
- **Model Selection**: Optimizes for Recall, F1-Score, and PR-AUC on imbalanced fraud data (~4.26% fraud rate).
- **Artifacts**: Models and preprocessors serialized with `joblib` under `ml-engine/models/`.

### 2. Execution Commands

#### Train ML Engine
```bash
python ml-engine/src/train_model.py --seed 42
```

#### Evaluate Trained Model
```bash
python ml-engine/src/evaluate_model.py
```

#### Perform Model Inference
```bash
python ml-engine/src/predict.py
```

---

## API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/docs` | Swagger interactive API documentation |
| `GET` | `/api/transactions` | Paginated transaction list (`?page=1&limit=20`) |
| `GET` | `/api/transactions/{id}` | Single transaction details lookup |
| `GET` | `/api/transactions/stats` | Aggregated dataset fraud metrics |

---

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios, Recharts, Lucide React
- **Backend**: Python 3.11, FastAPI, Uvicorn, SQLAlchemy, Pydantic, SQLite
- **ML Engine**: pandas, numpy, scikit-learn, joblib, matplotlib, seaborn
