import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "PayGuard AI Backend"


def test_docs_page():
    response = client.get("/docs")
    assert response.status_code == 200


def test_transactions_endpoint():
    response = client.get("/api/transactions?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "data" in data


def test_transactions_stats_endpoint():
    response = client.get("/api/transactions/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "fraud_rate" in data
