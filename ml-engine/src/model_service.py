"""
PayGuard AI - Model Service Layer Boundary
Exposes reusable prediction interface for backend API consumption.
"""

from src.predict import predict_transaction, get_inference_artifacts


class ModelService:
    @staticmethod
    def is_model_loaded() -> bool:
        try:
            get_inference_artifacts()
            return True
        except Exception:
            return False

    @staticmethod
    def predict_risk(transaction_data: dict) -> dict:
        return predict_transaction(transaction_data)
