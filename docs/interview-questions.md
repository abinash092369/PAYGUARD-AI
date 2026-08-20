# PayGuard AI — Technical Interview Preparation Guide

**15 Technical Questions & Expert Answers for Razorpay AI Risk Manager Track 2**

---

### Q1: Explain PayGuard AI in one minute.
**Answer**: PayGuard AI is an intelligent payment fraud detection and real-time risk engine. It ingests transaction telemetry, executes a trained Random Forest classifier, computes a calibrated 0–100 risk score, enforces automated decision policies (`ALLOW`, `REVIEW`, `BLOCK`), generates grounded explainability factors, manages security alert triage workflows, and integrates with Razorpay Test Mode checkout for server-side HMAC signature verification.

---

### Q2: Why did you choose a Random Forest model over Deep Learning or XGBoost?
**Answer**: In payment risk engines, tabular transaction data features non-linear interactions (e.g., new device + international IP + high velocity). Random Forest provided superior F1-score (0.9658) and PR-AUC (0.9915) on our imbalanced synthetic dataset while providing fast, deterministic inference (<15ms per request) and robust feature importance interpretability without requiring complex GPU infrastructure.

---

### Q3: How did you handle class imbalance in the training data?
**Answer**: Fraud represents a rare event (~4–5% in our dataset). We used `stratified` train/test splits, tuned class weight parameters (`class_weight='balanced'`), and prioritized Precision-Recall AUC (PR-AUC) over standard ROC-AUC during model evaluation.

---

### Q4: How is the 0–100 risk score calibrated?
**Answer**: The raw model output is a fraud probability $P(\text{Fraud}) \in [0, 1]$. We calibrate this into a 0–100 integer score using a piecewise mapping function:
- $0 \le P < 0.15 \rightarrow \text{Score } 0–24$ (`LOW`)
- $0.15 \le P < 0.50 \rightarrow \text{Score } 25–49$ (`MEDIUM`)
- $0.50 \le P < 0.80 \rightarrow \text{Score } 50–74$ (`HIGH`)
- $P \ge 0.80 \rightarrow \text{Score } 75–100$ (`CRITICAL`)

---

### Q5: How does the explainability engine work?
**Answer**: Rather than returning black-box probabilities, PayGuard AI evaluates 11 grounded risk factor rules against telemetry features (e.g. `HIGH_TRANSACTION_VELOCITY`, `NEW_DEVICE`, `ACCOUNT_TOO_NEW`, `CHARGEBACK_HISTORY`). Identified factors are returned as structured codes with dynamic human-readable explanation sentences.

---

### Q6: How does the Razorpay signature verification work?
**Answer**: Upon checkout completion, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. Our backend computes HMAC-SHA256 over `f"{razorpay_order_id}|{razorpay_payment_id}"` using `RAZORPAY_KEY_SECRET` and asserts exact equality with the received signature.

---

### Q7: How are secret keys protected?
**Answer**: `RAZORPAY_KEY_SECRET` exists strictly within server-side environment variables and is never exposed to frontend React code or REST response payloads. Frontend code only receives the public `VITE_RAZORPAY_KEY_ID`.

---

### Q8: How does alert generation and deduplication work?
**Answer**: When a transaction risk score reaches $\ge 50$ (`HIGH`) or $\ge 75$ (`CRITICAL`), `AlertService` checks for existing active alerts (`OPEN` or `INVESTIGATING`) associated with that transaction ID. If found, it updates severity; otherwise, it creates a new deduplicated `Alert` record.

---

### Q9: How are database transactions handled?
**Answer**: Using SQLAlchemy ORM sessions (`get_db` dependency), each API request executes in an isolated transaction context. In SQLite/PostgreSQL, schema creation and auto-migrations run deterministically at startup.

---

### Q10: How would you scale PayGuard AI for production at Razorpay?
**Answer**: For production scale:
1. Replace synchronous SQLite with managed PostgreSQL & Redis caching.
2. Move feature aggregation to a real-time feature store (e.g. Feast) backed by Kafka stream processing.
3. Deploy backend microservices to Kubernetes with horizontal pod autoscaling.
4. Implement pre-authorization integration via payment webhooks.

---

### Q11: What API security features were implemented?
**Answer**: Input validation schemas via Pydantic V2, restricted CORS origins, HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`), global exception handling suppressing stack traces, and request logging.

---

### Q12: Why synthetic data instead of real transaction data?
**Answer**: Real payment telemetry contains sensitive PII and PCI-DSS data subject to strict legal and privacy regulations. Generating synthetic dataset with realistic statistical distributions permitted full open-source development without privacy risk.

---

### Q13: What happens when an alert status is updated?
**Answer**: Analysts use `PATCH /api/alerts/{id}` to transition alerts from `OPEN` to `INVESTIGATING` to `RESOLVED` or `DISMISSED`. Audit logs track status updates for compliance.

---

### Q14: How does frontend handle network or API failures?
**Answer**: The React frontend uses Axios client interceptors with 10-second timeouts, graceful empty/loading/error state UI cards, and a global React `ErrorBoundary` component preventing white-screen crashes.

---

### Q15: What are the primary limitations of the current prototype?
**Answer**:
- Trained on synthetic telemetry data rather than live production streams.
- Razorpay integration evaluates risk post-checkout simulation rather than inline pre-authorization capture blocking.
- Evaluation metrics apply to the synthetic test split.
