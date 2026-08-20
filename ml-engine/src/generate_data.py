"""
PayGuard AI - Synthetic Transaction Data Generator
Generates realistic payment transaction datasets with domain-informed fraud patterns.
"""

import os
import sys
import argparse
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np


def generate_transactions(num_rows: int = 50000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a synthetic transaction dataset with realistic features and fraud patterns.
    """
    random.seed(seed)
    np.random.seed(seed)

    print(f"Generating {num_rows:,} synthetic payment transactions (seed={seed})...")

    # Domain entities pool
    num_users = max(500, num_rows // 25)
    num_merchants = max(100, num_rows // 100)
    num_devices = max(600, num_rows // 20)

    user_ids = [f"USR_{i:05d}" for i in range(1, num_users + 1)]
    merchant_ids = [f"MER_{i:04d}" for i in range(1, num_merchants + 1)]
    device_ids = [f"DEV_{i:06d}" for i in range(1, num_devices + 1)]

    # Pre-generate user baseline profiles
    user_profiles = {}
    for uid in user_ids:
        user_profiles[uid] = {
            "primary_device": random.choice(device_ids),
            "primary_ip": f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}",
            "country": np.random.choice(["IN", "US", "GB", "SG", "AE"], p=[0.85, 0.06, 0.04, 0.03, 0.02]),
            "customer_age": int(np.random.randint(18, 72)),
            "account_age_days": int(np.random.randint(1, 1800)),
            "avg_amount": round(float(np.random.exponential(scale=1200) + 100), 2),
            "chargeback_history": 1 if random.random() < 0.03 else 0,
        }

    merchant_categories = ["ecommerce", "travel", "gaming", "electronics", "grocery", "services", "crypto"]
    merchant_cat_weights = [0.35, 0.15, 0.12, 0.15, 0.10, 0.08, 0.05]
    merchant_categories_map = {mid: np.random.choice(merchant_categories, p=merchant_cat_weights) for mid in merchant_ids}

    payment_methods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "WALLET"]
    payment_method_weights = [0.45, 0.25, 0.18, 0.07, 0.05]

    start_date = datetime.now() - timedelta(days=90)

    data = []

    for i in range(1, num_rows + 1):
        txn_id = f"TXN_{i:08d}"
        uid = random.choice(user_ids)
        uprof = user_profiles[uid]
        mid = random.choice(merchant_ids)
        mcat = merchant_categories_map[mid]

        # Timestamp logic
        txn_time = start_date + timedelta(seconds=random.randint(0, 90 * 86400))
        hour_of_day = txn_time.hour

        # Base behavioral features
        is_new_device = 1 if random.random() < 0.12 else 0
        device_id = uprof["primary_device"] if is_new_device == 0 else random.choice(device_ids)

        is_new_ip = 1 if random.random() < 0.15 else 0
        if is_new_ip == 0:
            ip_address = uprof["primary_ip"]
        else:
            ip_address = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

        # International flag
        if uprof["country"] != "IN":
            is_international = 1 if random.random() < 0.8 else 0
            country = uprof["country"]
        else:
            is_international = 1 if random.random() < 0.05 else 0
            country = "IN" if is_international == 0 else random.choice(["US", "GB", "SG", "AE"])

        # Base Amount generation
        base_amt = float(np.random.exponential(scale=uprof["avg_amount"])) + 50.0
        amount = round(base_amt, 2)
        previous_transaction_amount = round(float(np.random.exponential(scale=uprof["avg_amount"])) + 40.0, 2)

        # Distance & Velocity
        distance_from_prev = round(float(np.random.exponential(scale=15)), 2)
        txn_count_24h = int(np.random.poisson(lam=2) + 1)
        txn_amount_24h = round(amount + float(np.random.exponential(scale=amount * 0.8)), 2)
        failed_txns_24h = int(np.random.binomial(n=5, p=0.08))
        velocity_score = round(min(1.0, (txn_count_24h / 15.0) * 0.5 + random.uniform(0.0, 0.3)), 2)

        pm = np.random.choice(payment_methods, p=payment_method_weights)

        # --- FRAUD PATTERN INJECTION ---
        # We define structural fraud signals based on realistic risk rules:
        fraud_risk_score = 0.0

        # Pattern 1: High Velocity Burst
        if txn_count_24h > 8 or velocity_score > 0.65 or failed_txns_24h >= 2:
            fraud_risk_score += 0.25

        # Pattern 2: Account Takeover (ATO) -> New device + New IP + High Distance / Amount
        if is_new_device == 1 and (is_new_ip == 1 or distance_from_prev > 150):
            fraud_risk_score += 0.25

        # Pattern 3: Abnormally Large Transaction Spike
        if amount > 25000 or amount > 3.5 * previous_transaction_amount:
            fraud_risk_score += 0.25

        # Pattern 4: Impossible Travel / International
        if distance_from_prev > 500 or (is_international == 1 and is_new_device == 1):
            fraud_risk_score += 0.25

        # Pattern 5: Repeated Failures
        if failed_txns_24h >= 3:
            fraud_risk_score += 0.25

        # Pattern 6: High Risk Merchant Category Anomaly (Crypto / Gaming)
        if mcat in ["crypto", "gaming", "electronics"] and (is_new_device == 1 or is_new_ip == 1):
            fraud_risk_score += 0.20

        # Pattern 7: Chargeback History Risk
        if uprof["chargeback_history"] == 1:
            fraud_risk_score += 0.20

        # Late Night High Value Anomaly (2 AM - 4 AM)
        if hour_of_day in [1, 2, 3, 4] and is_new_device == 1:
            fraud_risk_score += 0.20

        # Random baseline noise
        fraud_risk_score += random.uniform(-0.05, 0.05)

        # Threshold decision for label (target ~3.5% - 4.5% fraud rate)
        if fraud_risk_score >= 0.45:
            fraud_label = 1
            # Adjust features to reflect fraud pattern coherency
            if random.random() < 0.7:
                is_new_device = 1
                is_new_ip = 1
            if random.random() < 0.6 and amount < 5000:
                amount = round(amount * random.uniform(3.5, 8.0), 2)
            if random.random() < 0.5:
                velocity_score = round(min(1.0, velocity_score + 0.35), 2)
                txn_count_24h = max(txn_count_24h, random.randint(7, 18))
        else:
            fraud_label = 0

        data.append({
            "transaction_id": txn_id,
            "user_id": uid,
            "merchant_id": mid,
            "amount": amount,
            "currency": "INR",
            "transaction_timestamp": txn_time.strftime("%Y-%m-%d %H:%M:%S"),
            "payment_method": pm,
            "device_id": device_id,
            "ip_address": ip_address,
            "country": country,
            "merchant_category": mcat,
            "customer_age": uprof["customer_age"],
            "account_age_days": uprof["account_age_days"],
            "transaction_count_24h": txn_count_24h,
            "transaction_amount_24h": txn_amount_24h,
            "failed_transactions_24h": failed_txns_24h,
            "previous_transaction_amount": previous_transaction_amount,
            "distance_from_previous_transaction": distance_from_prev,
            "is_new_device": is_new_device,
            "is_new_ip": is_new_ip,
            "is_international": is_international,
            "hour_of_day": hour_of_day,
            "velocity_score": velocity_score,
            "chargeback_history": uprof["chargeback_history"],
            "fraud_label": fraud_label,
        })

    df = pd.DataFrame(data)

    # Calculate summary statistics
    total_count = len(df)
    fraud_count = df["fraud_label"].sum()
    legit_count = total_count - fraud_count
    fraud_rate = (fraud_count / total_count) * 100

    print(f"\n--- DATASET GENERATION COMPLETE ---")
    print(f"Total transactions: {total_count:,}")
    print(f"Legitimate:         {legit_count:,}")
    print(f"Fraudulent:         {fraud_count:,}")
    print(f"Fraud rate:         {fraud_rate:.2f}%\n")

    return df


def main():
    parser = argparse.ArgumentParser(description="Generate PayGuard AI Synthetic Transaction Dataset")
    parser.add_argument("--rows", type=int, default=50000, help="Number of rows to generate (default: 50000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    parser.add_argument("--output", type=str, default=None, help="Output CSV path (default: data/transactions.csv)")

    args = parser.parse_args()

    # Determine default output directory relative to project root
    if args.output is None:
        # Resolve path relative to script location or root
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
        output_path = os.path.join(project_root, "data", "transactions.csv")
    else:
        output_path = args.output

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    df = generate_transactions(num_rows=args.rows, seed=args.seed)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully saved to: {output_path}")


if __name__ == "__main__":
    main()
