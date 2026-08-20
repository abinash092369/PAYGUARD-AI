from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class RiskFactor(BaseModel):
    code: str
    title: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    description: str


class ModelInfo(BaseModel):
    name: str
    version: str
    training_datetime: Optional[str] = ""


class RiskAnalysisResult(BaseModel):
    transaction_id: str
    fraud_probability: float = Field(..., ge=0.0, le=1.0)
    fraud_probability_percent: float = Field(..., ge=0.0, le=100.0)
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    decision: str    # ALLOW, REVIEW, BLOCK
    summary: str
    risk_factors: List[RiskFactor]
    global_top_features: List[str]
    model: ModelInfo

    model_config = ConfigDict(from_attributes=True)


class RiskAnalysisResponse(BaseModel):
    success: bool
    data: RiskAnalysisResult


class RiskAnalysisRequest(BaseModel):
    transaction_id: Optional[str] = "TXN_REQ_001"
    user_id: str = "USR_00001"
    merchant_id: str = "MER_0001"
    amount: float = Field(..., gt=0)
    currency: Optional[str] = "INR"
    transaction_timestamp: Optional[str] = "2026-08-20 12:00:00"
    payment_method: str = "UPI"
    device_id: str = "DEV_000001"
    ip_address: str = "127.0.0.1"
    country: Optional[str] = "IN"
    merchant_category: str = "ecommerce"
    customer_age: int = Field(..., ge=18, le=100)
    account_age_days: int = Field(..., ge=0)
    transaction_count_24h: int = Field(..., ge=0)
    transaction_amount_24h: float = Field(..., ge=0.0)
    failed_transactions_24h: int = Field(..., ge=0)
    previous_transaction_amount: float = Field(..., ge=0.0)
    distance_from_previous_transaction: float = Field(..., ge=0.0)
    is_new_device: int = Field(..., ge=0, le=1)
    is_new_ip: int = Field(..., ge=0, le=1)
    is_international: int = Field(..., ge=0, le=1)
    hour_of_day: int = Field(..., ge=0, le=23)
    velocity_score: float = Field(..., ge=0.0, le=1.0)
    chargeback_history: int = Field(..., ge=0, le=1)
