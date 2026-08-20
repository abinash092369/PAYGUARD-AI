"""
PayGuard AI - Transaction Data Validator
Validates synthetic transaction datasets for integrity, edge cases, and quality standards.
"""

import os
import sys
import argparse
import pandas as pd


def validate_dataset(filepath: str) -> bool:
    print(f"Validating dataset: {filepath}...\n")
    if not os.path.exists(filepath):
        print(f"ERROR: File not found at {filepath}")
        return False

    df = pd.read_csv(filepath)

    expected_columns = [
        "transaction_id", "user_id", "merchant_id", "amount", "currency",
        "transaction_timestamp", "payment_method", "device_id", "ip_address",
        "country", "merchant_category", "customer_age", "account_age_days",
        "transaction_count_24h", "transaction_amount_24h", "failed_transactions_24h",
        "previous_transaction_amount", "distance_from_previous_transaction",
        "is_new_device", "is_new_ip", "is_international", "hour_of_day",
        "velocity_score", "chargeback_history", "fraud_label"
    ]

    issues = []

    # 1. Column Verification
    missing_cols = set(expected_columns) - set(df.columns)
    if missing_cols:
        issues.append(f"Missing columns: {missing_cols}")

    # 2. Row Count Verification
    total_rows = len(df)
    total_cols = len(df.columns)
    if total_rows == 0:
        issues.append("Dataset is empty.")

    # 3. Missing / Null Values
    missing_val_count = int(df.isnull().sum().sum())
    if missing_val_count > 0:
        issues.append(f"Found {missing_val_count} missing/null values across dataset.")

    # 4. Duplicate Transaction IDs
    dup_txn_ids = int(df["transaction_id"].duplicated().sum())
    if dup_txn_ids > 0:
        issues.append(f"Found {dup_txn_ids} duplicate transaction IDs.")

    # 5. Invalid Amounts
    invalid_amounts = int((df["amount"] <= 0).sum())
    if invalid_amounts > 0:
        issues.append(f"Found {invalid_amounts} invalid transaction amounts (<= 0).")

    # 6. Invalid Labels
    invalid_labels = int((~df["fraud_label"].isin([0, 1])).sum())
    if invalid_labels > 0:
        issues.append(f"Found {invalid_labels} invalid fraud_label values (must be 0 or 1).")

    # 7. Invalid Timestamps
    try:
        pd.to_datetime(df["transaction_timestamp"])
    except Exception as e:
        issues.append(f"Timestamp parsing error: {e}")

    # 8. Numeric Ranges
    invalid_age = int(((df["customer_age"] < 18) | (df["customer_age"] > 100)).sum())
    if invalid_age > 0:
        issues.append(f"Found {invalid_age} customer_age values outside valid range [18, 100].")

    invalid_hour = int(((df["hour_of_day"] < 0) | (df["hour_of_day"] > 23)).sum())
    if invalid_hour > 0:
        issues.append(f"Found {invalid_hour} hour_of_day values outside range [0, 23].")

    invalid_velocity = int(((df["velocity_score"] < 0.0) | (df["velocity_score"] > 1.0)).sum())
    if invalid_velocity > 0:
        issues.append(f"Found {invalid_velocity} velocity_score values outside range [0.0, 1.0].")

    # 9. Class Imbalance Check
    fraud_count = int(df["fraud_label"].sum())
    legit_count = total_rows - fraud_count
    fraud_rate = (fraud_count / total_rows) * 100 if total_rows > 0 else 0.0

    if fraud_rate < 1.0 or fraud_rate > 15.0:
        issues.append(f"Unusual fraud rate: {fraud_rate:.2f}% (expected between 1.0% and 15.0%).")

    # Print Validation Report
    status = "PASS" if len(issues) == 0 else "FAIL"

    print("DATA VALIDATION REPORT")
    print("----------------------")
    print(f"Rows:                    {total_rows:,}")
    print(f"Columns:                 {total_cols}")
    print(f"Missing values:          {missing_val_count}")
    print(f"Duplicate IDs:           {dup_txn_ids}")
    print(f"Legitimate transactions: {legit_count:,}")
    print(f"Fraudulent transactions: {fraud_count:,}")
    print(f"Fraud rate:              {fraud_rate:.2f}%")
    print(f"Validation:              {status}")

    if issues:
        print("\nISSUES DETECTED:")
        for issue in issues:
            print(f" - {issue}")

    return len(issues) == 0


def main():
    parser = argparse.ArgumentParser(description="Validate PayGuard AI Transaction Dataset")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")

    args = parser.parse_args()

    if args.data is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
        filepath = os.path.join(project_root, "data", "transactions.csv")
    else:
        filepath = args.data

    passed = validate_dataset(filepath)
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
