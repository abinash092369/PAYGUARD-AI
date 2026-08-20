from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TransactionBase(BaseModel):
    transaction_id: str
    user_id: str
    merchant_id: str
    amount: float
    currency: str
    transaction_timestamp: str
    payment_method: str
    device_id: str
    ip_address: str
    country: str
    merchant_category: str
    customer_age: int
    account_age_days: int
    transaction_count_24h: int
    transaction_amount_24h: float
    failed_transactions_24h: int
    previous_transaction_amount: float
    distance_from_previous_transaction: float
    is_new_device: int
    is_new_ip: int
    is_international: int
    hour_of_day: int
    velocity_score: float
    chargeback_history: int
    fraud_label: int


class TransactionResponse(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TransactionStatsResponse(BaseModel):
    total_transactions: int
    fraudulent_transactions: int
    legitimate_transactions: int
    fraud_rate: float
    average_transaction_amount: float
    max_transaction_amount: float


class PaginatedTransactionsResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    data: List[TransactionResponse]
