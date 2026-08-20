"""
PayGuard AI - Risk Scoring & Policy Decision Engine
Maps model fraud probabilities to 0-100 risk scores, risk levels, and automated policy decisions.
"""

from typing import Dict, Any, Tuple

# Configurable Risk Thresholds
LOW_RISK_MAX = 24
MEDIUM_RISK_MAX = 49
HIGH_RISK_MAX = 74

# Valid Enum Constants
RISK_LEVEL_LOW = "LOW"
RISK_LEVEL_MEDIUM = "MEDIUM"
RISK_LEVEL_HIGH = "HIGH"
RISK_LEVEL_CRITICAL = "CRITICAL"

DECISION_ALLOW = "ALLOW"
DECISION_REVIEW = "REVIEW"
DECISION_BLOCK = "BLOCK"


def calculate_risk_score(fraud_probability: float, transaction_features: Dict[str, Any] = None) -> int:
    """
    Transforms model fraud probability (0.0 to 1.0) into an interpretable 0-100 PayGuard Risk Score.
    Can optionally incorporate secondary behavioral telemetry adjustments.
    """
    prob = max(0.0, min(1.0, float(fraud_probability)))
    
    # Base risk score calculation from calibrated ML probability
    base_score = prob * 100.0

    # Optional minor behavioral fine-tuning if severe risk signals align
    score_adjustment = 0.0
    if transaction_features:
        # Boost score slightly if multiple severe flags co-occur
        if transaction_features.get("chargeback_history", 0) == 1 and transaction_features.get("is_new_device", 0) == 1:
            score_adjustment += 3.0
        if transaction_features.get("failed_transactions_24h", 0) >= 3 and transaction_features.get("is_new_ip", 0) == 1:
            score_adjustment += 2.0

    final_score = int(round(min(100.0, max(0.0, base_score + score_adjustment))))
    return final_score


def determine_risk_level(risk_score: int) -> str:
    """
    Categorizes 0-100 risk score into standardized risk levels.
    """
    if risk_score <= LOW_RISK_MAX:
        return RISK_LEVEL_LOW
    elif risk_score <= MEDIUM_RISK_MAX:
        return RISK_LEVEL_MEDIUM
    elif risk_score <= HIGH_RISK_MAX:
        return RISK_LEVEL_HIGH
    else:
        return RISK_LEVEL_CRITICAL


def evaluate_decision_policy(risk_level: str) -> str:
    """
    Applies configurable risk policy to recommend final payment action.
    """
    if risk_level == RISK_LEVEL_LOW:
        return DECISION_ALLOW
    elif risk_level in [RISK_LEVEL_MEDIUM, RISK_LEVEL_HIGH]:
        return DECISION_REVIEW
    elif risk_level == RISK_LEVEL_CRITICAL:
        return DECISION_BLOCK
    else:
        return DECISION_REVIEW


def compute_risk_assessment(fraud_prob: float, transaction_features: Dict[str, Any] = None) -> Tuple[int, str, str]:
    """
    Unified calculation helper returning (risk_score, risk_level, decision).
    """
    score = calculate_risk_score(fraud_prob, transaction_features)
    level = determine_risk_level(score)
    decision = evaluate_decision_policy(level)
    return score, level, decision
