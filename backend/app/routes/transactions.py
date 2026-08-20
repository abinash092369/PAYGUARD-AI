import os
import math
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionResponse,
    TransactionStatsResponse,
    PaginatedTransactionsResponse,
)
from app.services.data_loader import seed_transactions_if_empty

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


def get_csv_fallback_df():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None


@router.get("/stats", response_model=TransactionStatsResponse)
def get_transaction_stats(db: Session = Depends(get_db)):
    """
    Returns high-level statistics for fraud and overall transaction volumes.
    """
    seed_transactions_if_empty(db)
    total = db.query(Transaction).count()

    if total > 0:
        fraud_count = db.query(Transaction).filter(Transaction.fraud_label == 1).count()
        legit_count = total - fraud_count
        fraud_rate = round((fraud_count / total) * 100, 2)
        avg_amt = db.query(func.avg(Transaction.amount)).scalar() or 0.0
        max_amt = db.query(func.max(Transaction.amount)).scalar() or 0.0

        return TransactionStatsResponse(
            total_transactions=total,
            fraudulent_transactions=fraud_count,
            legitimate_transactions=legit_count,
            fraud_rate=fraud_rate,
            average_transaction_amount=round(float(avg_amt), 2),
            max_transaction_amount=round(float(max_amt), 2),
        )

    # Fallback directly to CSV if DB is empty
    df = get_csv_fallback_df()
    if df is not None and len(df) > 0:
        total = len(df)
        fraud_count = int(df["fraud_label"].sum())
        legit_count = total - fraud_count
        fraud_rate = round((fraud_count / total) * 100, 2)
        avg_amt = float(df["amount"].mean())
        max_amt = float(df["amount"].max())

        return TransactionStatsResponse(
            total_transactions=total,
            fraudulent_transactions=fraud_count,
            legitimate_transactions=legit_count,
            fraud_rate=fraud_rate,
            average_transaction_amount=round(avg_amt, 2),
            max_transaction_amount=round(max_amt, 2),
        )

    return TransactionStatsResponse(
        total_transactions=0,
        fraudulent_transactions=0,
        legitimate_transactions=0,
        fraud_rate=0.0,
        average_transaction_amount=0.0,
        max_transaction_amount=0.0,
    )


@router.get("", response_model=PaginatedTransactionsResponse)
def get_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    Retrieves paginated transaction records.
    """
    seed_transactions_if_empty(db)
    total = db.query(Transaction).count()

    if total > 0:
        total_pages = math.ceil(total / limit)
        offset = (page - 1) * limit
        items = db.query(Transaction).offset(offset).limit(limit).all()

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            data=items,
        )

    df = get_csv_fallback_df()
    if df is not None and len(df) > 0:
        total = len(df)
        total_pages = math.ceil(total / limit)
        offset = (page - 1) * limit
        sub_df = df.iloc[offset: offset + limit]
        items = []
        for idx, row in sub_df.iterrows():
            row_dict = row.to_dict()
            row_dict["id"] = idx + 1
            items.append(row_dict)

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            data=items,
        )

    return PaginatedTransactionsResponse(
        total=0,
        page=page,
        limit=limit,
        total_pages=0,
        data=[],
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_by_id(transaction_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a single transaction by transaction_id.
    """
    seed_transactions_if_empty(db)
    txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

    if txn:
        return txn

    df = get_csv_fallback_df()
    if df is not None:
        matched = df[df["transaction_id"] == transaction_id]
        if not matched.empty:
            row_dict = matched.iloc[0].to_dict()
            row_dict["id"] = int(matched.index[0]) + 1
            return row_dict

    raise HTTPException(status_code=404, detail=f"Transaction '{transaction_id}' not found.")
