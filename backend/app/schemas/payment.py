from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CreatePaymentOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR rupees (e.g. 500.0)")
    currency: str = Field("INR", description="Currency code, must be INR")


class CreatePaymentOrderResponse(BaseModel):
    order_id: str
    amount_paise: int
    amount_rupees: float
    currency: str
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    telemetry_override: Optional[Dict[str, Any]] = None


class PaymentResponse(BaseModel):
    id: int
    payment_id: Optional[str] = None
    order_id: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    verified: bool
    transaction_id: Optional[str] = None

    class Config:
        from_attributes = True


class VerifyPaymentResponse(BaseModel):
    verified: bool
    payment_id: str
    order_id: str
    transaction_id: str
    risk_analysis: Dict[str, Any]


class PaginatedPaymentsResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    data: List[PaymentResponse]
