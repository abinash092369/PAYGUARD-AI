# PayGuard AI — Step-by-Step Demonstration Guide

This guide outlines the recommended presentation workflow for demonstrating PayGuard AI to evaluators and reviewers.

---

## 1. Executive Dashboard Overview
1. Launch the application at `http://localhost:5173`.
2. Inspect the **Executive Monitoring Dashboard**:
   - Highlight **Total Transactions** (50,000 synthetic records), **Fraud Rate**, **Active Risk Alerts**, and **High-Risk Monitoring Queue**.
   - Review the **Daily Fraud Trend** area chart and **Risk Level Distribution** bar chart.

## 2. Server-Side Transaction Telemetry Explorer
1. Navigate to **Transactions** (`/transactions`).
2. Search by merchant category (`ecommerce`, `gaming`) or payment method (`UPI`, `CREDIT_CARD`).
3. Click on any transaction row to open the **Telemetry Details Modal** inspecting raw device, IP, and velocity features.

## 3. Manual Risk Analyzer Console
1. Navigate to **Analyze Risk** (`/analyze`).
2. Select **Preset 1: Normal Low Risk**. Click **Run Fraud Risk Analysis**.
   - Observe Result: **LOW Risk (Score 10–20)**, **Decision: ALLOW**.
3. Select **Preset 3: High-Risk Velocity & Distance**. Click **Run Fraud Risk Analysis**.
   - Observe Result: **CRITICAL Risk (Score 80–95)**, **Decision: BLOCK**.
   - Review detected risk factors (`HIGH_TRANSACTION_VELOCITY`, `NEW_IP`, `LARGE_DISTANCE_FROM_PREVIOUS_TRANSACTION`).

## 4. Security Risk Alert Management
1. Navigate to **Alerts** (`/alerts`).
2. Filter alerts by status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`).
3. Click an `OPEN` alert to open the **Alert Investigation Drawer**.
4. Update status to `INVESTIGATING` then `RESOLVED` to demonstrate the analyst triage lifecycle.

## 5. Razorpay Test-Mode Payment Checkout
1. Navigate to **Test Payment** (`/payment`).
2. Select **Suspicious Amount & Velocity** scenario preset.
3. Click **Pay Securely with Razorpay Test Mode**.
4. Complete the test transaction in the Razorpay Checkout popup.
5. Watch PayGuard AI execute post-checkout signature verification and live risk assessment.
6. Navigate to **Payments History** (`/payments`) to audit test mode payment records.

## 6. Deep Risk Analytics
1. Navigate to **Risk Analytics** (`/analytics`).
2. Filter by time range (**7 Days**, **30 Days**, **90 Days**, **All Time**).
3. Review top threat vector frequencies and payment method risk breakdowns.
