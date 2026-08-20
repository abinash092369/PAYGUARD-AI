"""
PayGuard AI - Model Service Layer Boundary
Exposes reusable prediction, risk scoring, and explainability interface for backend API consumption.
"""

import os
import sys
import json
from typing import Dict, Any

# Ensure src path resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.predict import predict_transaction, get_inference_artifacts
from src.risk_scoring import compute_risk_assessment
from src.explain import detect_risk_factors, generate_explanation_summary


_METADATA_CACHE = {}


def get_cached_metadata() -> Dict[str, Any]:
    """
    Loads and caches model metadata JSON.
    """
    if "meta" in _METADATA_CACHE:
        return _METADATA_CACHE["meta"]

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    meta_path = os.path.join(project_root, "ml-engine", "models", "model_metadata.json")

    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r") as f:
                meta = json.load(f)
                _METADATA_CACHE["meta"] = meta
                return meta
        except Exception:
            pass

    return {
        "model_name": "Random Forest",
        "version": "1.0.0",
        "training_datetime": "",
        "top_features": ["risk_signal_count", "is_new_device", "amount_deviation_ratio"],
    }


class ModelService:
    @staticmethod
    def is_model_loaded() -> bool:
        try:
            get_inference_artifacts()
            return True
        except Exception:
            return False

    @staticmethod
    def predict_risk(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML probability prediction for a transaction.
        """
        return predict_transaction(transaction_data)

    @staticmethod
    def analyze_transaction_risk(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full Phase 4 Analysis Pipeline:
        Transaction -> ML Prediction -> Fraud Prob -> Risk Score (0-100) -> Risk Level -> Decision -> Explainability Factors & Summary.
        """
        # 1. ML Probability Inference
        pred_res = predict_transaction(transaction_data)
        fraud_prob = pred_res["fraud_probability"]

        # 2. Risk Score, Level, and Decision Policy
        risk_score, risk_level, decision = compute_risk_assessment(fraud_prob, transaction_data)

        # 3. Transaction-Specific Risk Factor Detection
        risk_factors = detect_risk_factors(transaction_data)

        # 4. Dynamic Explanation Summary
        summary = generate_explanation_summary(risk_level, decision, risk_factors)

        # 5. Global Model Information
        meta = get_cached_metadata()

        txn_id = str(transaction_data.get("transaction_id", "TXN_UNKNOWN"))

        return {
            "transaction_id": txn_id,
            "fraud_probability": fraud_prob,
            "fraud_probability_percent": round(fraud_prob * 100.0, 2),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "decision": decision,
            "summary": summary,
            "risk_factors": risk_factors,
            "global_top_features": meta.get("top_features", []),
            "model": {
                "name": meta.get("model_name", "Random Forest"),
                "version": meta.get("version", "1.0.0"),
                "training_datetime": meta.get("training_datetime", ""),
            },
        }
