"""
PayGuard AI - Model Inference Engine
Loads trained model artifacts and computes real-time fraud predictions and probability scores.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

# Ensure src module path resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.feature_engineering import prepare_feature_matrix


_MODEL_CACHE = {}


def get_inference_artifacts():
    """
    Loads and caches model and preprocessor artifacts.
    """
    if "model" in _MODEL_CACHE and "preprocessor" in _MODEL_CACHE:
        return _MODEL_CACHE["model"], _MODEL_CACHE["preprocessor"]

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    models_dir = os.path.join(project_root, "ml-engine", "models")
    model_path = os.path.join(models_dir, "payguard_model.joblib")
    prep_path = os.path.join(models_dir, "preprocessor.joblib")

    if not (os.path.exists(model_path) and os.path.exists(prep_path)):
        raise FileNotFoundError(f"Model artifacts not found in {models_dir}. Please run `train_model.py` first.")

    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)

    _MODEL_CACHE["model"] = model
    _MODEL_CACHE["preprocessor"] = preprocessor

    return model, preprocessor


def predict_transaction(transaction_data: dict) -> dict:
    """
    Predicts fraud risk and probability for a single transaction input dictionary.
    """
    model, preprocessor = get_inference_artifacts()

    # Convert dictionary input to DataFrame
    df_input = pd.DataFrame([transaction_data])

    # Prepare feature matrix using shared feature engineering pipeline
    X_raw, _ = prepare_feature_matrix(df_input)

    # Preprocess
    X_proc = preprocessor.transform(X_raw)

    # Model inference
    prediction = int(model.predict(X_proc)[0])
    
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(X_proc)[0][1])
    else:
        probability = float(prediction)

    fraud_probability = round(probability, 4)
    fraud_probability_percent = round(probability * 100, 2)
    label = "FRAUD" if prediction == 1 else "LEGITIMATE"

    return {
        "fraud_probability": fraud_probability,
        "fraud_probability_percent": fraud_probability_percent,
        "prediction": prediction,
        "label": label,
    }


if __name__ == "__main__":
    # Test example CLI inference run
    sample_transaction = {
        "transaction_id": "TXN_TEST_001",
        "user_id": "USR_00001",
        "merchant_id": "MER_0001",
        "amount": 45000.0,
        "currency": "INR",
        "transaction_timestamp": "2026-08-20 02:30:00",
        "payment_method": "CREDIT_CARD",
        "device_id": "DEV_NEW_999",
        "ip_address": "198.51.100.42",
        "country": "IN",
        "merchant_category": "crypto",
        "customer_age": 28,
        "account_age_days": 15,
        "transaction_count_24h": 14,
        "transaction_amount_24h": 85000.0,
        "failed_transactions_24h": 3,
        "previous_transaction_amount": 1200.0,
        "distance_from_previous_transaction": 650.0,
        "is_new_device": 1,
        "is_new_ip": 1,
        "is_international": 1,
        "hour_of_day": 2,
        "velocity_score": 0.85,
        "chargeback_history": 1,
    }

    result = predict_transaction(sample_transaction)
    print("Sample Inference Result:")
    print(result)
