# PayGuard AI — Complete System Architecture

```mermaid
graph TD
    Client[React 18 Frontend Console] -->|HTTP / REST API| Backend[FastAPI Security Backend]
    
    subgraph Frontend Components
        Client --> Dash[Dashboard Page]
        Client --> Txn[Transactions Explorer]
        Client --> RiskAnalyzer[Manual Risk Analyzer]
        Client --> AlertPage[Alert Management Console]
        Client --> AnalyticsPage[Risk Analytics Engine]
        Client --> RazorpayPage[Razorpay Payment Simulation]
    end

    subgraph FastAPI Backend Services
        Backend --> PaymentsSvc[Payment Service - Razorpay SDK]
        Backend --> RiskSvc[Risk Analysis Engine Service]
        Backend --> AlertSvc[Alert Generation & Deduplication Service]
        Backend --> DB[SQLAlchemy Database - SQLite / PostgreSQL]
    end

    subgraph Machine Learning Fraud Engine
        RiskSvc --> FeatureEng[Feature Engineering Pipeline]
        FeatureEng --> Model[Random Forest Classifier]
        Model --> Calibration[Risk Score Calibration 0-100]
        Calibration --> Explainability[Dynamic Explainability Engine]
    end

    PaymentsSvc -->|HMAC-SHA256 Verification| RazorpayAPI[Razorpay Test Mode Server]
```

## System Workflow Summary

1. **Transaction Telemetry Intake**:
   - Accepts transaction inputs from synthetic datasets or live Razorpay test payments.
2. **Feature Engineering**:
   - Computes derived risk factors (velocity, distance, new device/IP flags, age ratios).
3. **Random Forest Inference**:
   - Generates fraud probability predictions ($P(\text{Fraud})$).
4. **Risk Score Calibration**:
   - Converts raw probability into 0–100 risk score and maps to `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
5. **Decision Policy**:
   - Enforces automated decision policy (`ALLOW` for LOW, `REVIEW` for MEDIUM/HIGH, `BLOCK` for CRITICAL).
6. **Explainability**:
   - Flags applicable threat vector codes and synthesizes natural-language explanations.
7. **Alert Engine**:
   - Automatically logs deduplicated security alerts for HIGH and CRITICAL risk levels.
