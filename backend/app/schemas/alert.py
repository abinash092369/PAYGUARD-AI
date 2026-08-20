from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.transaction import TransactionResponse
from app.schemas.risk import RiskFactor


class AlertResponse(BaseModel):
    id: int
    alert_id: str
    transaction_id: str
    created_at: datetime
    risk_score: int
    risk_level: str
    decision: str
    primary_risk_factor: Optional[str] = None
    severity: str
    status: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class AlertDetailResponse(BaseModel):
    alert: AlertResponse
    transaction: Optional[TransactionResponse] = None
    risk_factors: List[RiskFactor] = []


class AlertStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Target status: OPEN, INVESTIGATING, RESOLVED, DISMISSED")


class AlertStatsResponse(BaseModel):
    total: int
    open: int
    investigating: int
    resolved: int
    dismissed: int
    critical: int
    high: int
    medium: int


class PaginatedAlertsResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    data: List[AlertResponse]
