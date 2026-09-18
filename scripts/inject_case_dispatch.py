import re

with open(r"E:\OurAram\My-aram-app\ai-service\app\chatbot_engine.py", "r", encoding="utf-8") as f:
    code = f.read()

target_anchor = '    # 6. Emergency & Safety Check'
if target_anchor not in code:
    print("Error: target_anchor not found")
    exit(1)

# Find the end of emergency block
emergency_end_pattern = r'(    # 6\. Emergency & Safety Check.*?    # 6\.5 Multi-Case Decomposition Check)'
match = re.search(emergency_end_pattern, code, re.DOTALL)
if not match:
    print("Could not match emergency block range")
    exit(1)

old_emergency_and_after = match.group(1)

new_case_dispatch_block = '''    # 6. Emergency & Safety Check
    if intent_type == INTENTS["EMERGENCY"]:
        em_msg = "⚠️ அவசர உதவி / IMMEDIATE SAFETY NOTICE: உங்கள் உயிருக்கோ அல்லது பாதுகாப்பிற்கோ உடனடி அச்சுறுத்தல் இருந்தால், உடனடியாக காவல்துறை அவசர உதவி எண் 112 அல்லது பெண்கள் உதவி எண் 181-ஐ அழைக்கவும்." if resolved_lang == "ta" else "⚠️ IMMEDIATE SAFETY NOTICE: If you are in immediate physical danger, please immediately call Emergency Helpline 112 or Women Helpline 181. ARAM has flagged this grievance for priority human assistance."
        return {
            "responseType": "EMERGENCY",
            "language": resolved_lang,
            "problemSummary": "Urgent Safety / Protection Alert",
            "reply": em_msg,
            "answer": em_msg,
            "category": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
            "is_conversational": False,
            "human_review_required": True,
            "emergency": True,
            "where_to_complain": ["Police Emergency: 112", "Women Helpline: 181", "Protection Officer"],
            "what_you_can_do_now": ["Contact Emergency 112 immediately", "Reach safe shelter", "Request DLSA emergency legal aid"],
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 6.2 Authenticated Citizen Case Context & Real-Time Status Handling
    if citizen_context:
        matched_id = citizen_context.get("matchedCaseId")
        if matched_id == "UNAUTHORIZED":
            unauth_msg = (
                "மன்னிக்கவும், உங்கள் கணக்குடன் தொடர்புடைய இந்த புகார் எண் காணப்படவில்லை. தயவுசெய்து உங்கள் சரியான புகார் எண்ணை சரிபார்க்கவும்."
                if resolved_lang == "ta" else
                "I could not find any complaint with that ID associated with your account. Please verify the complaint ID or refer to your active registered complaints."
            )
            return {
                "responseType": "UNAUTHORIZED_CASE",
                "language": resolved_lang,
                "category": "AUTHENTICATION_PROTECTION",
                "understanding": unauth_msg,
                "reply": unauth_msg,
                "answer": unauth_msg,
                "is_conversational": True,
                "is_greeting": False,
                "disclaimer": DISCLAIMER,
                "sessionId": session_key
            }

        targeted_case = citizen_context.get("targetedCase")
        active_cases = citizen_context.get("activeCases") or []
        recent_cases = citizen_context.get("recentCases") or []
        user_prof = citizen_context.get("user") or {}
        user_name = user_prof.get("name", "Citizen")

        msg_lower = raw_message.lower()
        is_asking_case = any(k in msg_lower for k in [
            "my complaint", "complaint status", "my case", "status of my", "what happened to my", "show my complaint",
            "what are my complaints", "en complaint", "en case", "status enna", "nilai enna", "புகார் நிலை", "என் புகார்",
            "வழக்கு நிலை", "வழக்கின் நிலை", "uploaded document", "my document", "guide sonna", "guide message",
            "guide update", "வழிகாட்டி", "ஆவணம்", "சான்று", "what did my guide ask", "adutha step", "next step for my case",
            "complaint", "புகார்"
        ]) or bool(re.search(r"ARAM-[0-9]{2}-[A-Z]{2,3}-[A-Z]{2,4}-[0-9]{4,8}", raw_message, re.IGNORECASE))

        if targeted_case and (is_asking_case or matched_id):
            query_type = "STATUS"
            if any(k in msg_lower for k in ["document", "documents", "proof", "file", "uploaded", "ஆவணம்", "சான்று", "சான்றிதழ்"]):
                query_type = "DOCUMENTS"
            elif any(k in msg_lower for k in ["guide", "advocate", "sonna", "asked", "update", "message", "செய்தி", "வழிகாட்டி"]):
                query_type = "GUIDE_UPDATES"
            elif any(k in msg_lower for k in ["next step", "adutha", "enna pannanum", "what to do", "அடுத்த நடவடிக்கை", "அடுத்த படி"]):
                query_type = "NEXT_STEP"
            
            return format_case_status_response(targeted_case, resolved_lang, user_name, query_type=query_type)

        if not targeted_case and len(active_cases) > 1 and is_asking_case:
            case_list = []
            options = []
            for i, c in enumerate(active_cases):
                cid_str = c.get("complaintCustomId") or f"Case #{c.get('id')}"
                ctitle = c.get("title", "Legal Grievance")
                cstatus = c.get("status", "ACTIVE")
                case_list.append(f"{i+1}. **{cid_str}** — *{ctitle}* (`{cstatus}`)")
                options.append(f"Status of {cid_str}")

            if resolved_lang == "ta":
                reply = (
                    f"வணக்கம் {user_name}! உங்களிடம் **{len(active_cases)}** செயலில் உள்ள புகார்கள் உள்ளன:\\n\\n" +
                    "\\n".join(case_list) +
                    "\\n\\nநீங்கள் எந்த வழக்கைப் பற்றி விரிவான நிலை அல்லது அடுத்த கட்ட நடவடிக்கை அறிய விரும்புகிறீர்கள்? புகார் எண்ணைக் குறிப்பிடவும்."
                )
            else:
                reply = (
                    f"Hello {user_name}! You have **{len(active_cases)} active complaints** on file:\\n\\n" +
                    "\\n".join(case_list) +
                    "\\n\\nWhich specific complaint would you like to check? You can reply with the complaint ID."
                )

            return {
                "responseType": "CASE_DISAMBIGUATION",
                "language": resolved_lang,
                "category": "MULTI_CASE_SELECTION",
                "understanding": reply,
                "reply": reply,
                "answer": reply,
                "options": options,
                "is_conversational": True,
                "is_greeting": False,
                "disclaimer": DISCLAIMER,
                "sessionId": session_key
            }

        if not targeted_case and len(active_cases) == 0 and len(recent_cases) == 0 and is_asking_case:
            if resolved_lang == "ta":
                reply = f"வணக்கம் {user_name}! உங்கள் கணக்கில் இதுவரை பதிவு செய்யப்பட்ட புகார்கள் எதுவும் இல்லை. நீங்கள் ஒரு புதிய சட்டப் புகாரைப் பதிவு செய்ய விரும்பினால், உங்கள் பிரச்சனையை இங்கு விவரிக்கலாம்."
            else:
                reply = f"Hello {user_name}! You do not have any registered complaints on file yet. If you would like to file a new legal aid grievance, simply describe your dispute here."

            return {
                "responseType": "NO_CASES_FOUND",
                "language": resolved_lang,
                "category": "GENERAL_LEGAL_AID",
                "understanding": reply,
                "reply": reply,
                "answer": reply,
                "options": ["Property Boundary Dispute", "Security Deposit Refund", "Unpaid Salary Claim"],
                "is_conversational": True,
                "is_greeting": False,
                "disclaimer": DISCLAIMER,
                "sessionId": session_key
            }

    # 6.5 Multi-Case Decomposition Check'''

code = code.replace(old_emergency_and_after, new_case_dispatch_block)

with open(r"E:\OurAram\My-aram-app\ai-service\app\chatbot_engine.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Injected case dispatch block into chatbot_engine.py successfully")
