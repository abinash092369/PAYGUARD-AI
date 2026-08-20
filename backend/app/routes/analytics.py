import os
from typing import List, Dict, Any
import pandas as pd
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def get_dataset_df():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None


@router.get("/fraud-rate")
def get_fraud_rate_analytics(days: int = Query(30, ge=1, le=365)):
    """
    Returns aggregated fraud rate trends over time from dataset timestamps.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        df_copy = df.copy()
        df_copy["date"] = pd.to_datetime(df_copy["transaction_timestamp"]).dt.strftime("%Y-%m-%d")
        
        grouped = df_copy.groupby("date").agg(
            total_transactions=("transaction_id", "count"),
            fraudulent_transactions=("fraud_label", "sum"),
            total_amount=("amount", "sum")
        ).reset_index()

        grouped["fraud_rate"] = (grouped["fraudulent_transactions"] / grouped["total_transactions"] * 100).round(2)
        grouped["total_amount"] = grouped["total_amount"].round(2)

        results = grouped.sort_values("date").tail(days).to_dict(orient="records")
        return results
    return []


@router.get("/risk-trends")
def get_risk_trends_analytics():
    """
    Returns risk level distribution trends over time.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        df_copy = df.copy()
        df_copy["date"] = pd.to_datetime(df_copy["transaction_timestamp"]).dt.strftime("%Y-%m-%d")
        
        # Categorize risk levels from synthetic dataset indicators
        def get_level(row):
            if row["fraud_label"] == 1:
                return "CRITICAL"
            if row["failed_transactions_24h"] >= 2 or row["amount"] > 25000:
                return "HIGH"
            if row["is_new_device"] == 1 or row["is_new_ip"] == 1:
                return "MEDIUM"
            return "LOW"

        df_copy["risk_level"] = df_copy.apply(get_level, axis=1)

        pivot = df_copy.groupby(["date", "risk_level"]).size().unstack(fill_value=0).reset_index()
        for col in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
            if col not in pivot.columns:
                pivot[col] = 0

        results = pivot.sort_values("date").tail(30).to_dict(orient="records")
        return results
    return []


@router.get("/risk-signals")
def get_risk_signals_analytics():
    """
    Returns counts and percentages for suspicious risk signal codes.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        total = len(df)
        signals = [
            {"code": "NEW_DEVICE", "name": "New Device Binding", "count": int((df["is_new_device"] == 1).sum())},
            {"code": "NEW_IP", "name": "Unfamiliar IP Network", "count": int((df["is_new_ip"] == 1).sum())},
            {"code": "HIGH_VELOCITY", "name": "Velocity Spike (24h > 8)", "count": int((df["transaction_count_24h"] > 8).sum())},
            {"code": "HIGH_AMOUNT", "name": "High Value (> ₹25,000)", "count": int((df["amount"] > 25000).sum())},
            {"code": "FAILED_ATTEMPTS", "name": "Failed Auth Attempts (>= 2)", "count": int((df["failed_transactions_24h"] >= 2).sum())},
            {"code": "INTERNATIONAL", "name": "Cross-Border Payment", "count": int((df["is_international"] == 1).sum())},
            {"code": "CHARGEBACK_HISTORY", "name": "Chargeback History", "count": int((df["chargeback_history"] == 1).sum())},
        ]
        for s in signals:
            s["percentage"] = round((s["count"] / total) * 100, 2)
        return sorted(signals, key=lambda x: x["count"], reverse=True)
    return []


@router.get("/merchant-risk")
def get_merchant_risk_analytics():
    """
    Returns transaction count, fraud count, fraud rate, and avg amount grouped by merchant category.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        grouped = df.groupby("merchant_category").agg(
            transaction_count=("transaction_id", "count"),
            fraud_count=("fraud_label", "sum"),
            average_amount=("amount", "mean"),
            total_amount=("amount", "sum")
        ).reset_index()

        grouped["fraud_rate"] = (grouped["fraud_count"] / grouped["transaction_count"] * 100).round(2)
        grouped["average_amount"] = grouped["average_amount"].round(2)
        grouped["total_amount"] = grouped["total_amount"].round(2)

        return grouped.sort_values("fraud_rate", ascending=False).to_dict(orient="records")
    return []


@router.get("/payment-method-risk")
def get_payment_method_risk_analytics():
    """
    Returns transaction count, fraud count, and fraud rate grouped by payment rail.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        grouped = df.groupby("payment_method").agg(
            transaction_count=("transaction_id", "count"),
            fraud_count=("fraud_label", "sum"),
            average_amount=("amount", "mean"),
            total_amount=("amount", "sum")
        ).reset_index()

        grouped["fraud_rate"] = (grouped["fraud_count"] / grouped["transaction_count"] * 100).round(2)
        grouped["average_amount"] = grouped["average_amount"].round(2)

        return grouped.sort_values("fraud_rate", ascending=False).to_dict(orient="records")
    return []
