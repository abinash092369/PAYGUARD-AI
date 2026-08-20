import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_alerts_stats():
    response = client.get("/api/alerts/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "open" in data
    assert "critical" in data
    assert "high" in data


def test_get_recent_alerts():
    response = client.get("/api/alerts/recent?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


def test_get_alerts_paginated_and_filtered():
    response = client.get("/api/alerts?page=1&limit=10&status=OPEN")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "data" in data
    assert isinstance(data["data"], list)


def test_alert_detail_and_status_update():
    # First get an existing alert ID
    recent_resp = client.get("/api/alerts/recent?limit=1")
    assert recent_resp.status_code == 200
    recent_data = recent_resp.json()

    if len(recent_data) > 0:
        target_alt_id = recent_data[0]["alert_id"]

        # Fetch detail
        detail_resp = client.get(f"/api/alerts/{target_alt_id}")
        assert detail_resp.status_code == 200
        detail_json = detail_resp.json()
        assert "alert" in detail_json
        assert detail_json["alert"]["alert_id"] == target_alt_id

        # Update status to INVESTIGATING
        patch_resp = client.patch(f"/api/alerts/{target_alt_id}", json={"status": "INVESTIGATING"})
        assert patch_resp.status_code == 200
        assert patch_resp.json()["status"] == "INVESTIGATING"

        # Update status to RESOLVED
        patch_resp2 = client.patch(f"/api/alerts/{target_alt_id}", json={"status": "RESOLVED"})
        assert patch_resp2.status_code == 200
        assert patch_resp2.json()["status"] == "RESOLVED"


def test_patch_invalid_alert_status():
    recent_resp = client.get("/api/alerts/recent?limit=1")
    if len(recent_resp.json()) > 0:
        target_alt_id = recent_resp.json()[0]["alert_id"]
        patch_resp = client.patch(f"/api/alerts/{target_alt_id}", json={"status": "INVALID_STATUS_VALUE"})
        assert patch_resp.status_code == 422  # Validation error


def test_analytics_endpoints():
    r1 = client.get("/api/analytics/fraud-rate")
    assert r1.status_code == 200
    assert isinstance(r1.json(), list)

    r2 = client.get("/api/analytics/risk-trends")
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)

    r3 = client.get("/api/analytics/risk-signals")
    assert r3.status_code == 200
    assert isinstance(r3.json(), list)

    r4 = client.get("/api/analytics/merchant-risk")
    assert r4.status_code == 200
    assert isinstance(r4.json(), list)

    r5 = client.get("/api/analytics/payment-method-risk")
    assert r5.status_code == 200
    assert isinstance(r5.json(), list)


def test_monitoring_endpoints():
    s_resp = client.get("/api/monitoring/summary")
    assert s_resp.status_code == 200
    assert "total_transactions" in s_resp.json()

    hr_resp = client.get("/api/monitoring/high-risk?page=1&limit=5")
    assert hr_resp.status_code == 200
    assert "data" in hr_resp.json()

    crit_resp = client.get("/api/monitoring/critical?page=1&limit=5")
    assert crit_resp.status_code == 200
    assert "data" in crit_resp.json()
