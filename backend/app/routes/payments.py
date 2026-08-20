import math
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.payment import Payment
from app.schemas.payment import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentResponse,
    PaginatedPaymentsResponse,
)
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/create-order", response_model=CreatePaymentOrderResponse)
def create_payment_order(payload: CreatePaymentOrderRequest, db: Session = Depends(get_db)):
    """
    Creates a Razorpay Test Mode Order in paise.
    """
    try:
        res = PaymentService.create_test_order(db, payload.amount, payload.currency)
        return CreatePaymentOrderResponse(**res)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create Razorpay test order.")


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment_and_analyze_risk(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """
    Verifies Razorpay HMAC signature, logs payment, executes PayGuard AI risk engine, and returns assessment.
    """
    verified = PaymentService.verify_payment_signature(
        db,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature
    )

    if not verified:
        raise HTTPException(
            status_code=400,
            detail="Razorpay payment signature verification failed. Invalid signature token."
        )

    res = PaymentService.map_payment_to_transaction_and_risk(
        db,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.telemetry_override
    )

    return VerifyPaymentResponse(**res)


@router.get("", response_model=PaginatedPaymentsResponse)
def get_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieves paginated Razorpay test payment history records.
    """
    query = db.query(Payment)
    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 0
    offset = (page - 1) * limit
    items = query.order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()

    return PaginatedPaymentsResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        data=items,
    )
