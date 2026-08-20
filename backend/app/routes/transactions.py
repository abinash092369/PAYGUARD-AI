import os
import math
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

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
    search: Optional[str] = Query(None, description="Search transaction_id, user_id, or merchant_id"),
    fraud_label: Optional[int] = Query(None, description="Filter by fraud_label (0 or 1)"),
    merchant_category: Optional[str] = Query(None, description="Filter by merchant category"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    db: Session = Depends(get_db),
):
    """
    Retrieves paginated transaction records with server-side search and filtering.
    """
    seed_transactions_if_empty(db)
    query = db.query(Transaction)

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(s_term),
                Transaction.user_id.ilike(s_term),
                Transaction.merchant_id.ilike(s_term),
            )
        )

    if fraud_label is not None:
        query = query.filter(Transaction.fraud_label == fraud_label)

    if merchant_category:
        query = query.filter(Transaction.merchant_category == merchant_category)

    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)

    total = query.count()

    if total > 0:
        total_pages = math.ceil(total / limit)
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            data=items,
        )

    # Fallback to CSV if DB query returns 0 items or DB empty
    df = get_csv_fallback_df()
    if df is not None and len(df) > 0:
        sub_df = df.copy()

        if search:
            s_term = search.strip().lower()
            sub_df = sub_df[
                sub_df["transaction_id"].str.lower().str.contains(s_term) |
                sub_df["user_id"].str.lower().str.contains(s_term) |
                sub_df["merchant_id"].str.lower().str.contains(s_term)
            ]

        if fraud_label is not None:
            sub_df = sub_df[sub_df["fraud_label"] == fraud_label]

        if merchant_category:
            sub_df = sub_df[sub_df["merchant_category"] == merchant_category]

        if payment_method:
            sub_df = sub_df[sub_df["payment_method"] == payment_method]

        total = len(sub_df)
        total_pages = math.ceil(total / limit) if total > 0 else 0
        offset = (page - 1) * limit
        page_df = sub_df.iloc[offset: offset + limit]

        items = []
        for idx, row in page_df.iterrows():
            row_dict = row.to_dict()
            row_dict["id"] = int(idx) + 1
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
