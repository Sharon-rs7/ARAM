import re
from typing import Dict, Any, Tuple, Optional

INTENTS = {
    "GREETING": "GREETING",
    "LANGUAGE_SELECTION": "LANGUAGE_SELECTION",
    "SUBMIT_COMPLAINT": "SUBMIT_COMPLAINT",
    "THANKS": "THANKS",
    "GOODBYE": "GOODBYE",
    "GENERAL_CONVERSATION": "GENERAL_CONVERSATION",
    "CLARIFICATION_ANSWER": "CLARIFICATION_ANSWER",
    "LEGAL_QUESTION": "LEGAL_QUESTION",
    "LEGAL_PROBLEM": "LEGAL_PROBLEM",
    "LEGAL_PROCEDURE": "LEGAL_PROCEDURE",
    "COMPLAINT_PREPARATION": "COMPLAINT_PREPARATION",
    "DOCUMENT_QUESTION": "DOCUMENT_QUESTION",
    "EMERGENCY": "EMERGENCY",
    "UNCLEAR": "UNCLEAR"
}

GREETING_PATTERNS = [
    r"^(\s*| )(hi|hello|hey|vanakkam|namaste|namaskar|good\s+morning|good\s+evening|good\s+afternoon|hola|halo|vanakam|வணக்கம்|नमस्ते)(\s*| )$",
    r"^(hi|hello|hey)\s+aram(\s*| )$",
    r"^(hi|hello|hey)\s+there(\s*| )$",
    r"^(hi|hello|hey)\s+sir(\s*| )$"
]

LANGUAGE_SELECTION_PATTERNS = [
    r"^(\s*| )(hinglish|tanglish|thannglish|thanglish|tamil|tamiil|தமிழ்|hindi|இந்தி|english|ஆங்கிலம்)\??(\s*| )$",
    r"^(\s*| )(hinglish|tanglish|thannglish|thanglish|tamil|tamiil|tamilil|tamil-la|tamil\s+la|thamizh)\s+(pesalama|pesalam|pesa|pesunga|pesuvom|theriyuma|pesa\s+mudiyuma|pesa\s+mudium(\s+ha|\s+ah)?|pesalaama|pesuviya|pesuva|pesuveera|pesuviye)\??(\s*| )$",
    r"^(\s*| )(தமிழ்ல|தமிழில்|தமிழ்)\s+(பேசலாமா|பேசலாம்|பேசுங்க|பேச\s+முடியுமா|தெரியுமா|பேசவும்|பேசுவீங்களா)\??(\s*| )$",
    r"^(\s*| )(can\s+(you|we)\s+speak(\s+in)?\s+(hinglish|tanglish|thannglish|thanglish|tamil|hindi|english)|speak(\s+in)?\s+(hinglish|tanglish|thannglish|thanglish|tamil|hindi|english)|talk\s+in\s+(hinglish|tanglish|thannglish|thanglish|tamil|hindi|english)|in\s+(hinglish|tanglish|thannglish|thanglish|tamil|hindi|english)\s+please)\??(\s*| )$",
    r"^(\s*| )(हिंदी\s+में\s+बात\s+करो|हिंदी\s+बोल\s+सकते\s+हो|क्या\s+आप\s+हिंदी\s+बोलते\s+हैं|हिंदी\s+में\s+बताएं)\??(\s*| )$",
    r"^(\s*| )(hindi|hinglish)\s+(me|mein)?\s+(baat\s+karo|baat\s+karein|baat\s+karoge|bolte\s+ho|bol\s+sakte\s+ho|aati\s+hai|samajhte\s+ho)\??(\s*| )$",
    r"^(\s*| )(english\s+please|speak\s+english|switch\s+to\s+(hinglish|tanglish|tamil|hindi|english)|talk\s+in\s+(hinglish|tanglish|tamil|hindi|english))\??(\s*| )$"
]

SUBMIT_COMPLAINT_PATTERNS = [
    r".*(submit|file|register|lodge)\s+.*(complaint|commplaint|grievance|case).*",
    r".*(can\s+u|can\s+you)\s+(submit|file|register|lodge)\s+.*",
    r".*complaint\s+(submit|register|file|poda|podunga|kudukka).*",
    r".*(புகார்\s+பதிவு|புகார்\s+அளி|புகாரை\s+பதிவு).*"
]

THANKS_PATTERNS = [
    r"^(\s*| )(thanks|thank\s+you|thanku|thx|nandri|dhanyavaad|நன்றி|நன்றிகள்|धन्यवाद|shukriya)(\s*| )$",
    r"^thank\s+you\s+(very\s+much|so\s+much|aram|sir)$"
]

