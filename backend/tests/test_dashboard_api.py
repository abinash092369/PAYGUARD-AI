import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "fraudulent_transactions" in data
    assert "fraud_rate" in data
    assert "total_transaction_volume" in data
    assert "average_transaction_amount" in data
    assert data["total_transactions"] >= 0


def test_get_risk_distribution():
    response = client.get("/api/dashboard/risk-distribution")
    assert response.status_code == 200
    data = response.json()
    assert "low" in data
    assert "medium" in data
    assert "high" in data
    assert "critical" in data


def test_get_fraud_trends():
    response = client.get("/api/dashboard/fraud-trends")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "date" in item
        assert "transactions" in item
        assert "fraudulent" in item
        assert "fraud_rate" in item


def test_get_risk_signals():
    response = client.get("/api/dashboard/risk-signals")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "signal_code" in item
        assert "signal_name" in item
        assert "count" in item


def test_get_recent_transactions():
    response = client.get("/api/dashboard/recent-transactions?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


def test_search_and_filter_transactions():
    # Test search query
    response = client.get("/api/transactions?search=TXN_00000001")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data

    # Test fraud label filter
    response_fraud = client.get("/api/transactions?fraud_label=1")
    assert response_fraud.status_code == 200
    data_fraud = response_fraud.json()
    assert "data" in data_fraud
