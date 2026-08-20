import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_post_risk_analyze_valid():
    payload = {
        "transaction_id": "TXN_POST_TEST",
        "user_id": "USR_00001",
        "merchant_id": "MER_0001",
        "amount": 2500.0,
        "currency": "INR",
        "transaction_timestamp": "2026-08-20 14:00:00",
        "payment_method": "UPI",
        "device_id": "DEV_000001",
        "ip_address": "127.0.0.1",
        "country": "IN",
        "merchant_category": "ecommerce",
        "customer_age": 30,
        "account_age_days": 180,
        "transaction_count_24h": 2,
        "transaction_amount_24h": 3000.0,
        "failed_transactions_24h": 0,
        "previous_transaction_amount": 500.0,
        "distance_from_previous_transaction": 5.0,
        "is_new_device": 0,
        "is_new_ip": 0,
        "is_international": 0,
        "hour_of_day": 14,
        "velocity_score": 0.2,
        "chargeback_history": 0,
    }

    response = client.post("/api/risk/analyze", json=payload)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True

    data = res_json["data"]
    assert data["transaction_id"] == "TXN_POST_TEST"
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert data["decision"] in ["ALLOW", "REVIEW", "BLOCK"]
    assert "summary" in data
    assert "risk_factors" in data


def test_post_risk_analyze_invalid_amount():
    payload = {
        "amount": -500.0,  # Invalid negative amount
        "customer_age": 25,
        "account_age_days": 10,
        "transaction_count_24h": 1,
        "transaction_amount_24h": 100.0,
        "failed_transactions_24h": 0,
        "previous_transaction_amount": 100.0,
        "distance_from_previous_transaction": 1.0,
        "is_new_device": 0,
        "is_new_ip": 0,
        "is_international": 0,
        "hour_of_day": 12,
        "velocity_score": 0.1,
        "chargeback_history": 0,
        "payment_method": "UPI",
        "merchant_category": "grocery",
    }
    response = client.post("/api/risk/analyze", json=payload)
    assert response.status_code == 422  # Validation error


def test_get_transaction_risk_existing():
    response = client.get("/api/transactions/TXN_00000001/risk")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["transaction_id"] == "TXN_00000001"
    assert 0 <= res_json["data"]["risk_score"] <= 100


def test_get_transaction_risk_not_found():
    response = client.get("/api/transactions/TXN_NON_EXISTENT_99999/risk")
    assert response.status_code == 404
