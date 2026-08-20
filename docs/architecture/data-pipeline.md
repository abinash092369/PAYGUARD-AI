# PayGuard AI — Data Pipeline & Synthetic Data Architecture

## Overview
PayGuard AI relies on a high-fidelity synthetic transaction pipeline engineered to emulate real-world payment telemetry, user behavior, and multi-vector fraud attacks.

---

## Data Flow Architecture

```text
Synthetic Generator (generate_data.py)
        ↓
data/transactions.csv (50,000+ records)
        ↓
Validation & Quality Checks (validate_data.py)
        ↓
Exploratory Analysis & Visualizations (explore_data.py)
        ↓
SQLAlchemy Database Seeding / Direct Ingestion
        ↓
FastAPI Backend Services (/api/transactions, /api/transactions/stats)
        ↓
React + Vite Dashboard Frontend (Axios API Layer)
```

---

## Feature Definitions (25 Schema Fields)

| Field Name | Type | Description |
|---|---|---|
| `transaction_id` | String | Unique transaction identifier (`TXN_XXXXXXXX`) |
| `user_id` | String | Unique user profile identifier (`USR_XXXXX`) |
| `merchant_id` | String | Unique merchant entity identifier (`MER_XXXX`) |
| `amount` | Float | Transaction amount in target currency (INR) |
| `currency` | String | ISO currency code (default: `INR`) |
| `transaction_timestamp` | ISO String | Datetime stamp of transaction execution (`YYYY-MM-DD HH:MM:SS`) |
| `payment_method` | String | Payment rail used (`UPI`, `CREDIT_CARD`, `DEBIT_CARD`, `NET_BANKING`, `WALLET`) |
| `device_id` | String | Hardware device fingerprint (`DEV_XXXXXX`) |
| `ip_address` | String | IPv4 address of origin |
| `country` | String | Two-letter ISO country code (`IN`, `US`, `GB`, `SG`, `AE`) |
| `merchant_category` | String | Industry category (`ecommerce`, `travel`, `gaming`, `electronics`, etc.) |
| `customer_age` | Integer | Customer age in years |
| `account_age_days` | Integer | Account age in days |
| `transaction_count_24h` | Integer | Total transaction count in trailing 24 hours |
| `transaction_amount_24h` | Float | Cumulative transaction value in trailing 24 hours |
| `failed_transactions_24h` | Integer | Count of failed payment attempts in trailing 24 hours |
| `previous_transaction_amount` | Float | Amount of the immediate prior transaction |
| `distance_from_previous_transaction` | Float | Distance in km between current and prior transaction origins |
| `is_new_device` | Integer (0/1) | Flag indicating first-time device usage for user |
| `is_new_ip` | Integer (0/1) | Flag indicating first-time IP address usage for user |
| `is_international` | Integer (0/1) | Flag indicating international transaction origin |
| `hour_of_day` | Integer (0-23) | Local hour of day |
| `velocity_score` | Float (0-1) | Normalized transaction frequency score |
| `chargeback_history` | Integer (0/1) | Historical chargeback incidence flag |
| `fraud_label` | Integer (0/1) | Target classification label (0 = Legitimate, 1 = Fraudulent) |

---

## Fraud Pattern Typologies
1. **Account Takeover (ATO)**: Sudden combination of new device + new IP + high geographic jump + large transaction amount.
2. **Velocity Burst**: High volume of transactions within a 24-hour window accompanied by multiple pre-transaction failures.
3. **Impossible Travel**: Geographical distance between consecutive transactions exceeding physical transport limits within time deltas.
4. **Merchant & Category Anomalies**: High-risk categories (`crypto`, `gaming`, `electronics`) initiated from newly bound hardware devices.
5. **Chargeback Recidivism**: High velocity or new hardware binding associated with historically flagged accounts.
