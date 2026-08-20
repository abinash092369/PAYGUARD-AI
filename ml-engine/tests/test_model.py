import os
import unittest
import tempfile
import pandas as pd
import joblib
from src.generate_data import generate_transactions
from src.train_model import train_pipeline
from src.predict import predict_transaction, get_inference_artifacts


class TestMLModelPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Generate small dataset and run training pipeline
        cls.temp_dir = tempfile.mkdtemp()
        cls.data_path = os.path.join(cls.temp_dir, "test_txns.csv")
        df = generate_transactions(num_rows=500, seed=42)
        df.to_csv(cls.data_path, index=False)
        train_pipeline(cls.data_path, seed=42)

    def test_model_and_preprocessor_loading(self):
        model, preprocessor = get_inference_artifacts()
        self.assertIsNotNone(model)
        self.assertIsNotNone(preprocessor)

    def test_normal_transaction_inference(self):
        normal_tx = {
            "transaction_id": "TXN_NORM_001",
            "user_id": "USR_00100",
            "merchant_id": "MER_0005",
            "amount": 250.0,
            "currency": "INR",
            "transaction_timestamp": "2026-08-20 14:30:00",
            "payment_method": "UPI",
            "device_id": "DEV_REG_001",
            "ip_address": "103.22.14.5",
            "country": "IN",
            "merchant_category": "grocery",
            "customer_age": 35,
            "account_age_days": 400,
            "transaction_count_24h": 1,
            "transaction_amount_24h": 250.0,
            "failed_transactions_24h": 0,
            "previous_transaction_amount": 200.0,
            "distance_from_previous_transaction": 2.0,
            "is_new_device": 0,
            "is_new_ip": 0,
            "is_international": 0,
            "hour_of_day": 14,
            "velocity_score": 0.1,
            "chargeback_history": 0,
        }
        res = predict_transaction(normal_tx)
        self.assertIn("fraud_probability", res)
        self.assertIn("prediction", res)
        self.assertIn("label", res)
        self.assertGreaterEqual(res["fraud_probability"], 0.0)
        self.assertLessEqual(res["fraud_probability"], 1.0)
        self.assertIn(res["prediction"], [0, 1])

    def test_anomalous_transaction_inference(self):
        suspicious_tx = {
            "transaction_id": "TXN_SUSP_999",
            "user_id": "USR_00999",
            "merchant_id": "MER_0099",
            "amount": 48000.0,
            "currency": "INR",
            "transaction_timestamp": "2026-08-20 03:15:00",
            "payment_method": "CREDIT_CARD",
            "device_id": "DEV_NEW_999",
            "ip_address": "198.51.100.99",
            "country": "US",
            "merchant_category": "crypto",
            "customer_age": 22,
            "account_age_days": 5,
            "transaction_count_24h": 15,
            "transaction_amount_24h": 95000.0,
            "failed_transactions_24h": 4,
            "previous_transaction_amount": 500.0,
            "distance_from_previous_transaction": 1800.0,
            "is_new_device": 1,
            "is_new_ip": 1,
            "is_international": 1,
            "hour_of_day": 3,
            "velocity_score": 0.95,
            "chargeback_history": 1,
        }
        res = predict_transaction(suspicious_tx)
        self.assertIsInstance(res["fraud_probability"], float)
        self.assertGreaterEqual(res["fraud_probability"], 0.0)
        self.assertLessEqual(res["fraud_probability"], 1.0)
        self.assertIn(res["label"], ["LEGITIMATE", "FRAUD"])

    def test_model_serialization_reload(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, ".."))
        model_path = os.path.join(project_root, "models", "payguard_model.joblib")

        loaded_model = joblib.load(model_path)
        self.assertIsNotNone(loaded_model)
        self.assertTrue(hasattr(loaded_model, "predict"))


if __name__ == "__main__":
    unittest.main()
