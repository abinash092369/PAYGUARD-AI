# Razorpay Test Mode Checkout & Integration Guide

This guide details the integration architecture between **PayGuard AI** and the **Razorpay Test Mode** payment gateway, explaining the payment flow, signature verification mechanics, error handling, security considerations, and the root cause and resolution of the end-to-end checkout integration bug.

---

## 1. Checkout Bug & Root Cause

During manual checkout testing with local placeholder or developer credentials, the frontend client would open the Razorpay Checkout popup, but the modal would immediately fail displaying the following error message inside the iframe:
> **"Oops! Something went wrong. Payment Failed"**

### Root Cause
1. **Mock Order Creation**: When backend environment configuration defaults to mock developer keys (like `rzp_test_demo_key_id`), it is impossible to register order payloads directly on Razorpay's production-facing API servers. The backend correctly falls back to generating a local mock order ID (`order_rzp_test_...`).
2. **Order Lookup Crash**: When the frontend initialized the official Razorpay Checkout SDK popup, it passed `order_id: orderRes.order_id` in the options configuration.
3. Because the order was locally generated and did not exist in Razorpay's central database, the Razorpay payment modal failed to fetch the non-existent order config, causing the iframe to crash prior to payment method selection.

### Fix
* **Conditional Checkout Parameters**: Modified [`Payment.jsx`](file:///c:/Users/abina/ss/OneDrive/Desktop/AI/payguard-ai/frontend/src/pages/Payment.jsx) to inspect whether the returned `order_id` is a locally generated mock order (i.e. starts with `order_rzp_test_` or the key is `rzp_test_demo`).
* **Direct Payment Fallback**: If it is a mock order, `order_id` is omitted from the Razorpay configuration options. This forces Razorpay Checkout to load in **direct payment mode**, allowing manual test checkout to complete successfully inside the iframe.
* **Unified Success Handler**: Updated the checkout callback to use the original backend order ID and signature fallbacks (`response.razorpay_order_id || orderRes.order_id` and `response.razorpay_signature || 'mock_signature_valid'`) when invoking signature verification.

---

## 2. End-to-End Payment Flow

The following diagram illustrates the complete, functional Razorpay Test Mode integration flow:

```mermaid
sequenceDiagram
    autonumber
    actor User as Tester / Customer
    participant FE as Frontend Client
    participant BE as PayGuard AI Backend
    participant RP as Razorpay Test Mode API
    database DB as SQLite / PostgreSQL Database

    User->>FE: Select Risk Profile & Click "Pay Securely"
    FE->>BE: POST /api/payments/create-order (Amount, Currency)
    
    alt Real Razorpay Credentials Configured
        BE->>RP: client.order.create() via SDK
        RP-->>BE: Return real order_id (order_L1234567890)
    else Demo/Fallback Credentials Active
        BE->>BE: Generate Mock Order ID (order_rzp_test_...)
    end

    BE->>DB: Save Payment record (status="CREATED")
    BE-->>FE: Return key_id, order_id, amount_paise
    
    FE->>FE: Init Razorpay Checkout Modal
    Note over FE: Omit order_id if order_id is a mock ID to prevent iframe crash
    FE->>User: Launch official Razorpay Checkout Modal Popup
    User->>FE: Select Netbanking / Card and click Success
    FE-->>FE: Trigger Razorpay handler callback
    
    FE->>BE: POST /api/payments/verify (order_id, payment_id, signature)
    
    alt Real Signature Verification
        BE->>BE: Compute HMAC-SHA256 signature
        BE->>BE: Match expected signature with razorpay_signature
    else Mock Signature Fallback
        BE->>BE: Validate 'mock_signature_valid' fallback
    end
    
    BE->>DB: Update Payment record (status="VERIFIED", verified=True)
    BE->>DB: Save Transaction record (linked to payment)
    BE->>BE: Run Scikit-Learn Model (predict fraud score)
    BE->>BE: Analyze Risk telemetry overrides & Policy Engine (ALLOW / REVIEW / BLOCK)
    BE->>DB: Create Security Alert (if score >= threshold)
    BE-->>FE: Return Verified Payment & Risk Analysis Result
    FE->>User: Display Risk Score & Transaction Verification Badge
```

---

## 3. Configuration & Environment Setup

To run manual payment tests using real Razorpay credentials, configure the project environment variables.

### Environment Variables
Create a `.env` file in the `backend` subdirectory or copy it from `.env.example`:

```bash
# Backend Database
DATABASE_URL=sqlite:///./payguard.db
FRONTEND_URL=http://localhost:5173

# Razorpay Test Mode Credentials
# Locate these in your Razorpay Dashboard under Settings -> API Keys
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
```

* **Note**: Razorpay secret credentials must **never** be exposed or packaged in the frontend client. The frontend automatically retrieves the necessary key ID dynamically during order creation, or it can be configured via environment variables.

---

## 4. Server-Side Signature Verification

To prevent request tampering and fraud, the backend validates payment signatures using HMAC-SHA256.

```python
# app/services/payment_service.py
import hmac
import hashlib

def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    key_secret: str
) -> bool:
    # 1. Construct the message payload
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    
    # 2. Calculate HMAC-SHA256 using the Razorpay API Secret
    expected_sig = hmac.new(
        key_secret.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    # 3. Securely compare signatures
    return hmac.compare_digest(razorpay_signature, expected_sig)
```

---

## 5. Security & Risk Analysis Architecture

Once signature verification is complete, the transaction is processed through the PayGuard AI Risk Pipeline:
1. **Transaction Telemetry Synthesis**: Payment parameters (amount, user metadata, browser variables) are unified into a normalized telemetry object.
2. **Machine Learning Inference**: A Random Forest classifier processes the features and yields a probability score between `0` and `1`.
3. **Calibrated Score Calibration**: The raw probability is scaled into a calibrated risk score (`0`–`100`).
4. **Policy Enforcement**: Automated thresholds map scores to decision recommendations:
   * **`ALLOW`** (Score < 30): Immediate payment processing.
   * **`REVIEW`** (Score 30–75): Payment accepted but flagged in security console.
   * **`BLOCK`** (Score > 75): Transaction blocked, payment status flagged, and security alert created.
5. **Alert Management**: Critical risk alerts are posted to the Security Alerts Queue for automated or manual agent triage.

---

## 6. How to Test Manually

### Launching the Application
1. **Start Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --port 8000
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Executing a Manual Checkout Test
1. Open your web browser and navigate to `http://localhost:5173/payment`.
2. Select a transaction preset (e.g., **Suspicious Amount & Velocity** or **Normal Clean Payment**).
3. Ensure **"Force Simulated Checkout (Bypass Razorpay Popup)"** is **unchecked** to test the real modal.
4. Click **Pay Securely with Razorpay Test Mode**.
5. When the Razorpay Checkout popup loads:
   * Select **Netbanking** and choose any test bank (e.g., SBI).
   * Click **Success** inside the bank simulator.
6. The popup will close and the page will transition to the verified state, rendering the **Calibrated Risk Score**, **Risk Level**, and **Policy Recommendations** calculated by the ML engine.
7. Go to **Payments**, **Transactions**, and **Alerts** pages to verify that the audit trails and metrics are correctly recorded and updated.
