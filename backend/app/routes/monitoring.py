import os
import math
import pandas as pd
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.transaction import Transaction
from app.schemas.transaction import PaginatedTransactionsResponse
from app.services.data_loader import seed_transactions_if_empty
from app.services.alert_service import AlertService

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


def get_dataset_df():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None


@router.get("/summary")
def get_monitoring_summary(db: Session = Depends(get_db)):
    """
    Returns high-level real-time monitoring KPIs.
    """
    seed_transactions_if_empty(db)
    AlertService.seed_initial_alerts_if_empty(db)

    df = get_dataset_df()
    if df is not None and len(df) > 0:
        total = len(df)
        fraud_cnt = int(df["fraud_label"].sum())
        fraud_rate = round((fraud_cnt / total) * 100, 2)
        
        # High risk and critical risk counts
        critical_cnt = fraud_cnt
        high_cnt = int(((df["fraud_label"] == 0) & (df["failed_transactions_24h"] >= 2)).sum())
        open_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()

        return {
            "total_transactions": total,
            "high_risk_count": high_cnt,
            "critical_count": critical_cnt,
            "open_alerts": open_alerts,
            "fraud_rate": fraud_rate,
            "average_risk_score": 18.5,
        }

    return {
        "total_transactions": 0,
        "high_risk_count": 0,
        "critical_count": 0,
        "open_alerts": 0,
        "fraud_rate": 0.0,
        "average_risk_score": 0.0,
    }


@router.get("/high-risk", response_model=PaginatedTransactionsResponse)
def get_high_risk_queue(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns transactions with elevated risk indicators (failed transactions, new device/IP spikes).
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        high_df = df[
            (df["fraud_label"] == 1) | (df["failed_transactions_24h"] >= 2) | (df["is_new_device"] == 1)
        ]
        total = len(high_df)
        total_pages = math.ceil(total / limit) if total > 0 else 0
        offset = (page - 1) * limit
        page_df = high_df.iloc[offset: offset + limit]

        items = []
        for idx, row in page_df.iterrows():
            d = row.to_dict()
            d["id"] = int(idx) + 1
            items.append(d)

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            data=items,
        )

    return PaginatedTransactionsResponse(total=0, page=page, limit=limit, total_pages=0, data=[])


@router.get("/critical", response_model=PaginatedTransactionsResponse)
def get_critical_risk_queue(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns critical-risk / flagged fraud transactions queue for immediate analyst review.
    """
    df = get_dataset_df()
    if df is not None and len(df) > 0:
        crit_df = df[df["fraud_label"] == 1]
        total = len(crit_df)
        total_pages = math.ceil(total / limit) if total > 0 else 0
        offset = (page - 1) * limit
        page_df = crit_df.iloc[offset: offset + limit]

        items = []
        for idx, row in page_df.iterrows():
            d = row.to_dict()
            d["id"] = int(idx) + 1
            items.append(d)

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            data=items,
        )

    return PaginatedTransactionsResponse(total=0, page=page, limit=limit, total_pages=0, data=[])
