import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_payment_order_valid():
    response = client.post("/api/payments/create-order", json={"amount": 750.0, "currency": "INR"})
    assert response.status_code == 200
    data = response.json()
    assert "order_id" in data
    assert data["amount_paise"] == 75000
    assert data["amount_rupees"] == 750.0
    assert data["currency"] == "INR"
    assert "key_id" in data


def test_create_payment_order_invalid_amount():
    response = client.post("/api/payments/create-order", json={"amount": -100.0, "currency": "INR"})
    assert response.status_code == 422  # Validation error


def test_create_payment_order_invalid_currency():
    response = client.post("/api/payments/create-order", json={"amount": 500.0, "currency": "USD"})
    assert response.status_code == 400


def test_verify_payment_signature_valid():
    # Create order first
    order_resp = client.post("/api/payments/create-order", json={"amount": 500.0, "currency": "INR"})
    assert order_resp.status_code == 200
    order_id = order_resp.json()["order_id"]

    # Verify with mock valid signature
    verify_resp = client.post("/api/payments/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_mock_123456789",
        "razorpay_signature": "mock_signature_valid",
        "telemetry_override": {
            "is_new_device": 1,
            "failed_transactions_24h": 3
        }
    })
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert data["verified"] is True
    assert data["order_id"] == order_id
    assert "transaction_id" in data
    assert "risk_analysis" in data
    assert "risk_score" in data["risk_analysis"]


def test_verify_payment_signature_invalid():
    verify_resp = client.post("/api/payments/verify", json={
        "razorpay_order_id": "order_invalid_999",
        "razorpay_payment_id": "pay_invalid_999",
        "razorpay_signature": "invalid_sig_hash_value"
    })
    assert verify_resp.status_code == 400


def test_get_payments_paginated():
    response = client.get("/api/payments?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "data" in data
    assert isinstance(data["data"], list)