GOODBYE_PATTERNS = [
    r"^(\s*| )(bye|goodbye|see\s+you|tata|vidaiperugiren|போய்\s+வருகிறேன்|अलविदा|bye\s+bye)(\s*| )$"
]

GENERAL_CONVO_PATTERNS = [
    r"^(what\s+can\s+you\s+do|who\s+are\s+you|how\s+can\s+you\s+help|what\s+is\s+aram|what\s+do\s+you\s+do|நீ\s+யார்|உன்னால்\s+என்ன\s+செய்ய\s+முடியும்|आप\s+क्या\s+कर\s+सकते\s+हैं)\??$",
    r"^(help|help\s+me|உதவி|सहायता|enaku\s+help\s+venum|enakku\s+help\s+venum|help\s+pannunga|help\s+panu|enaku\s+help\s+pana\s+mudium(\s+ha|\s+ah)?|enakku\s+help\s+panna\s+mudiyuma)\??$",
    r"^(how\s+are\s+you|how\s+r\s+u|epdi\s+iruka|epdi\s+irukinga|eppadi\s+irukinga|kya\s+haal\s+hai|aap\s+kaise\s+ho)\??$",
    r"^(ok|okay|cool|super|great|got\s+it|understood|purinjathu|seri|apdiya|acha|theek\s+hai|sari)$",
    r"^(hello,?\s*can\s+you\s+help\s+me|can\s+you\s+help\s+me|i\s+need\s+help)\??$",
    r"^(what\s+is\s+this\s+app|what\s+services\s+do\s+you\s+provide)\??$",
    r".*(unaku|unakku|unala|unnala)\s+.*(help\s+pana|help\s+panna|help\s+panradhu|mudium|mudiyum).*",
    r".*(ethalang|ethana\s+language|ethana\s+mozhi|what\s+languages|which\s+languages|languages\s+you\s+know|languages\s+supported).*",
    r".*(inth\s+system|intha\s+system|this\s+system|how\s+does\s+this\s+system|how\s+this\s+system|aram\s+system|aram\s+app|aram)\s+.*(epd|epdi|eppadi|work\s+aaguthu|work\s+aagudhu|works|working|function).*",
    r".*(how\s+does\s+(aram|this\s+app|this\s+bot|the\s+system)\s+work).*"
]

EMERGENCY_KEYWORDS = [
    "kill", "murder", "threat to life", "violence", "beating me", "physically hurt",
    "suicide", "attacking me", "under attack", "threatened with weapon",
    "மிரட்டல்", "தாக்குகிறார்", "கொலை", "அடிக்கிறார்", "உயிருக்கு ஆபத்து",
    "मारपीट", "जान से मारने की धमकी", "हमला"
]

LEGAL_QUESTION_KEYWORDS = [
    "what is consumer protection", "what is section", "what is act", "explain section",
    "sattam enral enna", "pirivu enna", "சட்டம் என்றால் என்ன", "பிரிவு என்ன",
    "धारा क्या है", "अधिनियम क्या है", "what does the law say", "what is patta", "what is fmb"
]

LEGAL_DOMAIN_KEYWORDS = [
    "land", "property", "patta", "chitta", "sale deed", "boundary", "encroachment", "survey", "tslr",
    "rent", "tenant", "landlord", "advance", "deposit", "eviction", "lease", "vacate",
    "salary", "wage", "employer", "company", "unpaid", "gratuity", "pf", "provident fund", "termination",
    "consumer", "product", "defective", "warranty", "refund", "flipkart", "amazon", "service deficiency",
    "cyber", "scam", "fraud", "otp", "phishing", "upi", "unauthorized", "bank", "hacked", "account debited",
    "police", "fir", "complaint", "court", "lawyer", "advocate", "dlsa", "notice", "case", "bribe",
    "accident", "insurance", "hospital", "cheated", "document", "forgery", "fake"
]

