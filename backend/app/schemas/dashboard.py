from typing import List, Optional
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_transactions: int
    fraudulent_transactions: int
    legitimate_transactions: int
    fraud_rate: float
    total_transaction_volume: float
    average_transaction_amount: float
    max_transaction_amount: float
    high_risk_transactions: int
    critical_risk_transactions: int


class RiskDistributionResponse(BaseModel):
    low: int
    medium: int
    high: int
    critical: int


class FraudTrendItem(BaseModel):
    date: str
    transactions: int
    fraudulent: int
    legitimate: int
    fraud_rate: float
    total_amount: float


class RiskSignalItem(BaseModel):
    signal_code: str
    signal_name: str
    count: int
    severity: str
    description: str
