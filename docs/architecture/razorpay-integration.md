# PayGuard AI — Razorpay Test Mode Payment Architecture

```mermaid
graph TD
    A[Customer / Frontend Payment UI] -->|POST /api/payments/create-order| B[Backend Payment Service]
    B -->|Create Order in Paise| C[Razorpay Test Mode API]
    C -->|Return Order ID & Public Key| A
    
    A -->|Launch Razorpay Checkout Modal| D[Razorpay Checkout Popup]
    D -->|User Completes Test Payment| E[Razorpay Payment Credentials Token]
    
    E -->|POST /api/payments/verify| F[Backend Signature Verification]
    F -->|HMAC-SHA256 Server Signature Check| G{Verified?}
    
    G -->|Yes| H[Map Payment to Transaction & Save DB]
    G -->|No| I[HTTP 400 Bad Signature Error]
    
    H --> J[PayGuard AI ML Model Service]
    J -->|Random Forest Predict Proba| K[Calibrated 0-100 Risk Score Engine]
    K -->|Decision ALLOW / REVIEW / BLOCK| L[Alert Generation Policy Engine]
    L -->|If HIGH >=50 or CRITICAL >=75| M[Create / Update Security Alert]
    M --> N[Real-Time Risk Assessment Response]
```

## Security & Architecture Principles

1. **Test Mode Enforcement**:
   - Uses exclusively Razorpay Test Mode keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_KEY_ID`).
   - `RAZORPAY_KEY_SECRET` is strictly contained within backend environment variables and is never exposed to frontend client builds.

2. **Server-Side HMAC-SHA256 Verification**:
   - Signature verification is strictly performed on the FastAPI backend prior to transaction logging or risk evaluation using `hmac.new(secret, order_id|payment_id, sha256)`.

3. **Zero Sensitive Cardholder Storage**:
   - PayGuard AI never accepts, processes, or stores card numbers, CVVs, expiry dates, or UPI PINs.

4. **Independent Risk Evaluation & Prototype Disclaimer**:
   - PayGuard AI operates as an independent risk analysis layer. In this demonstration prototype, test payments complete first, and PayGuard AI evaluates post-authorization risk for review/blocking recommendation.
