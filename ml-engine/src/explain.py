"""
PayGuard AI - Risk Factor Detection & Explainability Engine
Identifies transaction-specific threat vectors and synthesizes human-readable risk explanations.
"""

import os
import sys
from typing import Dict, Any, List

# Ensure src path resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.feature_engineering import add_engineered_features


def detect_risk_factors(transaction: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Detects grounded risk factors from transaction telemetry.
    Only returns risk factors supported by empirical feature data.
    """
    import pandas as pd

    df = pd.DataFrame([transaction])
    df_eng = add_engineered_features(df)
    row = df_eng.iloc[0]

    factors = []

    # 1. New Device Vector
    if int(row.get("is_new_device", 0)) == 1:
        factors.append({
            "code": "NEW_DEVICE",
            "title": "Unrecognized Hardware Device",
            "severity": "MEDIUM",
            "description": "Transaction originated from a hardware device fingerprint not previously associated with the user account."
        })

    # 2. New IP Origin Vector
    if int(row.get("is_new_ip", 0)) == 1:
        factors.append({
            "code": "NEW_IP",
            "title": "Unfamiliar IP Network Origin",
            "severity": "LOW",
            "description": "Transaction initiated from an IP network location not in the user's historical access profile."
        })

    # 3. High Transaction Amount
    amt = float(row.get("amount", 0.0))
    if amt > 25000.0:
        factors.append({
            "code": "HIGH_TRANSACTION_AMOUNT",
            "title": "High Value Transaction Amount",
            "severity": "HIGH" if amt > 45000.0 else "MEDIUM",
            "description": f"Transaction value of INR {amt:,.2f} exceeds standard retail baseline thresholds."
        })

    # 4. Unusual Amount Deviation
    amt_dev = float(row.get("amount_deviation_ratio", 1.0))
    amt_prev = float(row.get("amount_vs_previous_ratio", 1.0))
    if amt_dev > 3.0 or amt_prev > 4.0:
        factors.append({
            "code": "UNUSUAL_AMOUNT",
            "title": "Abnormal Amount Spike Ratio",
            "severity": "HIGH",
            "description": f"Transaction amount is {amt_dev:.1f}x higher than the user's 24-hour average transaction baseline."
        })

    # 5. High Transaction Velocity
    vel = float(row.get("velocity_score", 0.0))
    cnt_24h = int(row.get("transaction_count_24h", 0))
    if vel > 0.65 or cnt_24h > 8:
        factors.append({
            "code": "HIGH_TRANSACTION_VELOCITY",
            "title": "Rapid Transaction Velocity Burst",
            "severity": "HIGH" if cnt_24h > 12 else "MEDIUM",
            "description": f"Elevated frequency rate detected with {cnt_24h} payment attempts within a 24-hour period."
        })

    # 6. Failed Transaction Attempts
    failed_24h = int(row.get("failed_transactions_24h", 0))
    if failed_24h >= 2:
        factors.append({
            "code": "HIGH_FAILED_TRANSACTION_COUNT",
            "title": "Multiple Failed Authorization Attempts",
            "severity": "HIGH" if failed_24h >= 4 else "MEDIUM",
            "description": f"Account recorded {failed_24h} consecutive failed transaction attempts in the trailing 24 hours."
        })

    # 7. International Anomaly
    is_intl = int(row.get("is_international", 0))
    country = str(row.get("country", "IN"))
    if is_intl == 1 or country != "IN":
        factors.append({
            "code": "INTERNATIONAL_TRANSACTION",
            "title": "Cross-Border International Payment",
            "severity": "MEDIUM",
            "description": f"Transaction routed through cross-border jurisdiction ({country})."
        })

    # 8. Large Distance Movement (Impossible Travel)
    dist = float(row.get("distance_from_previous_transaction", 0.0))
    if dist > 300.0:
        factors.append({
            "code": "LARGE_DISTANCE_FROM_PREVIOUS_TRANSACTION",
            "title": "Geographic Location Anomaly",
            "severity": "HIGH" if dist > 1000.0 else "MEDIUM",
            "description": f"Geographic distance of {dist:.1f} km from previous transaction origin exceeds physical mobility thresholds."
        })

    # 9. New Account Profile
    acct_days = int(row.get("account_age_days", 999))
    if acct_days < 30:
        factors.append({
            "code": "ACCOUNT_TOO_NEW",
            "title": "Newly Provisioned Account",
            "severity": "LOW" if acct_days > 10 else "MEDIUM",
            "description": f"Account was registered recently ({acct_days} days ago), limiting historical baseline verification."
        })

    # 10. Chargeback History
    cb_hist = int(row.get("chargeback_history", 0))
    if cb_hist == 1:
        factors.append({
            "code": "CHARGEBACK_HISTORY",
            "title": "Historical Chargeback Record",
            "severity": "HIGH",
            "description": "User account contains prior dispute or chargeback incident logs."
        })

    # 11. Abnormal Night Behavior
    is_night = int(row.get("is_night_transaction", 0))
    if is_night == 1 and (int(row.get("is_new_device", 0)) == 1 or amt > 10000):
        factors.append({
            "code": "ABNORMAL_BEHAVIOR",
            "title": "Off-Hours High Value Activity",
            "severity": "MEDIUM",
            "description": "Transaction executed during off-peak night hours (1 AM - 4 AM) with unverified hardware."
        })

    return factors


def generate_explanation_summary(risk_level: str, decision: str, risk_factors: List[Dict[str, str]]) -> str:
    """
    Synthesizes a dynamic natural-language explanation summary based on active risk factors and decision policy.
    """
    if not risk_factors:
        return "Transaction exhibits normal payment telemetry matching historical user baseline patterns. Low risk detected."

    factor_titles = [f["title"] for f in risk_factors[:3]]
    titles_str = ", ".join(factor_titles)

    if decision == "BLOCK" or risk_level == "CRITICAL":
        return f"CRITICAL RISK DETECTED — Transaction flagged for immediate automated blocking due to high-severity threat vectors: {titles_str}."
    elif decision == "REVIEW" or risk_level in ["HIGH", "MEDIUM"]:
        return f"ELEVATED RISK FLAG — Transaction routed for manual compliance review driven by behavioral anomalies: {titles_str}."
    else:
        return f"LOW RISK NOTICE — Transaction approved automatically with minor monitored telemetry indicators: {titles_str}."
