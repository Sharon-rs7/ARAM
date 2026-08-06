import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_analyze_complaint_security_rejection_xss():
    payload = {
        "description": "<script>alert('xss_attack')</script> Salary unpaid",
        "language": "ENGLISH"
    }
    response = client.post("/complaint/analyze", json=payload)
    assert response.status_code in [200, 422, 400]
    if response.status_code == 200:
        data = response.json()
        assert "<script>" not in data.get("summary", "")

def test_analyze_complaint_empty_description():
    payload = {
        "description": "",
        "language": "ENGLISH"
    }
    response = client.post("/complaint/analyze", json=payload)
    assert response.status_code in [400, 422, 200]
