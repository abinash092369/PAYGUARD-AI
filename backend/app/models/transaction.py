from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(50), index=True, nullable=False)
    merchant_id = Column(String(50), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    transaction_timestamp = Column(String(30), nullable=False)
    payment_method = Column(String(30), index=True, nullable=False)
    device_id = Column(String(50), nullable=False)
    ip_address = Column(String(50), nullable=False)
    country = Column(String(10), index=True, nullable=False)
    merchant_category = Column(String(50), index=True, nullable=False)
    customer_age = Column(Integer, nullable=False)
    account_age_days = Column(Integer, nullable=False)
    transaction_count_24h = Column(Integer, nullable=False)
    transaction_amount_24h = Column(Float, nullable=False)
    failed_transactions_24h = Column(Integer, nullable=False)
    previous_transaction_amount = Column(Float, nullable=False)
    distance_from_previous_transaction = Column(Float, nullable=False)
    is_new_device = Column(Integer, nullable=False)
    is_new_ip = Column(Integer, nullable=False)
    is_international = Column(Integer, nullable=False)
    hour_of_day = Column(Integer, nullable=False)
    velocity_score = Column(Float, nullable=False)
    chargeback_history = Column(Integer, nullable=False)
    fraud_label = Column(Integer, index=True, nullable=False)
