import re
import json
import time
from typing import Dict, Any, List, Optional

try:
    import redis
    redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    redis_client.ping()
    has_redis = True
except Exception:
    redis_client = None
    has_redis = False

IN_MEMORY_STATE: Dict[str, Dict[str, Any]] = {}

CLARIFICATION_OPTIONS = {
    "PROPERTY_DISPUTE": [
        "Patta / Chitta",
        "Boundary Dispute",
        "Land Encroachment",
        "Property Ownership / Title",
        "Registration / Sale Deed",
        "Other"
    ],
    "PROPERTY_CIVIL_DISPUTE": [
        "Patta / Chitta",
        "Boundary Dispute",
        "Land Encroachment",
        "Property Ownership / Title",
        "Registration / Sale Deed",
        "Other"
    ],
    "TENANCY_DISPUTE": [
        "Security Deposit Refund",
        "Unlawful Eviction Notice",
        "Rent Overcharging",
        "Maintenance / Repair Dispute",
        "Other"
    ],
    "LABOUR_DISPUTE": [
        "Unpaid Salary / Wage Delay",
        "Unfair Termination",
        "PF / ESI Settlement",
        "Working Hours / Overtime",
        "Other"
    ],
    "CONSUMER_COMPLAINT": [
        "Defective Product Delivered",
        "Refund Not Processed",
        "Deficient Service Provided",
        "Misleading Warranty Terms",
        "Other"
    ],
    "CYBER_CRIME": [
        "Unauthorized Bank / UPI Debit",
        "OTP / Phishing Scam",
        "Identity Theft / Account Hacked",
        "Blackmail / Cyber Harassment",
        "Other"
    ],
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": [
        "Physical / Verbal Harassment",
        "Domestic Abuse / In-laws Dispute",
        "Maintenance & Residence Relief",
        "Urgent Protection Order",
        "Other"
    ]
}

