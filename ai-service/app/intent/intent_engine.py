"""
Unified Dynamic Intent & Clarification Engine.
Correctly discriminates between:
1. GREETING (hi, hello, vanakkam, good morning)
2. LANGUAGE_INQUIRY (can we talk in tamil, tanglish la pesalama)
3. BOT_CAPABILITIES (what can you do, who are you)
4. CLARIFICATION_NEEDED (too vague, e.g. "I have a problem", "need help", "cheat panitaanga")
5. EMERGENCY (violence, suicide, threat)
6. MULTI_CASE_LEGAL (contains multiple legal disputes)
7. SINGLE_LEGAL_PROBLEM (clear dispute with facts)
8. COMPLAINT_SUBMISSION_REQUEST (explicit request to lodge a formal complaint)
"""
import re
from typing import Dict, Any, Optional
from app.nlp.tanglish_normalizer import detect_and_normalize_tanglish, is_conversational_greeting, is_language_inquiry
from app.safety.emergency_engine import check_emergency
from app.cases.multi_case_engine import decompose_multi_case

VAGUE_PHRASES = [
    r"^(i have a problem|i have problem|enaku oru problem|enaku prechanai|oru doubt)$",
    r"^(help me|enaku help venum|need help|help panna mudiyuma)$",
    r"^(cheat panitaanga|mosam panitaanga|cheated me|scam)$",
    r"^(police complaint kudukalama|case poda mudiyuma|lawyer venum)$"
]

COMPLAINT_REQUEST_PATTERNS = [
    r"(lodge|submit|register|file|create)\s*(a\s*)?(formal\s*)?(complaint|case|fir|grievance)",
    r"(complaint\s*(poda\s*poren|kudukka\s*poren|register\s*panna\s*anum))",
    r"(complaint\s*submit\s*panren)"
]

def classify_user_intent(text: str, conversation_history: Optional[list] = None) -> Dict[str, Any]:
    cleaned = text.strip()
    normalized_text, detected_lang = detect_and_normalize_tanglish(cleaned)
    lower = cleaned.lower()
    
    # 1. Emergency Check
    emergency = check_emergency(cleaned, detected_lang)
    if emergency:
        return {
            "intent": "EMERGENCY",
            "language": detected_lang,
            "emergency_data": emergency,
            "normalized_query": normalized_text
        }
        
    # 2. Greeting Check
    if is_conversational_greeting(cleaned):
        return {
            "intent": "GREETING",
            "language": detected_lang,
            "normalized_query": normalized_text
        }
        
    # 3. Language Inquiry Check
    if is_language_inquiry(cleaned):
        return {
            "intent": "LANGUAGE_INQUIRY",
            "language": detected_lang,
            "normalized_query": normalized_text
        }
        
    # 4. Capability / Identity Check
    if re.search(r"^(who are you|what can you do|neenga yaaru|enna panna mudiyum|unnala enna seiya mudiyum)", lower):
        return {
            "intent": "BOT_CAPABILITIES",
            "language": detected_lang,
            "normalized_query": normalized_text
        }
        
    # 5. Direct Complaint Submission Request
    for cp in COMPLAINT_REQUEST_PATTERNS:
        if re.search(cp, lower):
            return {
                "intent": "COMPLAINT_SUBMISSION_REQUEST",
                "language": detected_lang,
                "normalized_query": normalized_text
            }
            
    # 6. Check for Vague / Clarification Needed
    words = lower.split()
    if len(words) <= 3:
        for vp in VAGUE_PHRASES:
            if re.match(vp, lower):
                return {
                    "intent": "CLARIFICATION_NEEDED",
                    "language": detected_lang,
                    "normalized_query": normalized_text
                }
                
    # 7. Check Multi-Case Decomposition
    sub_cases = decompose_multi_case(cleaned)
    if len(sub_cases) >= 2:
        return {
            "intent": "MULTI_CASE_LEGAL",
            "language": detected_lang,
            "sub_cases": sub_cases,
            "normalized_query": normalized_text
        }
        
    # 8. Standard Legal Problem
    return {
        "intent": "LEGAL_PROBLEM",
        "language": detected_lang,
        "normalized_query": normalized_text
    }
