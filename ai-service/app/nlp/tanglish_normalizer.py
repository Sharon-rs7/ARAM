"""
Tanglish & Colloquial Normalizer for Tamil, Tanglish, Hindi, and English legal queries.
Translates phonetic Tamil/Tanglish expressions into normalized Tamil and legal query keywords.
"""
import re
from typing import Tuple

TANGLISH_DICTIONARY = {
    # Greetings & Conversation
    "vanakkam": "வணக்கம்",
    "vanakam": "வணக்கம்",
    "vannakkam": "வணக்கம்",
    "hi": "hi",
    "hello": "hello",
    "pesalama": "பேசலாமா",
    "pesalam": "பேசலாம்",
    "pesalamaa": "பேசலாமா",
    "pesa mudiuma": "பேச முடியுமா",
    "pesa mudiyuma": "பேச முடியுமா",
    "tamil la": "தமிழில்",
    "thamizh la": "தமிழில்",
    "tamilil": "தமிழில்",
    "thamizhil": "தமிழில்",
    "tanglish la": "tanglish",
    "thannglish": "tanglish",
    
    # Common Legal Entities / Problem Words
    "sothu": "சொத்து",
    "soththu": "சொத்து",
    "idham": "இடம்",
    "edam": "இடம்",
    "veedu": "வீடு",
    "vaadagai": "வாடகை",
    "vadagai": "வாடகை",
    "panam": "பணம்",
    "sambalam": "சம்பளம்",
    "sambalam tharala": "சம்பளம் தரவில்லை",
    "tharala": "தரவில்லை",
    "kudukala": "கொடுக்கவில்லை",
    "kudukkala": "கொடுக்கவில்லை",
    "kaasu": "பணம்",
    "mosam": "மோசடி",
    "mosadi": "மோசடி",
    "police": "காவல்துறை",
    "thiruttu": "திருட்டு",
    "adi thadi": "தாக்குதல்",
    "adichitaanga": "தாக்கினார்கள்",
    "prachanai": "பிரச்சனை",
    "prechanai": "பிரச்சனை",
    "velai": "வேலை",
    "kadai": "கடை",
    "porul": "பொருள்",
    "cheating": "மோசடி",
    "threat": "மிரட்டல்",
    "mirattal": "மிரட்டல்",
    "kadan": "கடன்",
    "vatti": "வட்டி",
    "varampu": "வரம்பு",
    "pathiram": "பத்திரம்",
    "patta": "பட்டா",
    "chitta": "சிட்டா",
    "adangal": "அடங்கல்",
}

GREETING_PATTERNS = [
    r"^(hi|hello|hey|vanakkam|vanakam|vannakkam|namaste|pranam)",
    r"^(good morning|good afternoon|good evening)",
    r"^(how are you|epdi irukinga|eppadi irukkeenga|kaise ho)",
    r"^(who are you|neenga yaaru|aap kaun ho)"
]

LANGUAGE_SWITCH_PATTERNS = [
    r"(tamil\s*la\s*pes(alam|alama|a\s*mudiyuma)|thamizh\s*la\s*pes|tamilil\s*pes)",
    r"(tanglish\s*la\s*pes|thannglish|tanglish\s*support)",
    r"(english\s*la\s*pes|speak\s*in\s*english|can\s*we\s*talk\s*in\s*english)",
    r"(hindi\s*me\s*baat\s*karo|hindi\s*la\s*pes)"
]

def detect_and_normalize_tanglish(text: str) -> Tuple[str, str]:
    """
    Returns (normalized_text, detected_language)
    detected_language in ['ta', 'en', 'hi', 'tanglish']
    """
    cleaned = text.strip()
    lower = cleaned.lower()
    
    # Check if purely native Tamil
    if re.search(r'[஀-௿]', cleaned):
        return cleaned, "ta"
    
    # Check if purely Hindi
    if re.search(r'[ऀ-ॿ]', cleaned):
        return cleaned, "hi"
    
    # Check for Tanglish words
    words = lower.split()
    tanglish_count = 0
    normalized_words = []
    
    for w in words:
        clean_w = re.sub(r'[^\w]', '', w)
        if clean_w in TANGLISH_DICTIONARY:
            tanglish_count += 1
            normalized_words.append(TANGLISH_DICTIONARY[clean_w])
        else:
            normalized_words.append(w)
            
    if tanglish_count >= 1 or any(re.search(p, lower) for p in LANGUAGE_SWITCH_PATTERNS):
        return " ".join(normalized_words), "tanglish"
        
    return cleaned, "en"

def is_conversational_greeting(text: str) -> bool:
    lower = text.strip().lower()
    for p in GREETING_PATTERNS:
        if re.search(p, lower):
            # Check if it has extended legal description
            if len(lower.split()) <= 6:
                return True
    return False

def is_language_inquiry(text: str) -> bool:
    lower = text.strip().lower()
    for p in LANGUAGE_SWITCH_PATTERNS:
        if re.search(p, lower):
            return True
    return False
