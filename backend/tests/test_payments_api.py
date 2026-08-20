import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import hmac
import hashlib
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
    with patch("app.services.payment_service.RAZORPAY_KEY_ID", "rzp_test_demo_key_id"):
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


def test_verify_real_mode_rejects_mock_signature():
    with patch("app.services.payment_service.RAZORPAY_KEY_ID", "rzp_test_real_key_123"):
        response = client.post("/api/payments/verify", json={
            "razorpay_order_id": "order_real_123456",
            "razorpay_payment_id": "pay_123456789",
            "razorpay_signature": "mock_signature_valid"
        })
        assert response.status_code == 400
        assert response.json()["detail"] == "Razorpay payment signature verification failed. Invalid signature token."


def test_verify_real_mode_rejects_mock_order_id():
    with patch("app.services.payment_service.RAZORPAY_KEY_ID", "rzp_test_real_key_123"):
        response = client.post("/api/payments/verify", json={
            "razorpay_order_id": "order_rzp_test_mock123",
            "razorpay_payment_id": "pay_123456789",
            "razorpay_signature": "mock_signature_valid"
        })
        assert response.status_code == 400


class MockOrder:
    def create(self, data):
        import uuid
        return {"id": f"order_real_{uuid.uuid4().hex[:12]}"}


class MockClient:
    def __init__(self):
        self.order = MockOrder()


def test_verify_real_mode_success_with_valid_signature():
    key_id = "rzp_test_real_key_123"
    key_secret = "real_secret_key_456"
    payment_id = "pay_123456789"
    mock_client = MockClient()

    with patch("app.services.payment_service.RAZORPAY_KEY_ID", key_id), \
         patch("app.services.payment_service.RAZORPAY_KEY_SECRET", key_secret), \
         patch("app.services.payment_service.PaymentService.get_razorpay_client", return_value=mock_client):
        
        # 1. Create order
        order_resp = client.post("/api/payments/create-order", json={"amount": 500.0, "currency": "INR"})
        assert order_resp.status_code == 200
        created_order_id = order_resp.json()["order_id"]
        assert not created_order_id.startswith("order_rzp_test_")
        
        # 2. Compute signature
        msg = f"{created_order_id}|{payment_id}"
        sig = hmac.new(
            key_secret.encode("utf-8"),
            msg.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        # 3. Verify payment signature
        verify_resp = client.post("/api/payments/verify", json={
            "razorpay_order_id": created_order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig
        })
        assert verify_resp.status_code == 200
        assert verify_resp.json()["verified"] is True


def test_verify_real_mode_failure_with_invalid_signature():
    key_id = "rzp_test_real_key_123"
    key_secret = "real_secret_key_456"
    mock_client = MockClient()
    
    with patch("app.services.payment_service.RAZORPAY_KEY_ID", key_id), \
         patch("app.services.payment_service.RAZORPAY_KEY_SECRET", key_secret), \
         patch("app.services.payment_service.PaymentService.get_razorpay_client", return_value=mock_client):
        
        order_resp = client.post("/api/payments/create-order", json={"amount": 500.0, "currency": "INR"})
        assert order_resp.status_code == 200
        created_order_id = order_resp.json()["order_id"]
        
        verify_resp = client.post("/api/payments/verify", json={
            "razorpay_order_id": created_order_id,
            "razorpay_payment_id": "pay_123456789",
            "razorpay_signature": "invalid_signature_value"
        })
        assert verify_resp.status_code == 400


def test_verify_missing_fields():
    # 1. Missing razorpay_signature
    response = client.post("/api/payments/verify", json={
        "razorpay_order_id": "order_123",
        "razorpay_payment_id": "pay_123"
    })
    assert response.status_code == 422

    # 2. Missing razorpay_payment_id
    response = client.post("/api/payments/verify", json={
        "razorpay_order_id": "order_123",
        "razorpay_signature": "sig_123"
    })
    assert response.status_code == 422

    # 3. Missing razorpay_order_id
    response = client.post("/api/payments/verify", json={
        "razorpay_payment_id": "pay_123",
        "razorpay_signature": "sig_123"
    })
    assert response.status_code == 422

