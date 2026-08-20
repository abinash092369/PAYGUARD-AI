# PayGuard AI — Internship Project Description

**Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

## Executive Overview

**PayGuard AI** is an AI-powered payment fraud detection and risk intelligence platform that evaluates payment transactions using machine learning, behavioral risk signals, explainable risk scoring, and automated security alerts. The platform integrates Razorpay Test Mode to simulate a realistic payment workflow and demonstrates how payment events can be evaluated for potential fraud.

---

## Technical Highlights

1. **Synthetic Payment Telemetry Engine**:
   - 50,000 synthetic transaction records modeling realistic payment velocity, device fingerprinting, IP geolocation anomalies, and chargeback signals.

2. **Machine Learning Model Pipeline**:
   - Random Forest Classifier evaluated against Logistic Regression and Gradient Boosting, achieving $F1=0.9658$ and $\text{PR-AUC}=0.9915$.

3. **Calibrated Risk Engine & Decision Policy**:
   - Maps raw model fraud probability into calibrated 0–100 risk scores and 4 distinct risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), enforcing automated policy recommendations (`ALLOW`, `REVIEW`, `BLOCK`).

4. **Grounded Explainability Engine**:
   - Detects 11 explainable threat factor codes (e.g. `HIGH_TRANSACTION_VELOCITY`, `NEW_DEVICE`, `ACCOUNT_TOO_NEW`, `CHARGEBACK_HISTORY`) and synthesizes natural-language threat summaries.

5. **Security Alert Triage Lifecycle**:
   - Automated alert generation and deduplication engine managing analyst triage workflows (`OPEN` -> `INVESTIGATING` -> `RESOLVED` / `DISMISSED`).

6. **Server-Side Razorpay Test Mode Integration**:
   - Server-side order creation in paise, HMAC-SHA256 signature verification, Razorpay Checkout UI popup integration, and post-checkout risk scoring audit logs.
