import os
import json
import urllib.request
import urllib.error

def test_citizen_ai_flows():
    print("=== Testing Citizen AI Chatbot Flows ===")

    # 1. Test AI direct endpoint with synthetic citizenContext
    url = "http://localhost:8000/chat/ask"
    token = os.getenv("INTERNAL_API_TOKEN", "aram-secret-token-2026")
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Token": token,
        "X-User-Id": "101",
        "X-User-Role": "CITIZEN",
        "X-User-District": "Coimbatore"
    }

    mock_citizen_context = {
        "user": {
            "userId": 101,
            "name": "Karthik Subramanian",
            "district": "Coimbatore",
            "state": "Tamil Nadu",
            "preferredLanguage": "en",
            "role": "CITIZEN"
        },
        "activeCases": [
            {
                "id": 501,
                "complaintCustomId": "ARAM-26-TN-CBE-000123",
                "title": "Unpaid salary for 3 months from textile mill",
                "category": "LABOUR_DISPUTE",
                "status": "GUIDE_ASSIGNED",
                "priority": "HIGH",
                "district": "Coimbatore",
                "authority": "District Labour Commissioner / DLSA Lok Adalat",
                "createdAt": "2026-09-15 10:30",
                "assignedGuideName": "Advocate Priya Sundaram",
                "assignedGuideSpecialization": "Labour and Industrial Law",
                "documents": [
                    {
                        "id": 12,
                        "documentType": "SALARY_SLIP",
                        "fileName": "salary_slips_july_aug.pdf",
                        "verificationStatus": "VERIFIED",
                        "uploadedAt": "2026-09-16 14:00"
                    }
                ],
                "citizenVisibleUpdates": [
                    {
                        "senderRole": "GUIDE",
                        "messageType": "DOCUMENT_REQUEST",
                        "messageText": "Please upload your latest 6 months bank statement showing salary credits.",
                        "sentAt": "2026-09-17 09:15"
                    }
                ]
            }
        ],
        "targetedCase": {
            "id": 501,
            "complaintCustomId": "ARAM-26-TN-CBE-000123",
            "title": "Unpaid salary for 3 months from textile mill",
            "category": "LABOUR_DISPUTE",
            "status": "GUIDE_ASSIGNED",
            "priority": "HIGH",
            "district": "Coimbatore",
            "authority": "District Labour Commissioner / DLSA Lok Adalat",
            "createdAt": "2026-09-15 10:30",
            "assignedGuideName": "Advocate Priya Sundaram",
            "assignedGuideSpecialization": "Labour and Industrial Law",
            "documents": [
                {
                    "id": 12,
                    "documentType": "SALARY_SLIP",
                    "fileName": "salary_slips_july_aug.pdf",
                    "verificationStatus": "VERIFIED",
                    "uploadedAt": "2026-09-16 14:00"
                }
            ],
            "citizenVisibleUpdates": [
                {
                    "senderRole": "GUIDE",
                    "messageType": "DOCUMENT_REQUEST",
                    "messageText": "Please upload your latest 6 months bank statement showing salary credits.",
                    "sentAt": "2026-09-17 09:15"
                }
            ]
        },
        "matchedCaseId": "ARAM-26-TN-CBE-000123"
    }

    test_queries = [
        ("TEST 1: Greeting", "Hi", False),
        ("TEST 2: Status check", "What happened to my complaint?", True),
        ("TEST 3: Document check", "What documents have I uploaded?", True),
        ("TEST 4: Guide instruction check", "What did my guide ask me to do?", True),
        ("TEST 5: Next step check", "What's my next step for this case?", True),
        ("TEST 6: Tamil status check", "En complaint status enna?", True)
    ]

    for label, q, use_case_context in test_queries:
        body = {
            "message": q,
            "language": "en" if "Tamil" not in label else "ta",
            "userRole": "CITIZEN",
            "citizenContext": mock_citizen_context if use_case_context else None
        }
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                print(f"\n{label}:")
                print(f"Query: '{q}'")
                print(f"ResponseType: {data.get('responseType')}")
                reply_snippet = data.get('reply', data.get('answer', ''))[:160]
                safe_reply = reply_snippet.encode("ascii", errors="replace").decode()
                print(f"Reply: {safe_reply}...")
        except urllib.error.HTTPError as e:
            print(f"{label} FAILED: {e} -> {e.read().decode('utf-8', errors='ignore')}")
        except Exception as e:
            print(f"{label} FAILED: {e}")

    # TEST 7: Unauthorized case ID test
    unauth_context = {
        "user": mock_citizen_context["user"],
        "activeCases": [],
        "targetedCase": None,
        "matchedCaseId": "UNAUTHORIZED"
    }
    body_unauth = {
        "message": "Tell me about complaint ARAM-26-TN-CHE-999999",
        "language": "en",
        "userRole": "CITIZEN",
        "citizenContext": unauth_context
    }
    req_unauth = urllib.request.Request(url, data=json.dumps(body_unauth).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req_unauth) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"\nTEST 7: Unauthorized Case Isolation:")
            print(f"ResponseType: {data.get('responseType')}")
            print(f"Reply: {data.get('reply')}")
    except Exception as e:
        print(f"TEST 7 FAILED: {e}")

test_citizen_ai_flows()
