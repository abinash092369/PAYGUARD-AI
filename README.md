# PayGuard AI

## Intelligent Payment Fraud Detection & Risk Engine

### Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager

---

### Project Overview
PayGuard AI is an enterprise-grade payment fraud detection and risk scoring engine designed to analyze transaction telemetry, detect complex fraud attack vectors in real-time, and provide explainable risk indicators for payment managers.

> **Disclaimer**: PayGuard AI is an independent prototype built for educational and demonstration purposes as part of the Razorpay AI Builder Internship 2026 application. It does not use Razorpay proprietary data or internal systems.

---

### Status
- **Phase 1**: Project Foundation — COMPLETE
- **Phase 2**: Synthetic Transaction Dataset & Pipeline — COMPLETE
- **Phase 3**: ML Fraud Detection Model — PLANNED

---

## Phase 2 — Synthetic Transaction Pipeline

### 1. Dataset Architecture
The synthetic transaction pipeline generates realistic, multi-dimensional transaction telemetry for payment fraud modeling.
- **Location**: `data/transactions.csv`
- **Default Volume**: 50,000 transactions
- **Target Distribution**: ~96% Legitimate, ~4% Fraudulent (Class Imbalance)

### 2. Feature Schema (25 Attributes)
- **Identifiers**: `transaction_id`, `user_id`, `merchant_id`, `device_id`
- **Core Attributes**: `amount`, `currency`, `transaction_timestamp`, `payment_method`, `ip_address`, `country`, `merchant_category`
- **User Demographics & History**: `customer_age`, `account_age_days`, `chargeback_history`
- **Behavioral & Velocity Telemetry**: `transaction_count_24h`, `transaction_amount_24h`, `failed_transactions_24h`, `previous_transaction_amount`, `distance_from_previous_transaction`, `is_new_device`, `is_new_ip`, `is_international`, `hour_of_day`, `velocity_score`
- **Target Label**: `fraud_label` (0 = Legitimate, 1 = Fraudulent)

### 3. Domain Fraud Patterns
- **Account Takeover (ATO)**: New device + new IP + geographic distance jump + abnormal amount spike.
- **Velocity Bursts**: Rapid transaction spikes within 24h paired with preceding failed attempts.
- **Impossible Travel**: Geographic movement violating physical speed boundaries between consecutive transactions.
- **High-Risk Category Anomalies**: High-value transactions at `crypto`, `gaming`, or `electronics` merchants from unverified hardware.

### 4. Running the Pipeline

#### Generate Dataset
```bash
python ml-engine/src/generate_data.py --rows 50000 --seed 42
```

#### Validate Data Quality
```bash
python ml-engine/src/validate_data.py
```

#### Exploratory Data Analysis (EDA)
```bash
python ml-engine/src/explore_data.py
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
