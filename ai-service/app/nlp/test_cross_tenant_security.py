import sys
import os
import unittest
from fastapi.testclient import TestClient

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.main import app
from app.mongo_context import upsert_ai_context

class TestCrossTenantSecurity(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.internal_token = "aram-secret-token-2026"
        
        # Insert a mock context for testing
        self.complaint_id = 101
        self.context = {
            "complaintId": str(self.complaint_id),
            "citizenId": "citizen-123",
            "regionId": "Chennai",
            "originalText": "This is a land dispute in Chennai district.",
            "originalLanguage": "en",
            "englishProcessingText": "This is a land dispute in Chennai district.",
            "issues": ["Land Dispute"],
            "department": {"label": "Revenue Department", "confidence": 0.95},
            "priority": {"label": "HIGH", "confidence": 0.85},
            "sensitiveCase": False,
            "summary": "Mock summary for Chennai land dispute.",
            "requiredDocuments": ["Land Deed", "Aadhaar Card"],
            "documents": [],
            "ocrResults": [],
            "guideAssignment": {
                "guideId": "guide-456",
                "guideName": "Ramesh Kumar",
                "assignedAt": "2026-08-13T10:00:00"
            },
            "statusHistory": [
                {
                    "status": "SUBMITTED",
                    "timestamp": "2026-08-13T10:00:00",
                    "note": "Initial submission."
                }
            ],
            "messages": [],
            "caseUpdates": [],
            "modelVersions": {},
            "createdAt": "2026-08-13T10:00:00",
            "updatedAt": "2026-08-13T10:00:00"
        }
        upsert_ai_context(self.complaint_id, self.context)

    def test_citizen_access_control(self):
        # 1. Citizen A (citizen-123) should be allowed to access
        headers_ok = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "citizen-123",
            "X-User-Role": "CITIZEN",
            "X-User-District": "Chennai"
        }
        res_ok = self.client.post("/chat/ask", headers=headers_ok, json={
            "message": "What is my complaint status?",
            "language": "en",
            "userRole": "CITIZEN",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertIn("SUBMITTED", res_ok.json()["reply"])

        # 2. Citizen B (citizen-999) should be forbidden
        headers_fail = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "citizen-999",
            "X-User-Role": "CITIZEN",
            "X-User-District": "Chennai"
        }
        res_fail = self.client.post("/chat/ask", headers=headers_fail, json={
            "message": "What is my complaint status?",
            "language": "en",
            "userRole": "CITIZEN",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_fail.status_code, 403)
        self.assertIn("Access denied", res_fail.json()["detail"])

    def test_guide_access_control(self):
        # 1. Guide A (guide-456) should be allowed to access
        headers_ok = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "guide-456",
            "X-User-Role": "HELPER",
            "X-User-District": "Chennai"
        }
        res_ok = self.client.post("/chat/ask", headers=headers_ok, json={
            "message": "Who is the assigned guide?",
            "language": "en",
            "userRole": "HELPER",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertIn("Ramesh Kumar", res_ok.json()["reply"])

        # 2. Guide B (guide-999) should be forbidden
        headers_fail = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "guide-999",
            "X-User-Role": "HELPER",
            "X-User-District": "Chennai"
        }
        res_fail = self.client.post("/chat/ask", headers=headers_fail, json={
            "message": "Who is the assigned guide?",
            "language": "en",
            "userRole": "HELPER",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_fail.status_code, 403)
        self.assertIn("Access denied", res_fail.json()["detail"])

    def test_admin_access_control(self):
        # 1. Chennai Admin should be allowed
        headers_ok = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "admin-1",
            "X-User-Role": "ADMIN",
            "X-User-District": "Chennai"
        }
        res_ok = self.client.post("/chat/ask", headers=headers_ok, json={
            "message": "What is the category of this complaint?",
            "language": "en",
            "userRole": "ADMIN",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertIn("Revenue Department", res_ok.json()["reply"])

        # 2. Madurai Admin should be forbidden
        headers_fail = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "admin-2",
            "X-User-Role": "ADMIN",
            "X-User-District": "Madurai"
        }
        res_fail = self.client.post("/chat/ask", headers=headers_fail, json={
            "message": "What is the category of this complaint?",
            "language": "en",
            "userRole": "ADMIN",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_fail.status_code, 403)
        self.assertIn("Access denied", res_fail.json()["detail"])

        # 3. Global Admin should be allowed
        headers_global = {
            "X-Internal-Token": self.internal_token,
            "X-User-Id": "admin-3",
            "X-User-Role": "ADMIN",
            "X-User-District": "GLOBAL"
        }
        res_global = self.client.post("/chat/ask", headers=headers_global, json={
            "message": "What is the category?",
            "language": "en",
            "userRole": "ADMIN",
            "complaintId": self.complaint_id
        })
        self.assertEqual(res_global.status_code, 200)

if __name__ == "__main__":
    unittest.main()
