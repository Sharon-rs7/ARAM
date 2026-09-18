import re

with open(r"E:\OurAram\My-aram-app\ai-service\app\chatbot_engine.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update signature if needed
old_sig = """def ask_chatbot_engine(
    message: str,
    language: str = None,
    user_role: str = "CITIZEN",
    complaint_id: int = None,
    case_context: str = None,
    session_id: str = None,
    location: Dict[str, Any] = None
) -> Dict[str, Any]:"""

new_sig = """def ask_chatbot_engine(
    message: str,
    language: str = None,
    user_role: str = "CITIZEN",
    complaint_id: int = None,
    case_context: str = None,
    session_id: str = None,
    location: Dict[str, Any] = None,
    citizen_context: Dict[str, Any] = None,
    complaint_custom_id: str = None,
    conversation_id: str = None
) -> Dict[str, Any]:"""

if old_sig in content:
    content = content.replace(old_sig, new_sig)
    print("Updated ask_chatbot_engine signature")

# Helper function
helper_code = '''
def format_case_status_response(targeted_case: Dict[str, Any], lang: str, user_name: str, query_type: str = "STATUS") -> Dict[str, Any]:
    cid = targeted_case.get("complaintCustomId") or f"Case #{targeted_case.get('id')}"
    status = targeted_case.get("status", "PENDING")
    title = targeted_case.get("title", "Legal Grievance")
    category = targeted_case.get("category", "GENERAL_LEGAL_AID")
    priority = targeted_case.get("priority", "MEDIUM")
    district = targeted_case.get("district", "Coimbatore")
    authority = targeted_case.get("authority", "District Legal Services Authority (DLSA)")
    guide_name = targeted_case.get("assignedGuideName")
    guide_spec = targeted_case.get("assignedGuideSpecialization")
    created_at = targeted_case.get("createdAt", "")
    docs = targeted_case.get("documents") or []
    updates = targeted_case.get("citizenVisibleUpdates") or []

    is_ta = (lang or "en").startswith("ta")
    is_hi = (lang or "en").startswith("hi")

    if query_type == "DOCUMENTS":
        if docs:
            doc_lines = []
            for d in docs:
                doc_lines.append(f"• **{d.get('fileName', 'Document')}** ({d.get('documentType', 'EVIDENCE')}) — *{d.get('verificationStatus', 'PENDING')}* [{d.get('uploadedAt', '')}]")
            if is_ta:
                reply = f"📑 **வழக்கு {cid} பதிவேற்றப்பட்ட ஆவணங்கள்:**\\n\\n" + "\\n".join(doc_lines) + "\\n\\nகூடுதல் ஆவணங்கள் தேவைப்பட்டால் வழிகாட்டி அல்லது குறைதீர்ப்பு மையம் மூலம் கோரப்படும்."
            elif is_hi:
                reply = f"📑 **शिकायत {cid} के तहत अपलोड किए गए दस्तावेज़:**\\n\\n" + "\\n".join(doc_lines)
            else:
                reply = f"📑 **Uploaded Documents for Complaint {cid}:**\\n\\n" + "\\n".join(doc_lines) + "\\n\\nAll uploaded evidence has been registered under your case file."
        else:
            if is_ta:
                reply = f"⚠️ **வழக்கு {cid}**: இதுவரை ஆவணங்கள் எதுவும் பதிவேற்றப்படவில்லை. உங்கள் வழக்கிற்கு தேவையான ஆதாரங்களை 'Documents' பகுதி மூலம் பதிவேற்றலாம்."
            else:
                reply = f"⚠️ **Complaint {cid}**: No supporting documents have been uploaded yet. You can upload relevant receipts, deeds, or notices via the Documents tab."
        
        return {
            "responseType": "CASE_DOCUMENTS_STATUS",
            "language": lang or "en",
            "category": category,
            "understanding": reply,
            "reply": reply,
            "answer": reply,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "options": ["What is my next step?", "Guide Updates", "All Complaints"]
        }

    if query_type == "GUIDE_UPDATES":
        if updates:
            up_lines = []
            for u in updates:
                up_lines.append(f"• **{u.get('senderRole', 'Guide')}** ({u.get('sentAt', '')}): \\\"{u.get('messageText', '')}\\\"")
            if is_ta:
                reply = f"💬 **வழக்கு {cid} — வழிகாட்டி / நிர்வாகத்தின் சமீபத்திய அறிவிப்புகள்:**\\n\\n" + "\\n".join(up_lines)
            else:
                reply = f"💬 **Complaint {cid} — Recent Guide / Admin Updates:**\\n\\n" + "\\n".join(up_lines)
        elif guide_name:
            if is_ta:
                reply = f"👨‍⚖️ **வழக்கு {cid}**: உங்கள் வழக்கிற்கு சட்ட வழிகாட்டி **{guide_name}** ({guide_spec or 'Legal Advocate'}) நியமிக்கப்பட்டுள்ளார். அவர் உங்கள் மனுவை ஆய்வு செய்து வருகிறார்."
            else:
                reply = f"👨‍⚖️ **Complaint {cid}**: Legal Guide **{guide_name}** ({guide_spec or 'Legal Advocate'}) has been assigned to your case and is currently reviewing your grievance."
        else:
            if is_ta:
                reply = f"⏳ **வழக்கு {cid}**: உங்கள் வழக்கு மாவட்ட நிர்வாகத்தின் வழிகாட்டி நியமனப் பரிசீலனையில் உள்ளது. விரைவில் வழிகாட்டி ஒதுக்கப்படுவார்."
            else:
                reply = f"⏳ **Complaint {cid}**: Your case is in the administrative queue for Legal Guide allocation. A verified guide will be assigned shortly."
        
        return {
            "responseType": "GUIDE_UPDATES_STATUS",
            "language": lang or "en",
            "category": category,
            "understanding": reply,
            "reply": reply,
            "answer": reply,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "options": ["What is my next step?", "Show Uploaded Documents"]
        }

    if query_type == "NEXT_STEP":
        step_text = ""
        if status in ["PENDING", "SUBMITTED"]:
            step_text = "Your grievance is in the initial queue. The District Administration is reviewing category triage." if not is_ta else "உங்கள் மனு ஆரம்ப சரிபார்ப்பில் உள்ளது. மாவட்ட நிர்வாகம் பரிசீலித்து வருகிறது."
        elif status in ["AI_TRIAGED", "GUIDE_ASSIGNED"]:
            step_text = f"Legal Guide {guide_name or 'assigned advocate'} will contact you or review uploaded documents. Ensure all supporting receipts/deeds are uploaded." if not is_ta else f"சட்ட வழிகாட்டி {guide_name or 'அலுவலர்'} உங்கள் ஆவணங்களை சரிபார்ப்பார். தேவையான அனைத்து ஆவணங்களையும் பதிவேற்றியுள்ளீர்களா என்பதை உறுதி செய்யவும்."
        elif status in ["UNDER_INVESTIGATION", "ACTION_REQUIRED"]:
            step_text = "Case is actively being pursued. Check your messages inbox for any specific instructions from your Legal Guide." if not is_ta else "வழக்கு தீவிர விசாரணையில் உள்ளது. உங்கள் வழிகாட்டியின் செய்திகளை சரிபார்க்கவும்."
        elif status == "RESOLVED":
            step_text = "This grievance has been marked RESOLVED. You can review the final resolution summary or submit case feedback." if not is_ta else "இந்த புகார் வெற்றிகரமாக தீர்க்கப்பட்டுள்ளது. நீங்கள் இறுதி அறிக்கையை மதிப்பாய்வு செய்யலாம்."
        else:
            step_text = "Follow up with your assigned authority or legal services committee." if not is_ta else "தொடர்புடைய சட்ட சேவைகள் அதிகார குழுவை அணுகவும்."

        if is_ta:
            reply = f"🚀 **வழக்கு {cid} ({title}) — அடுத்த கட்ட நடவடிக்கை:**\\n\\n📌 **தற்போதைய நிலை:** `{status}`\\n\\n💡 **அடுத்த படி:**\\n{step_text}\\n\\n• **பரிந்துரைக்கப்பட்ட அதிகாரம்:** {authority}\\n• **ஆவணங்கள்:** {len(docs)} சமர்ப்பிக்கப்பட்டுள்ளது"
        else:
            reply = f"🚀 **Complaint {cid} ({title}) — Next Step Guidance:**\\n\\n📌 **Current Status:** `{status}`\\n\\n💡 **Actionable Next Step:**\\n{step_text}\\n\\n• **Competent Authority:** {authority}\\n• **Uploaded Documents:** {len(docs)} on file"

        return {
            "responseType": "CASE_NEXT_STEP",
            "language": lang or "en",
            "category": category,
            "understanding": reply,
            "reply": reply,
            "answer": reply,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "options": ["Show My Documents", "Guide Messages", "All Complaints"]
        }

    # Default STATUS / OVERVIEW
    guide_info = f"**{guide_name}** ({guide_spec or 'Legal Guide'})" if guide_name else "Awaiting Guide Assignment"
    doc_info = f"{len(docs)} document(s) uploaded" if docs else "No documents uploaded yet"

    if is_ta:
        reply = (
            f"📋 **உங்கள் புகார் நிலை அறிக்கை:**\\n\\n"
            f"• **மனு எண்:** `{cid}`\\n"
            f"• **தலைப்பு:** {title}\\n"
            f"• **பிரிவு:** {category}\\n"
            f"• **தற்போதைய நிலை:** `{status}`\\n"
            f"• **முன்னுரிமை:** {priority}\\n"
            f"• **மாவட்டம்:** {district}\\n"
            f"• **சட்ட வழிகாட்டி:** {guide_info}\\n"
            f"• **ஆவணங்கள்:** {doc_info}\\n"
            f"• **பதிவு செய்யப்பட்ட தேதி:** {created_at}\\n\\n"
            f"💡 **அடுத்த நடவடிக்கை:** மேலும் விவரங்களுக்கு 'Next Step' அல்லது 'Documents' என்று கேட்கலாம்."
        )
    elif is_hi:
        reply = (
            f"📋 **आपकी शिकायत की वर्तमान स्थिति:**\\n\\n"
            f"• **शिकायत संख्या:** `{cid}`\\n"
            f"• **शीर्षक:** {title}\\n"
            f"• **श्रेणी:** {category}\\n"
            f"• **स्थिति:** `{status}`\\n"
            f"• **प्राथमिकता:** {priority}\\n"
            f"• **जिला:** {district}\\n"
            f"• **दस्तावेज़:** {doc_info}\\n"
        )
    else:
        reply = (
            f"📋 **Real-Time Status for Complaint `{cid}`:**\\n\\n"
            f"• **Title:** {title}\\n"
            f"• **Category:** {category}\\n"
            f"• **Status:** `{status}`\\n"
            f"• **Priority:** {priority}\\n"
            f"• **Jurisdiction / District:** {district}\\n"
            f"• **Assigned Legal Guide:** {guide_info}\\n"
            f"• **Document Evidence:** {doc_info}\\n"
            f"• **Filed On:** {created_at}\\n\\n"
            f"💡 You can ask: *\\\"What did my guide ask?\\\"*, *\\\"What documents did I upload?\\\"*, or *\\\"What is my next step?\\\"*"
        )

    return {
        "responseType": "CASE_STATUS_REPORT",
        "language": lang or "en",
        "category": category,
        "understanding": reply,
        "reply": reply,
        "answer": reply,
        "is_conversational": True,
        "is_greeting": False,
        "disclaimer": DISCLAIMER,
        "options": ["What is my next step?", "Show Uploaded Documents", "Guide Updates"]
    }
'''

if "def format_case_status_response(" not in content:
    content = helper_code.strip() + "\n\n" + content
    print("Added format_case_status_response helper")

with open(r"E:\OurAram\My-aram-app\ai-service\app\chatbot_engine.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated chatbot_engine.py with helper successfully")
