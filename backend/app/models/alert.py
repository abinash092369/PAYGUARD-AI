from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Index
from app.database import Base


class Alert(Base):
    """
    SQLAlchemy ORM Model representing an automated security/fraud alert.
    """
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(64), unique=True, index=True, nullable=False)
    transaction_id = Column(String(64), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(32), index=True, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    decision = Column(String(32), nullable=False)                 # ALLOW, REVIEW, BLOCK
    
    primary_risk_factor = Column(String(128), nullable=True)
    severity = Column(String(32), index=True, nullable=False)    # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(32), default="OPEN", index=True, nullable=False)  # OPEN, INVESTIGATING, RESOLVED, DISMISSED
    
    description = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_alert_status_severity", "status", "severity"),
        Index("idx_alert_txn_status", "transaction_id", "status"),
    )
