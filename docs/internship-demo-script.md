# PayGuard AI — Internship Demonstration Video & Presentation Script

**Track 2: AI Risk Manager — Razorpay AI Builder Internship 2026**

**Target Duration**: 5–7 Minutes

---

## 0:00 – 0:30 | Introduction & Hook
- **Speaker**: "Hello everyone! I am excited to introduce **PayGuard AI**, an intelligent payment fraud detection and real-time risk engine built for Track 2: AI Risk Manager of the Razorpay AI Builder Internship 2026."
- **Visual**: Show PayGuard AI Header and Executive Monitoring Dashboard (`/`).
- **Key Message**: "Modern digital payment platforms like Razorpay process millions of transactions per day. The challenge is protecting legitimate transactions with zero user friction while identifying complex, high-risk fraudulent threats in real time."

---

## 0:30 – 1:15 | Problem & System Architecture
- **Speaker**: "PayGuard AI addresses this by providing an end-to-end payment security pipeline that combines machine learning classification, calibrated 0–100 risk scoring, explainable threat factor rules, automated alert triage, and server-side Razorpay Test Mode integration."
- **Visual**: Display `docs/architecture/system-architecture.md` diagram.
- **Key Message**: "Our core ML engine utilizes a **Random Forest Classifier** trained on 50,000 synthetic transactions, achieving an F1-score of **0.9658** and a Precision-Recall AUC of **0.9915**."

---

## 1:15 – 2:00 | Executive Monitoring Dashboard
- **Speaker**: "Here on our Executive Dashboard, analysts get an instant overview of system telemetry."
- **Visual**: Hover over KPI Cards (**50,000 Transactions**, **Fraud Rate**, **Active Risk Alerts**), Fraud Trend Time-Series Chart, and Risk Level Distribution.
- **Key Message**: "All metrics and charts dynamically reflect real database telemetry."

---

## 2:00 – 3:30 | Real-Time Risk Analysis & Explainability
- **Speaker**: "Let's test our real-time ML risk engine on the **Manual Risk Analyzer** console."
- **Visual**: Navigate to `/analyze`. Click **Normal Clean** preset. Click **Execute PayGuard AI Risk Assessment**.
- **Speaker**: "Notice how a normal transaction with a known device and normal velocity produces a **LOW Risk Score (10/100)** and an automated **ALLOW** decision."
- **Visual**: Click **Critical ATO Vector** preset. Click **Execute PayGuard AI Risk Assessment**.
- **Speaker**: "Now, when we simulate an Account Takeover attempt—with an unknown device, international IP, 16 transactions in 24 hours, and prior chargeback history—PayGuard AI computes a **CRITICAL Risk Score (95/100)** and issues an automated **BLOCK** recommendation."
- **Key Message**: "Notice the grounded **Risk Factor** badges: `HIGH_TRANSACTION_VELOCITY`, `NEW_DEVICE`, `ACCOUNT_TOO_NEW`, and `CHARGEBACK_HISTORY`."

---

## 3:30 – 4:15 | Security Alert Lifecycle Management
- **Speaker**: "Because this transaction breached our critical risk threshold, PayGuard AI automatically generated a deduplicated security alert."
- **Visual**: Navigate to `/alerts`. Click the newly created `CRITICAL` alert to open the **Alert Investigation Drawer**.
- **Speaker**: "Security analysts can inspect underlying telemetry and update alert status from `OPEN` to `INVESTIGATING` to `RESOLVED`."

---

## 4:15 – 5:30 | Razorpay Test Mode Payment Integration
- **Speaker**: "Now let's see how PayGuard AI integrates with **Razorpay Test Mode** checkout."
- **Visual**: Navigate to `/payment`. Show the **RAZORPAY TEST MODE** banner.
- **Speaker**: "We click **Pay Securely with Razorpay Test Mode**. This creates a test mode order in paise on our backend, opens the official Razorpay Checkout popup, and performs server-side HMAC-SHA256 signature verification upon completion."
- **Visual**: Complete test payment in Razorpay modal. Show live progress steps (**Creating Order... -> Verifying Signature... -> Executing PayGuard AI Risk Analysis...**).
- **Visual**: Display payment verification badge, 0-100 risk gauge, decision banner, and payment history audit log (`/payments`).

---

## 5:30 – 6:30 | Technology Stack, Security & Limitations
- **Speaker**: "Architecturally, PayGuard AI enforces strict security: `RAZORPAY_KEY_SECRET` is kept exclusively on the backend, sensitive cardholder credentials are never stored, and REST endpoints implement CORS restrictions and input validation schemas."
- **Visual**: Show `README.md` Limitations section.
- **Key Message**: "PayGuard AI is a demonstration prototype designed to showcase scalable payment risk engineering concepts."

---

## 6:30 – 7:00 | Conclusion & Q&A
- **Speaker**: "Thank you for reviewing PayGuard AI! I welcome your questions and look forward to discussing how these AI Risk Manager concepts apply at scale at Razorpay."
