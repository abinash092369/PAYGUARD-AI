import os
import pandas as pd
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.services.risk_service import BackendRiskService


class AlertService:
    """
    Handles security alert generation, deduplication, status workflow, and dataset seeding.
    """

    @staticmethod
    def process_transaction_risk_and_alert(db: Session, transaction_dict: dict) -> Optional[Alert]:
        """
        Evaluates risk for a transaction and creates/updates an alert if threshold criteria are met.
        """
        risk_result = BackendRiskService.analyze_transaction(transaction_dict)
        if not risk_result:
            return None

        score = risk_result.get("risk_score", 0)
        level = risk_result.get("risk_level", "LOW")
        decision = risk_result.get("decision", "ALLOW")
        risk_factors = risk_result.get("risk_factors", [])
        summary = risk_result.get("summary", "")
        txn_id = transaction_dict.get("transaction_id", "UNKNOWN")

        # Alert trigger threshold policy
        if score < 40 and level in ["LOW", "MEDIUM"]:
            return None

        severity = level
        primary_factor = risk_factors[0]["code"] if risk_factors else "SUSPICIOUS_PATTERN"

        # Check deduplication: active unresolved alert for this transaction ID
        existing_alert = (
            db.query(Alert)
            .filter(Alert.transaction_id == txn_id, Alert.status.in_(["OPEN", "INVESTIGATING"]))
            .first()
        )

        if existing_alert:
            existing_alert.risk_score = score
            existing_alert.risk_level = level
            existing_alert.decision = decision
            existing_alert.severity = severity
            existing_alert.primary_risk_factor = primary_factor
            existing_alert.description = summary
            db.commit()
            db.refresh(existing_alert)
            return existing_alert

        # Create new alert record
        alert_count = db.query(Alert).count() + 1
        alt_id = f"ALT_{alert_count:08d}"

        new_alert = Alert(
            alert_id=alt_id,
            transaction_id=txn_id,
            created_at=datetime.utcnow(),
            risk_score=score,
            risk_level=level,
            decision=decision,
            primary_risk_factor=primary_factor,
            severity=severity,
            status="OPEN",
            description=summary,
        )

        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return new_alert

    @staticmethod
    def seed_initial_alerts_if_empty(db: Session):
        """
        Seeds demonstration alert records from high-risk dataset transactions if alerts table is empty.
        """
        count = db.query(Alert).count()
        if count > 0:
            return

        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
        if not os.path.exists(csv_path):
            return

        df = pd.read_csv(csv_path)
        # Filter high-risk / fraudulent sample candidates
        high_risk_samples = df[
            (df["fraud_label"] == 1) | (df["is_new_device"] == 1) | (df["failed_transactions_24h"] >= 2)
        ].head(150)

        alerts_created = 0
        for _, row in high_risk_samples.iterrows():
            txn_dict = row.to_dict()
            alert = AlertService.process_transaction_risk_and_alert(db, txn_dict)
            if alert:
                alerts_created += 1
            if alerts_created >= 40:  # Seed ~40 realistic alerts
                break
