import re
from app.nlp.language_detector import language_detector

def normalize_text(text: str, resolved_lang: str = None) -> dict:
    if not text:
        return {
            "originalText": "",
            "normalizedText": "",
            "detectedLanguage": "en",
            "tokens": []
        }

    # Detect language first before normalization
    if resolved_lang:
        detected_lang = resolved_lang
    else:
        lang_res = language_detector.detect(text)
        detected_lang = lang_res["language"]

    original = text
    # 1. Lowercase & standardize whitespace
    normalized = text.lower().strip()
    normalized = re.sub(r"\s+", " ", normalized)

    # 2. Remove repeated letters
    normalized = re.sub(r"(.)\1{2,}", r"\1", normalized)

    # 3. Handle common transliteration and translation variants for Tamil/Tanglish/mixed
    if detected_lang in ["ta", "ta-en"]:
        replacements = {
            # Suffix-Tolerant Native Tamil Script Checks
            r"சம்பள\w*": "salary",
            r"ஊதிய\w*": "salary",
            r"முதலாளி\w*": "employer",
            r"மாத\w*": "month",
            r"தரவில்லை\w*": "not paying",
            r"தரல\w*": "not paying",
            r"மூன்று\w*": "three",
            r"இரண்டு\w*": "two",
            r"வேலை\w*": "job",
            r"பண\w*": "money",
            r"\b(?:நிலம்\w*|நிலத்து\w*|நிலத்தி\w*|நிலங்கள்\w*|நில(?![\u0b80-\u0bff]))": "land",
            r"வீட்டு\w*": "house",
            r"வீடு\w*": "house",
            r"லஞ்ச\w*": "bribe",
            r"காவல்\w*": "police",
            r"கணவ\w*": "husband",
            r"மனைவி\w*": "wife",
            r"அடி\w*": "beats",
            r"மிரட்ட\w*": "threat",
            r"ஆக்கிரமி\w*": "encroachment",
            r"விபத்து\w*": "accident",
            r"இழப்பீடு\w*": "compensation",
            r"கல்வி\w*": "education",
            r"பள்ளி\w*": "school",
            r"கட்டண\w*": "fees",
            r"சிகிச்சை\w*": "treatment",
            r"மருத்துவ\w*": "medical",
            r"காப்பீடு\w*": "insurance",
            r"வழக்கு\w*": "court",
            r"ஒப்பந்த\w*": "agreement",
            r"வாடகை\w*": "rent",
            r"குடும்ப\w*": "family",
            r"உதவி\w*": "help",
            r"பிரச்சனை\w*": "problem",
            r"பிரச்சினை\w*": "problem",
            r"எல்லை\w*": "boundary",
            r"துன்புறுத்து\w*": "harassment",
            r"பட்டா\w*": "patta",
            r"வாரிசு\w*": "inheritance",
            r"முதியோர்\w*": "senior citizen",
            r"திட்ட\w*": "scheme",
            r"குடிநீர்\w*": "drinking water",
            r"தெருவிளக்கு\w*": "street light",
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

    # 4. Handle common transliteration and translation variants for Hindi/Hinglish/mixed
    elif detected_lang in ["hi", "hi-en"]:
        replacements = {
            # Suffix-Tolerant Native Hindi Script Checks
            r"वेतन\w*": "salary",
            r"मालिक\w*": "employer",
            r"काम\w*": "work",
            r"पैस\w*": "money",
            r"महीन\w*": "month",
            r"नहीं\w*": "not",
            r"मकान\w*": "house",
            r"घर\w*": "house",
            r"जमीन\w*": "land",
            r"भूमि\w*": "land",
            r"रिश्वत\w*": "bribe",
            r"पति\w*": "husband",
            r"मार\w*": "beats",
            r"धमकी\w*": "threat",
            r"सड़क\w*": "road",
            r"पानी\w*": "water",
            r"गड्ढे\w*": "potholes",
            r"पुलिस\w*": "police",
            r"दुर्घटना\w*": "accident",
            r"एक्सीडेंट\w*": "accident",
            r"दावा\w*": "claim",
            r"बीमा\w*": "insurance",
            r"स्कूल\w*": "school",
            r"फीस\w*": "fees",
            r"इलाज\w*": "treatment",
            r"अस्पताल\w*": "hospital",
            r"भ्रष्टाचार\w*": "corruption",
            r"सीमा\w*": "boundary",
            r"खाली\w*": "vacate",
            r"एफआईआर\w*": "fir",
            r"बुजुर्ग\w*": "elderly",
            r"माता\w*": "mother",
            r"पिता\w*": "father",
            r"राशन\w*": "ration",
            r"महिला\w*": "women",
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
