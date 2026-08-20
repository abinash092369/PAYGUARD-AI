import unittest
from src.risk_scoring import (
    calculate_risk_score,
    determine_risk_level,
    evaluate_decision_policy,
    compute_risk_assessment,
    LOW_RISK_MAX,
    MEDIUM_RISK_MAX,
    HIGH_RISK_MAX,
)
from src.explain import detect_risk_factors, generate_explanation_summary
from src.model_service import ModelService


class TestRiskEngine(unittest.TestCase):
    def test_probability_to_score_mapping(self):
        self.assertEqual(calculate_risk_score(0.0), 0)
        self.assertEqual(calculate_risk_score(0.24), 24)
        self.assertEqual(calculate_risk_score(0.50), 50)
        self.assertEqual(calculate_risk_score(0.75), 75)
        self.assertEqual(calculate_risk_score(1.0), 100)

    def test_risk_level_thresholds(self):
        self.assertEqual(determine_risk_level(0), "LOW")
        self.assertEqual(determine_risk_level(LOW_RISK_MAX), "LOW")
        self.assertEqual(determine_risk_level(LOW_RISK_MAX + 1), "MEDIUM")
        self.assertEqual(determine_risk_level(MEDIUM_RISK_MAX), "MEDIUM")
        self.assertEqual(determine_risk_level(MEDIUM_RISK_MAX + 1), "HIGH")
        self.assertEqual(determine_risk_level(HIGH_RISK_MAX), "HIGH")
        self.assertEqual(determine_risk_level(HIGH_RISK_MAX + 1), "CRITICAL")
        self.assertEqual(determine_risk_level(100), "CRITICAL")

    def test_decision_policy_rules(self):
        self.assertEqual(evaluate_decision_policy("LOW"), "ALLOW")
        self.assertEqual(evaluate_decision_policy("MEDIUM"), "REVIEW")
        self.assertEqual(evaluate_decision_policy("HIGH"), "REVIEW")
        self.assertEqual(evaluate_decision_policy("CRITICAL"), "BLOCK")

    def test_risk_factor_detection_and_explanation(self):
        suspicious_tx = {
            "transaction_id": "TXN_SUSP_100",
            "amount": 55000.0,
            "is_new_device": 1,
            "is_new_ip": 1,
            "is_international": 1,
            "country": "US",
            "failed_transactions_24h": 4,
            "distance_from_previous_transaction": 1500.0,
            "account_age_days": 5,
            "chargeback_history": 1,
        }
        factors = detect_risk_factors(suspicious_tx)
        codes = [f["code"] for f in factors]
        self.assertIn("NEW_DEVICE", codes)
        self.assertIn("HIGH_TRANSACTION_AMOUNT", codes)
        self.assertIn("HIGH_FAILED_TRANSACTION_COUNT", codes)
        self.assertIn("CHARGEBACK_HISTORY", codes)

        summary = generate_explanation_summary("CRITICAL", "BLOCK", factors)
        self.assertIn("CRITICAL RISK DETECTED", summary)

    def test_full_model_service_analysis(self):
        tx = {
            "transaction_id": "TXN_FULL_001",
            "user_id": "USR_00001",
            "merchant_id": "MER_0001",
            "amount": 500.0,
            "currency": "INR",
            "transaction_timestamp": "2026-08-20 12:00:00",
            "payment_method": "UPI",
            "device_id": "DEV_000001",
            "ip_address": "127.0.0.1",
            "country": "IN",
            "merchant_category": "grocery",
            "customer_age": 30,
            "account_age_days": 365,
            "transaction_count_24h": 1,
            "transaction_amount_24h": 500.0,
            "failed_transactions_24h": 0,
            "previous_transaction_amount": 400.0,
            "distance_from_previous_transaction": 1.0,
            "is_new_device": 0,
            "is_new_ip": 0,
            "is_international": 0,
            "hour_of_day": 12,
            "velocity_score": 0.1,
            "chargeback_history": 0,
        }
        res = ModelService.analyze_transaction_risk(tx)
        self.assertEqual(res["transaction_id"], "TXN_FULL_001")
        self.assertIn(res["risk_level"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertIn(res["decision"], ["ALLOW", "REVIEW", "BLOCK"])
        self.assertIsInstance(res["risk_score"], int)
        self.assertIsInstance(res["summary"], str)


if __name__ == "__main__":
    unittest.main()