class ConversationManager:
    def get_or_create_state(self, session_id: str, language: str = "en", district: str = "Coimbatore") -> Dict[str, Any]:
        if not session_id:
            session_id = f"sess_{int(time.time()*1000)}"

        state = None
        if has_redis and redis_client:
            try:
                raw = redis_client.get(f"conv_state:{session_id}")
                if raw:
                    state = json.loads(raw)
            except Exception:
                pass

        if not state:
            state = IN_MEMORY_STATE.get(session_id)

        if not state:
            state = {
                "sessionId": session_id,
                "userId": None,
                "language": language or "en",
                "jurisdiction": {
                    "state": "Tamil Nadu",
                    "district": district or "Coimbatore"
                },
                "category": "GENERAL_LEGAL_AID",
                "subCategory": None,
                "facts": [],
                "entities": {},
                "evidenceReferences": [],
                "urgency": "NORMAL",
                "safetyFlags": [],
                "turnsCount": 0,
                "missingInformation": [],
                "retrievedSources": [],
                "legalAssessment": None,
                "humanReviewRequired": False,
                "history": []
            }
            self.save_state(session_id, state)

        return state

    def save_state(self, session_id: str, state: Dict[str, Any]):
        IN_MEMORY_STATE[session_id] = state
        if has_redis and redis_client:
            try:
                redis_client.setex(f"conv_state:{session_id}", 3600, json.dumps(state))
            except Exception:
                pass

    def update_state(self, session_id: str, user_message: str, category: str, language: Optional[str] = None) -> Dict[str, Any]:
        state = self.get_or_create_state(session_id, language=language or "en")
        state["turnsCount"] += 1
        if category and category != "GENERAL_LEGAL_AID":
            state["category"] = category
        if language and language != state.get("language"):
            state["language"] = language

        clean_msg = user_message.strip()
        if clean_msg and clean_msg not in state["facts"]:
            state["facts"].append(clean_msg)

        state["history"].append({"role": "user", "content": clean_msg, "timestamp": time.time()})
        self.save_state(session_id, state)
        return state

    def set_language(self, session_id: str, language: str) -> Dict[str, Any]:
        state = self.get_or_create_state(session_id)
        state["language"] = language
        self.save_state(session_id, state)
        return state

    def assess_completeness(self, state: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        category = state.get("category", "GENERAL_LEGAL_AID")
        turns = state.get("turnsCount", 1)
        clean = user_message.lower().strip()

        # Check if user message is a short clarification selection
        is_sub_choice = any(
            opt.lower() == clean or opt.lower() in clean
            for opts in CLARIFICATION_OPTIONS.values()
            for opt in opts
        ) or clean in ["boundary", "patta", "encroachment", "deposit", "salary", "refund", "cheating", "domestic", "title"]

        if is_sub_choice:
            state["subCategory"] = clean
            self.save_state(state.get("sessionId"), state)
            return {
                "isComplete": True,
                "missingFields": [],
                "options": [],
                "clarificationPrompt": ""
            }

        # Purely vague / short utterance without specific context
        is_purely_vague = clean in [
            "i have a problem", "i have problem", "problem", "i have a doubt", "doubt",
            "enaku oru problem", "enaku prechanai", "oru problem", "oru prechanai",
            "need help", "help me", "help", "enaku help venum", "help venum", "help pannunga"
        ]

        if is_purely_vague or (len(clean.split()) <= 4 and category == "GENERAL_LEGAL_AID"):
            prompt = "வணக்கம்! உங்கள் பிரச்சனையை விரிவாக கூறுங்கள், தகுந்த சட்ட ஆலோசனை மற்றும் வழிகாட்டுதல் வழங்குகிறேன்." if (state.get("language") or "en").startswith("ta") else "Hello! Please describe what happened in detail so I can guide you accurately."
            return {
                "isComplete": False,
                "missingFields": ["category", "issue_details"],
                "options": [],
                "clarificationPrompt": prompt
            }


        # Vague detection: short utterance without specific facts/dates/sections
        has_category_word = any(w in clean for w in ["property", "land", "sothu", "nilam", "rent", "tenant", "salary", "wage", "sambalam", "consumer", "product", "cyber", "upi", "scam", "fraud", "dispute"])
        has_generic_issue_word = any(w in clean for w in ["issue", "issuse", "problem", "dispute", "complaint", "doubt", "help", "iruku", "irukku", "hai", "pananum", "pannanum", "thrla", "therila", "theriyala", "yarkita", "yaarkita", "enga", "where to", "whom to", "how to", "i have", "enakku", "enaku", "oru"])

        is_vague = (
            len(clean.split()) <= 7
            and has_category_word
            and (
                has_generic_issue_word
                or clean in ["property", "property issue", "land dispute", "rent issue", "salary problem", "consumer issue", "cyber fraud"]
            )
            and not any(specific in clean for specific in ["sqft", "acre", "survey no", "patta no", "cheque no", "rs", "inr", "months", "month", "years", "amazon", "flipkart", "fir", "police station", "defective", "stolen"])
        )

        if is_vague and not state.get('subCategory') and category in CLARIFICATION_OPTIONS:
            missing = ["specific_issue_type", "district"]
            options = CLARIFICATION_OPTIONS.get(category, [])
            return {
                "isComplete": False,
                "missingFields": missing,
                "options": options,
                "clarificationPrompt": self._build_clarification_prompt(category, state.get("language", "en"))
            }

        return {
            "isComplete": True,
            "missingFields": [],
            "options": [],
            "clarificationPrompt": ""
        }

    def _build_clarification_prompt(self, category: str, language: str) -> str:
        if language == "ta" or language == "ta-en":
            if category in ["PROPERTY_DISPUTE", "PROPERTY_CIVIL_DISPUTE"]:
                return "நிச்சயமாக, நான் உங்களுக்கு வழிகாட்டுகிறேன் 👍\n\nசரியான அதிகாரி மற்றும் சட்ட தீர்வை அடையாளம் காண, உங்கள் பிரச்சனை முக்கியமாக எதைப் பற்றியது என்று தெரிவியுங்கள்:"
            elif category == "TENANCY_DISPUTE":
                return "வாடகை தகராறு தொடர்பான தீர்வைக் காண, உங்கள் பிரச்சனை முக்கியமாக எதைப் பற்றியது:"
            elif category == "LABOUR_DISPUTE":
                return "தொழிலாளர் நலன் மற்றும் ஊதிய பிரச்சனைக்கு உதவ, உங்கள் பிரச்சனை வகை என்ன:"
            elif category == "CONSUMER_COMPLAINT":
                return "நுகர்வோர் குறைதீர்க்க, உங்கள் பிரச்சனை முக்கியமாக எதைப் பற்றியது:"
            elif category == "CYBER_CRIME":
                return "இணைய குற்றப் புகாருக்கு வழிகாட்ட, என்ன வகையான மோசடி நடந்தது:"
            else:
                return "உங்கள் பிரச்சனையை துல்லியமாக மதிப்பீடு செய்ய, கீழ்வரும் வகைகளில் ஒன்றை தேர்வு செய்யவும்:"
        elif language == "hi":
            return "आपकी समस्या का सही समाधान खोजने के लिए, कृपया नीचे दिए गए विकल्पों में से चुनें:"
        else:
            return "I can help you find the right legal route and authority. What specific type of issue are you facing?"

conversation_manager = ConversationManager()
