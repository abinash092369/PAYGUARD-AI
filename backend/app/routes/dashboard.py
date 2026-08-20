import os
from typing import List
import pandas as pd
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    DashboardStatsResponse,
    RiskDistributionResponse,
    FraudTrendItem,
    RiskSignalItem,
)
from app.schemas.transaction import TransactionResponse
from app.services.data_loader import seed_transactions_if_empty
from app.services.risk_service import BackendRiskService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_csv_df():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics computed directly from transaction dataset.
    """
    seed_transactions_if_empty(db)
    df = get_csv_df()

    if df is not None and len(df) > 0:
        total = len(df)
        fraud_cnt = int(df["fraud_label"].sum())
        legit_cnt = total - fraud_cnt
        fraud_rate = round((fraud_cnt / total) * 100, 2)
        total_vol = round(float(df["amount"].sum()), 2)
        avg_amt = round(float(df["amount"].mean()), 2)
        max_amt = round(float(df["amount"].max()), 2)

        # Estimate high and critical risk transactions based on risk factors & fraud label
        # High risk: fraud label == 1 or severe features
        critical_cnt = fraud_cnt
        high_cnt = int(((df["fraud_label"] == 0) & ((df["is_new_device"] == 1) & (df["amount"] > 20000))).sum())

        return DashboardStatsResponse(
            total_transactions=total,
            fraudulent_transactions=fraud_cnt,
            legitimate_transactions=legit_cnt,
            fraud_rate=fraud_rate,
            total_transaction_volume=total_vol,
            average_transaction_amount=avg_amt,
            max_transaction_amount=max_amt,
            high_risk_transactions=high_cnt,
            critical_risk_transactions=critical_cnt,
        )

    return DashboardStatsResponse(
        total_transactions=0,
        fraudulent_transactions=0,
        legitimate_transactions=0,
        fraud_rate=0.0,
        total_transaction_volume=0.0,
        average_transaction_amount=0.0,
        max_transaction_amount=0.0,
        high_risk_transactions=0,
        critical_risk_transactions=0,
    )


@router.get("/risk-distribution", response_model=RiskDistributionResponse)
def get_risk_distribution(db: Session = Depends(get_db)):
    """
    Returns counts for LOW, MEDIUM, HIGH, and CRITICAL risk levels.
    """
    df = get_csv_df()
    if df is not None and len(df) > 0:
        total = len(df)
        fraud_cnt = int(df["fraud_label"].sum())
        
        # Grounded categorization from synthetic dataset telemetry
        critical_cnt = fraud_cnt
        high_cnt = int(((df["fraud_label"] == 0) & (df["failed_transactions_24h"] >= 2)).sum())
        medium_cnt = int(((df["fraud_label"] == 0) & (df["is_new_device"] == 1) & (df["failed_transactions_24h"] < 2)).sum())
        low_cnt = max(0, total - (critical_cnt + high_cnt + medium_cnt))

        return RiskDistributionResponse(
            low=low_cnt,
            medium=medium_cnt,
            high=high_cnt,
            critical=critical_cnt,
        )

    return RiskDistributionResponse(low=0, medium=0, high=0, critical=0)


@router.get("/fraud-trends", response_model=List[FraudTrendItem])
def get_fraud_trends():
    """
    Aggregates transaction telemetry grouped by date.
    """
    df = get_csv_df()
    if df is not None and len(df) > 0:
        df_copy = df.copy()
        df_copy["date"] = pd.to_datetime(df_copy["transaction_timestamp"]).dt.strftime("%Y-%m-%d")
        
        grouped = df_copy.groupby("date").agg(
            transactions=("transaction_id", "count"),
            fraudulent=("fraud_label", "sum"),
            total_amount=("amount", "sum")
        ).reset_index()

        grouped["legitimate"] = grouped["transactions"] - grouped["fraudulent"]
        grouped["fraud_rate"] = (grouped["fraudulent"] / grouped["transactions"] * 100).round(2)
        grouped["total_amount"] = grouped["total_amount"].round(2)

        # Sort chronologically and take up to recent 30 dates
        grouped = grouped.sort_values("date").tail(30)
        return grouped.to_dict(orient="records")

    return []


@router.get("/risk-signals", response_model=List[RiskSignalItem])
def get_top_risk_signals():
    """
    Returns counts of top suspicious behavioral threat vectors in dataset.
    """
    df = get_csv_df()
    if df is not None and len(df) > 0:
        signals = [
            {
                "signal_code": "NEW_DEVICE",
                "signal_name": "New Unverified Device Binding",
                "count": int((df["is_new_device"] == 1).sum()),
                "severity": "MEDIUM",
                "description": "Hardware device fingerprint not previously associated with user account."
            },
            {
                "signal_code": "NEW_IP",
                "signal_name": "Unfamiliar IP Network Origin",
                "count": int((df["is_new_ip"] == 1).sum()),
                "severity": "LOW",
                "description": "IP network location outside standard user historical profile."
            },
            {
                "signal_code": "HIGH_VELOCITY",
                "signal_name": "High Transaction Velocity Burst",
                "count": int((df["transaction_count_24h"] > 8).sum()),
                "severity": "HIGH",
                "description": "Elevated 24-hour transaction frequency exceeding velocity baseline."
            },
            {
                "signal_code": "HIGH_AMOUNT",
                "signal_name": "High Value Transaction Spike",
                "count": int((df["amount"] > 25000).sum()),
                "severity": "HIGH",
                "description": "Transaction amount exceeds standard retail thresholds."
            },
            {
                "signal_code": "FAILED_ATTEMPTS",
                "signal_name": "Multiple Failed Authorizations",
                "count": int((df["failed_transactions_24h"] >= 2).sum()),
                "severity": "MEDIUM",
                "description": "Multiple pre-transaction payment failure logs in trailing 24 hours."
            },
            {
                "signal_code": "INTERNATIONAL",
                "signal_name": "Cross-Border International Payment",
                "count": int((df["is_international"] == 1).sum()),
                "severity": "MEDIUM",
                "description": "Payment routed across international border jurisdiction."
            },
            {
                "signal_code": "CHARGEBACK_HISTORY",
                "signal_name": "Prior Account Dispute Record",
                "count": int((df["chargeback_history"] == 1).sum()),
                "severity": "HIGH",
                "description": "Account registered in historical chargeback dispute database."
            },
        ]
        return sorted(signals, key=lambda x: x["count"], reverse=True)

    return []


@router.get("/recent-transactions", response_model=List[TransactionResponse])
def get_recent_transactions(
    limit: int = Query(10, ge=1, le=100, description="Max transactions to return"),
    db: Session = Depends(get_db)
):
    """
    Returns recent transactions sorted by timestamp descending.
    """
    seed_transactions_if_empty(db)
    items = db.query(Transaction).order_by(Transaction.id.desc()).limit(limit).all()
    if items and len(items) > 0:
        return items

    df = get_csv_df()
    if df is not None and len(df) > 0:
        sub = df.tail(limit).iloc[::-1]
        results = []
        for idx, row in sub.iterrows():
            d = row.to_dict()
            d["id"] = int(idx) + 1
            results.append(d)
        return results

    return []
