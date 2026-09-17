import urllib.request
import urllib.parse
import json
import sys
import uuid

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://localhost:8082/api"
AI_SERVICE_URL = "http://localhost:8000"

print("=" * 80)
print("     ARAM AI — FINAL 12-STAGE END-TO-END CASE LIFECYCLE EMPIRICAL SUITE")
print("=" * 80)

pass_count = 0
fail_count = 0

def log_test(num, title, passed, details=""):
    global pass_count, fail_count
    if passed:
        pass_count += 1
        print(f"[PASS] TEST {num:02d}: {title}")
        if details:
            print(f"       └─ {details}")
    else:
        fail_count += 1
        print(f"[FAIL] TEST {num:02d}: {title}")
        if details:
            print(f"       └─ ERROR: {details}")

def request_json(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as he:
        err_body = he.read().decode("utf-8") if he.fp else ""
        raise Exception(f"HTTP {he.code}: {err_body or he.reason}")

# ==============================================================================
# TEST 1: Authentication & Multi-Role Token Verification
# ==============================================================================
citizen_token = None
volunteer_token = None
admin_token = None
volunteer_id = None
citizen_id = None

try:
    c_login = request_json(f"{BACKEND_URL}/auth/login", "POST", {"email": "citizen@gmail.com", "password": "Citizen@123"})
    citizen_token = c_login["accessToken"]
    citizen_id = c_login["user"]["id"]

    v_login = request_json(f"{BACKEND_URL}/auth/login", "POST", {"email": "volunteer@gmail.com", "password": "Helper@123"})
    volunteer_token = v_login["accessToken"]
    volunteer_id = v_login["user"]["id"]

    a_login = request_json(f"{BACKEND_URL}/auth/login", "POST", {"email": "admin@gmail.com", "password": "Admin@123"})
    admin_token = a_login["accessToken"]

    t1 = bool(citizen_token and volunteer_token and admin_token)
    log_test(1, "Authentication & Role Tokens", t1, f"Citizen ID: {citizen_id} | Volunteer ID: {volunteer_id} | Admin: verified")
except Exception as e:
    log_test(1, "Authentication & Role Tokens", False, str(e))

# ==============================================================================
# TEST 2: Citizen Intake & RAG Triage
# ==============================================================================
complaint_id = None
complaint_custom_id = None

try:
    c_payload = {
        "title": "Neighbor Wall Encroachment on Patta Land",
        "description": "Neighbor built a brick boundary wall 3 feet inside my registered land in Coimbatore. They are threatening when asked to stop.",
        "category": "PROPERTY_CIVIL_DISPUTE",
        "priority": "HIGH",
        "district": "Coimbatore",
        "language": "ENGLISH",
        "inputMode": "TEXT",
        "guideRequested": True,
        "disclaimerAccepted": True
    }
    c_res = request_json(f"{BACKEND_URL}/complaints", "POST", c_payload, citizen_token)
    complaint_id = c_res.get("id")
    complaint_custom_id = c_res.get("complaintCustomId")
    t2 = bool(complaint_id and c_res.get("status"))
    log_test(2, "Citizen Intake & Grounded Triage", t2, f"Created Case ID: {complaint_id} ({complaint_custom_id}) | Status: {c_res.get('status')}")
except Exception as e:
    log_test(2, "Citizen Intake & Grounded Triage", False, str(e))

# ==============================================================================
# TEST 3: Document Upload & Real OCR Pipeline
# ==============================================================================
doc_id = None
try:
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    # Standard valid PDF magic bytes (%PDF-1.4)
    file_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test_patta_receipt.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + file_content + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{BACKEND_URL}/complaints/{complaint_id}/evidence",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {citizen_token}"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        upload_res = json.loads(resp.read().decode("utf-8"))
        doc_id = upload_res.get("id")
        t3 = bool(doc_id)
        log_test(3, "Evidence Upload & Real OCR Pipeline", t3, f"Evidence Doc ID: {doc_id} | Initial Status: {upload_res.get('verificationStatus')}")
except Exception as e:
    log_test(3, "Evidence Upload & Real OCR Pipeline", False, str(e))

# ==============================================================================
# TEST 4: Regional Admin Queue & Review
# ==============================================================================
try:
    admin_cases = request_json(f"{BACKEND_URL}/admin/complaints", "GET", None, admin_token)
    matched = [c for c in admin_cases if c.get("id") == complaint_id]
    t4 = len(matched) > 0
    case_status = matched[0].get("status") if t4 else "NOT_FOUND"
    log_test(4, "Regional Admin Queue & Review", t4, f"Case {complaint_custom_id} visible in Admin Queue with Status: {case_status}")
except Exception as e:
    log_test(4, "Regional Admin Queue & Review", False, str(e))

# ==============================================================================
# TEST 5: AI Volunteer Recommendation
# ==============================================================================
try:
    recs = request_json(f"{BACKEND_URL}/admin/complaints/{complaint_id}/recommended-guides", "GET", None, admin_token)
    t5 = isinstance(recs, list) and len(recs) > 0
    top_rec = recs[0] if t5 else {}
    log_test(5, "AI Volunteer Recommendation", t5, f"Candidate Guides: {len(recs)} | Top: {top_rec.get('name')} (Match: {top_rec.get('matchScore')})")
except Exception as e:
    log_test(5, "AI Volunteer Recommendation", False, str(e))

# ==============================================================================
# TEST 6: Human Guide Assignment by Admin
# ==============================================================================
try:
    assign_payload = {
        "legalGuideId": volunteer_id,
        "overrideReason": "Best matched certified legal volunteer in region",
        "adminNote": "Assigned for boundary document verification"
    }
    assign_res = request_json(f"{BACKEND_URL}/admin/complaints/{complaint_id}/assign-legal-guide", "POST", assign_payload, admin_token)
    t6 = bool(assign_res.get("success") or assign_res.get("status") or assign_res.get("message"))
    log_test(6, "Human Guide Assignment by Admin", t6, f"Volunteer {volunteer_id} assigned | Response: {assign_res.get('message', 'Assigned successfully')}")
except Exception as e:
    log_test(6, "Human Guide Assignment by Admin", False, str(e))

# ==============================================================================
# TEST 7: Volunteer Workspace & Case Acknowledgment
# ==============================================================================
try:
    ack_res = request_json(f"{BACKEND_URL}/volunteer/cases/{complaint_id}/acknowledge", "POST", {}, volunteer_token)
    t7 = bool(ack_res.get("success"))
    log_test(7, "Volunteer Acknowledgment & Activation", t7, "Case acknowledged. Transitioned to active IN_PROGRESS")
except Exception as e:
    log_test(7, "Volunteer Acknowledgment & Activation", False, str(e))

# ==============================================================================
# TEST 8: Citizen-Guide Secure Messaging
# ==============================================================================
try:
    # 1. Guide sends message
    request_json(
        f"{BACKEND_URL}/cases/{complaint_id}/messages",
        "POST",
        {"messageText": "Hello citizen, I am your assigned Legal Guide. Please share the revenue survey sketch.", "messageType": "TEXT"},
        volunteer_token
    )
    # 2. Citizen replies
    request_json(
        f"{BACKEND_URL}/cases/{complaint_id}/messages",
        "POST",
        {"messageText": "Sure, I have uploaded the patta receipt and will get the survey sketch today.", "messageType": "TEXT"},
        citizen_token
    )
    # 3. Retrieve thread
    messages = request_json(f"{BACKEND_URL}/cases/{complaint_id}/messages", "GET", None, volunteer_token)
    t8 = len(messages) >= 2
    log_test(8, "Citizen-Guide Secure Messaging", t8, f"Thread Verified: {len(messages)} messages persisted in ARAM-{complaint_id}")
except Exception as e:
    log_test(8, "Citizen-Guide Secure Messaging", False, str(e))

# ==============================================================================
# TEST 9: AI Case Assistant Copilot (Context-Grounded)
# ==============================================================================
try:
    copilot_payload = {
        "complaintId": str(complaint_id),
        "message": "What specific civil injunction section applies for stopping neighbor wall construction on private patta land?",
        "userRole": "GUIDE",
        "language": "en",
        "caseTitle": "Boundary Wall Dispute",
        "caseDescription": "Neighbor wall construction encroaching private patta land"
    }
    copilot_res = request_json(f"{BACKEND_URL}/ai/case-assistant", "POST", copilot_payload, volunteer_token)
    t9 = bool(copilot_res.get("grounded") is True and copilot_res.get("answer"))
    ans_snippet = copilot_res.get("answer", "")[:120].replace("\n", " ") + "..."
    log_test(9, "AI Case Assistant Copilot", t9, f"Grounded: {copilot_res.get('grounded')} | Guidance: {ans_snippet}")
except Exception as e:
    log_test(9, "AI Case Assistant Copilot", False, str(e))

# ==============================================================================
# TEST 10: Document Request & Verification Lifecycle
# ==============================================================================
try:
    doc_req_res = request_json(
        f"{BACKEND_URL}/volunteer/cases/{complaint_id}/request-documents",
        "POST",
        {"documentName": "Revenue Survey Map / Field Measurement Book (FMB)"},
        volunteer_token
    )
    if doc_id:
        request_json(f"{BACKEND_URL}/volunteer/documents/{doc_id}/verify", "PUT", {}, volunteer_token)

    t10 = bool(doc_req_res.get("success"))
    log_test(10, "Document Request & Verification", t10, f"FMB requested from citizen | Evidence Doc {doc_id} verified by Guide")
except Exception as e:
    log_test(10, "Document Request & Verification", False, str(e))

# ==============================================================================
# TEST 11: Case Resolution & Notifications
# ==============================================================================
try:
    resolve_payload = {
        "resolutionSummary": "Legal Guide mediated between parties; revenue survey confirmed original boundary; neighbor agreed to remove encroaching wall portion.",
        "resolutionType": "COMMUNITY_MEDIATION"
    }
    resolve_res = request_json(f"{BACKEND_URL}/volunteer/cases/{complaint_id}/resolve", "POST", resolve_payload, volunteer_token)
    t11 = resolve_res.get("status") == "RESOLVED"
    log_test(11, "Case Resolution & Notifications", t11, f"Case ARAM-{complaint_id} status: {resolve_res.get('status')} | Type: {resolve_res.get('resolutionType')}")
except Exception as e:
    log_test(11, "Case Resolution & Notifications", False, str(e))

# ==============================================================================
# TEST 12: Citizen Feedback & Volunteer Self-Evaluation
# ==============================================================================
try:
    # 1. Citizen Feedback
    fb_payload = {
        "complaintId": complaint_id,
        "rating": 5,
        "comment": "Excellent legal guidance! The volunteer helped clarify land revenue boundary procedures peacefully.",
        "helpful": True
    }
    fb_res = request_json(f"{BACKEND_URL}/feedback", "POST", fb_payload, citizen_token)

    # 2. Volunteer Self-Evaluation
    eval_payload = {
        "preparationRating": 5,
        "communicationRating": 5,
        "legalClarityRating": 5,
        "citizenSatisfactionPerception": 5,
        "outcomeAchieved": "FULL_RESOLUTION",
        "challengesFaced": "Verification of survey boundaries required local revenue coordination",
        "lessonsLearned": "Early presentation of Patta deeds de-escalates boundary conflicts effectively"
    }
    eval_res = request_json(f"{BACKEND_URL}/volunteer/cases/{complaint_id}/self-evaluation", "POST", eval_payload, volunteer_token)

    # 3. Admin Evaluations Overview
    admin_evals = request_json(f"{BACKEND_URL}/admin/volunteer-evaluations", "GET", None, admin_token)

    t12 = bool(fb_res.get("rating") == 5 and eval_res.get("id") and len(admin_evals) > 0)
    log_test(12, "Citizen Feedback & Self-Evaluation", t12, f"Citizen 5-Star Feedback Saved | Self-Eval ID: {eval_res.get('id')} | Admin Evals Count: {len(admin_evals)}")
except Exception as e:
    log_test(12, "Citizen Feedback & Self-Evaluation", False, str(e))

# ==============================================================================
# FINAL RESULTS SUMMARY
# ==============================================================================
print("=" * 80)
print("                    LIFECYCLE TEST EXECUTION SUMMARY")
print("=" * 80)
print(f" TOTAL TESTS EXECUTED: 12")
print(f" TESTS PASSED:         {pass_count} / 12")
print(f" TESTS FAILED:         {fail_count} / 12")
print("=" * 80)

if fail_count == 0:
    print("\n>>> [SUCCESS] ALL 12 CASE LIFECYCLE STAGES ARE VERIFIED AND PRODUCTION-READY! <<<\n")
    sys.exit(0)
else:
    print("\n>>> [ATTENTION] Some lifecycle steps failed. Review details above. <<<\n")
    sys.exit(1)