def classify_intent(text: str) -> Tuple[str, Dict[str, Any]]:
    clean = text.strip()
    clean_lower = clean.lower()
    word_count = len(clean_lower.split())
    has_legal_keyword = any(k in clean_lower for k in LEGAL_DOMAIN_KEYWORDS)

    # 1. Check Emergency First
    if any(k in clean_lower for k in EMERGENCY_KEYWORDS):
        return INTENTS["EMERGENCY"], {"confidence": 0.99, "reason": "emergency_keyword_detected"}

    # 2. Check In-Chat Submit Complaint Trigger (only if short imperative)
    if word_count <= 8:
        for pat in SUBMIT_COMPLAINT_PATTERNS:
            if re.search(pat, clean_lower, re.IGNORECASE):
                return INTENTS["SUBMIT_COMPLAINT"], {"confidence": 0.99}

    # 3. Check Explicit Language Requests (only for short language switches, not long grievance descriptions)
    if word_count <= 8 and not (has_legal_keyword and word_count > 4):
        # Hinglish check
        if "hinglish" in clean_lower:
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "hi_hinglish"}

        # Tanglish check
        if any(phrase in clean_lower for phrase in [
            "tanglish", "thannglish", "thanglish", "tanglish la", "thannglish la", "thanglish la",
            "tanglish pesalama", "tanglish la pesa", "tanglish la pesuviya", "tanglish-la", "in tanglish"
        ]) or (("tamil" in clean_lower or "tamizh" in clean_lower) and any(v in clean_lower for v in ["pesuviya", "pesuva", "pesuveera", "pesalama", "pesalam", "pesa mudiyuma", "pesa mudium"])):
            if any(c.isascii() for c in clean) and not any('\u0b80' <= c <= '\u0bff' for c in clean):
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta_tanglish"}
            else:
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta"}

        # Generic Reply/Replay/Translate in Language
        lang_switch_match = re.search(r"\b(reply|replay|tell|speak|explain|translate|convert|change|switch|say|guide|show|give|sollu|sollunga|pesunga|batao|samjhao)\s+(me\s+)?(in\s+|la\s+|mein\s+|me\s+)?(hindi|tamil|tanglish|hinglish|english)\b", clean_lower)
        if lang_switch_match:
            chosen = lang_switch_match.group(4).lower()
            if chosen == "hindi":
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "hi"}
            elif chosen == "tamil":
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta"}
            elif chosen in ["tanglish", "hinglish"]:
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta_tanglish" if chosen == "tanglish" else "hi_hinglish"}
            else:
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "en"}

        # Reverse pattern: "in hindi please", "hindi la sollunga", "hindi me batao", "hindi replay"
        reverse_lang_match = re.search(r"\b(in\s+)?(hindi|tamil|tanglish|hinglish|english)\s+(please|sollunga|solla|pesunga|pesalama|batao|bataiye|samjhao|karo|me|mein|la|reply|replay)\b", clean_lower)
        if reverse_lang_match:
            chosen = reverse_lang_match.group(2).lower()
            if chosen == "hindi":
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "hi"}
            elif chosen == "tamil":
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta"}
            elif chosen in ["tanglish", "hinglish"]:
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta_tanglish" if chosen == "tanglish" else "hi_hinglish"}
            else:
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "en"}

        # Direct short language prompts (e.g. "hindi ?", "hindi?", "tamil?", "english?")
        if re.search(r"^(\s*| )(hindi|hindi\?|hindi\s*\?|in hindi|in hindi\?|हिंदी|हिंदी\?|हिंदी\s*\?)(\s*| )$", clean_lower):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "hi"}
        if re.search(r"^(\s*| )(tamil|tamil\?|tamil\s*\?|in tamil|in tamil\?|தமிழ்|தமிழ்\?|தமிழ்\s*\?)(\s*| )$", clean_lower):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta"}
        if re.search(r"^(\s*| )(english|english\?|english\s*\?|in english|in english\?|ஆங்கிலம்|ஆங்கிலம்\?)(\s*| )$", clean_lower):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "en"}

        if any(phrase in clean_lower for phrase in [
            "tamil la pesalama", "tamiil la pesalama", "tamilil pesalama", "tamil la pesalam", 
            "tamil pesa mudiyuma", "tamil theriyuma", "tamil la pesunga", "tamil pesunga", "tamil la pesuviya",
            "tamil la sollunga", "tamil la sollu", "tamilil sollunga",
            "can you speak tamil", "can we speak in tamil", "speak in tamil", "talk in tamil", 
            "switch to tamil", "தமிழ்ல பேசலாமா", "தமிழில் பேசலாமா", "தமிழ்ல பேசுங்க", "தமிழில் பேச முடியுமா", "தமிழ் பேச முடியுமா",
            "தமிழ்ல சொல்லுங்க", "தமிழில் சொல்லுங்கள்", "தமிழில் விளக்குங்கள்", "தமிழ்ல சொல்லு"
        ]):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "ta"}

        if any(phrase in clean_lower for phrase in [
            "hindi me baat karo", "hindi bol sakte ho", "kya aap hindi बोलte hain", "kya aap hindi bolte hain",
            "can you speak hindi", "speak in hindi", "talk in hindi", "switch to hindi", "hindi aati hai",
            "hindi me batao", "hindi mein batao", "hindi me samjhao", "hindi mein samjhao",
            "हिंदी में बात करो", "क्या आप हिंदी बोलते हैं", "हिंदी में बताओ", "हिंदी में समझाइए", "हिंदी में बोलो"
        ]):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "hi"}

        if any(phrase in clean_lower for phrase in [
            "speak in english", "can you speak english", "talk in english", "switch to english", "english please",
            "explain in english", "tell in english", "tell me in english"
        ]):
            return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.99, "selected_language": "en"}

        for pat in LANGUAGE_SELECTION_PATTERNS:
            if re.search(pat, clean_lower, re.IGNORECASE):
                selected_lang = "en"
                if "hinglish" in clean_lower:
                    selected_lang = "hi_hinglish"
                elif any(t in clean_lower for t in ["tanglish", "thannglish", "thanglish"]):
                    selected_lang = "ta_tanglish"
                elif any(t in clean_lower for t in ["tamil", "tamiil", "தமிழ்", "ta"]):
                    selected_lang = "ta"
                elif any(t in clean_lower for t in ["hindi", "हिंदी", "hi"]):
                    selected_lang = "hi"
                elif "english" in clean_lower:
                    selected_lang = "en"
                return INTENTS["LANGUAGE_SELECTION"], {"confidence": 0.98, "selected_language": selected_lang}

    # 4. Check Greeting
    for pat in GREETING_PATTERNS:
        if re.search(pat, clean_lower, re.IGNORECASE):
            return INTENTS["GREETING"], {"confidence": 0.98}

    # 5. Check Thanks
    for pat in THANKS_PATTERNS:
        if re.search(pat, clean_lower, re.IGNORECASE):
            return INTENTS["THANKS"], {"confidence": 0.98}

    # 6. Check Goodbye
    for pat in GOODBYE_PATTERNS:
        if re.search(pat, clean_lower, re.IGNORECASE):
            return INTENTS["GOODBYE"], {"confidence": 0.98}

    # 7. Check General Capability / Chit-Chat / Help Conversation
    for pat in GENERAL_CONVO_PATTERNS:
        if re.search(pat, clean_lower, re.IGNORECASE):
            return INTENTS["GENERAL_CONVERSATION"], {"confidence": 0.95}

    # 8. Check Informational Legal Question
    if any(k in clean_lower for k in LEGAL_QUESTION_KEYWORDS) or re.search(r"^what\s+is\s+.*(act|section|law|tribunal|dlsa|court)\??$", clean_lower):
        return INTENTS["LEGAL_QUESTION"], {"confidence": 0.90}

    # 9. Check Follow-Up Action & Legal Procedure Queries (e.g. "how can i solve this", "enna pannanum")
    follow_up_patterns = [
        r"\b(how\s+can\s+i\s+solve|how\s+to\s+solve|how\s+to\s+resolve|how\s+to\s+proceed|how\s+can\s+we\s+solve)\b",
        r"\b(what\s+should\s+i\s+do|what\s+can\s+i\s+do|what\s+to\s+do\s+next|next\s+step|immediate\s+action)\b",
        r"\b(epdi\s+solve\s+panradhu|enna\s+pannanum|epdi\s+proceed\s+panradhu|adutha\s+step\s+enna|first\s+action\s+enna)\b",
        r"\b(kaise\s+solve\s+karein|kya\s+karna\s+hoga|kya\s+karein|aage\s+kya\s+karein)\b",
        r"\b(where\s+to\s+complain|whom\s+to\s+approach|enga\s+complaint|yaar\s+kitta\s+complaint|yarkita\s+complaint)\b"
    ]
    if any(re.search(p, clean_lower) for p in follow_up_patterns):
        return INTENTS["LEGAL_PROCEDURE"], {"confidence": 0.95, "is_follow_up": True}

    # 10. Check if utterance has ANY real legal domain keywords
    has_legal_keyword = any(k in clean_lower for k in LEGAL_DOMAIN_KEYWORDS)
    if not has_legal_keyword and len(clean_lower.split()) <= 6:
        # Non-legal short conversational query (e.g. "what is your name", "tell me something", "how do you work", "pesuviya")
        return INTENTS["GENERAL_CONVERSATION"], {"confidence": 0.85}

    # 11. Default to Legal Problem for domain grievances
    return INTENTS["LEGAL_PROBLEM"], {"confidence": 0.85}
