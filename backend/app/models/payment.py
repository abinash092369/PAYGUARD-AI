from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Index
from app.database import Base


class Payment(Base):
    """
    SQLAlchemy ORM Model representing a Razorpay Test Mode Payment Record.
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(64), index=True, nullable=True)
    order_id = Column(String(64), unique=True, index=True, nullable=False)
    
    amount = Column(Float, nullable=False)
    amount_paise = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    
    status = Column(String(32), default="CREATED", index=True, nullable=False)  # CREATED, VERIFIED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    verified = Column(Boolean, default=False, nullable=False)
    
    transaction_id = Column(String(64), index=True, nullable=True)

    __table_args__ = (
        Index("idx_payment_order_status", "order_id", "status"),
    )
