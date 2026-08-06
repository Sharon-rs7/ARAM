import re
from app.nlp.language_detector import language_detector

def normalize_text(text: str) -> dict:
    if not text:
        return {
            "originalText": "",
            "normalizedText": "",
            "detectedLanguage": "en",
            "tokens": []
        }

    # Detect language first before normalization
    lang_res = language_detector.detect(text)
    detected_lang = lang_res["language"]

    original = text
    # 1. Lowercase & standardize whitespace
    normalized = text.lower().strip()
    normalized = re.sub(r"\s+", " ", normalized)

    # 2. Remove repeated letters
    normalized = re.sub(r"(.)\1{2,}", r"\1", normalized)

    # 3. Handle common transliteration and translation variants for Tamil/Tanglish
    if detected_lang == "ta":
        replacements = {
            # Native Tamil Script
            r"சம்பளம்": "salary",
            r"முதலாளி": "employer",
            r"மாதங்களாக": "months",
            r"மாதம்": "month",
            r"தரவில்லை": "not paying",
            r"மூன்று": "three",
            r"இரண்டு": "two",
            r"வேலை": "job",
            r"பணம்": "money",
            r"நிலம்": "land",
            r"லஞ்சம்": "bribe",
            r"காவல்": "police",
            # Tanglish Romanized Script
            r"\benakku\b": "my",
            r"\benaku\b": "my",
            r"\bennoda\b": "my",
            r"\btharala\b": "not paying",
            r"\btarala\b": "not paying",
            r"\bkudukala\b": "not paying",
            r"\bsambalam\b": "salary",
            r"\bmaasam\b": "month",
            r"\bmasam\b": "month",
            r"\bvelai\b": "job",
            r"\bvelay\b": "job",
            r"\brendu\b": "two",
            r"\bbrandu\b": "two",
            r"\bmoonu\b": "three",
            r"\billai\b": "not",
            r"\billa\b": "not",
            r"\blatcham\b": "bribe"
        }
        for pattern, repl in replacements.items():
            normalized = re.sub(pattern, repl, normalized)

    # 4. Handle common transliteration and translation variants for Hindi/Hinglish
    elif detected_lang == "hi":
        replacements = {
            # Native Hindi Script
            r"वेतन बकाया": "pending wages",
            r"वेतन": "salary",
            r"मालिक": "employer",
            r"काम": "work",
            r"पैसा": "money",
            r"महीने": "months",
            r"महीना": "month",
            r"नहीं": "not",
            r"मिला": "received",
            r"घर": "house",
            r"जमीन": "land",
            r"बकाया": "pending",
            # Hinglish Romanized Script
            r"\bmujhe\b": "my",
            r"\bmujhae\b": "my",
            r"\bnahi\b": "not",
            r"\bnahii\b": "not",
            r"\bnahee\b": "not",
            r"\bmili\b": "received",
            r"\bmilee\b": "received",
            r"\bmahine\b": "month",
            r"\bmaheene\b": "month"
        }
        for pattern, repl in replacements.items():
            normalized = re.sub(pattern, repl, normalized)

    # Tokenize
    tokens = re.findall(r"\b\w+\b", normalized)

    return {
        "originalText": original,
        "normalizedText": normalized,
        "detectedLanguage": detected_lang,
        "tokens": tokens
    }
