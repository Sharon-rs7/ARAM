from langdetect import detect
import re

def detect_language(text: str) -> str:
    if not text:
        return "en"
    
    # Check for Tamil character patterns to ensure Tamil/Tanglish detection
    tamil_chars = len(re.findall(r"[\u0b80-\u0bff]", text))
    if tamil_chars > 0:
        return "ta"
        
    try:
        lang = detect(text)
        if lang in ["ta", "en", "hi"]:
            return lang
        # check Tanglish indicators
        if any(w in text.lower() for w in ["sambalam", "veetu", "panam", "tholachuten", "veetla", "purushan", "adikiraru"]):
            return "ta"
        return "en"
    except Exception:
        return "en"
