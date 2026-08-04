CATEGORY_LOCALIZATIONS = {
    "LABOUR_DISPUTE": {
        "en": "Labour & Salary Issue",
        "ta": "சம்பளம் மற்றும் வேலை தொடர்பான பிரச்சனை",
        "ta-en": "Sambalam matrum velai prachanai"
    },
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": {
        "en": "Personal Safety & Domestic Concern",
        "ta": "தனிப்பட்ட பாதுகாப்பு மற்றும் குடும்ப பிரச்சனை",
        "ta-en": "Thanippatta paadhukaappu matrum kudumba prachanai"
    },
    "CYBER_CRIME": {
        "en": "Cyber Fraud & Bank Scam",
        "ta": "சைபர் ஏமாற்று மற்றும் வங்கி மோசடி",
        "ta-en": "Cyber eamaatru matrum bank scam"
    },
    "CONSUMER_COMPLAINT": {
        "en": "Consumer & Defective Product Issue",
        "ta": "நுகர்வோர் மற்றும் பொருள் பிரச்சனை",
        "ta-en": "Nugarvoor matrum porul prachanai"
    },
    "PROPERTY_DISPUTE": {
        "en": "Property & Land Dispute",
        "ta": "நிலம் மற்றும் சொத்து பிரச்சனை",
        "ta-en": "Nilam matrum sothu prachanai"
    },
    "GOVERNMENT_SCHEME": {
        "en": "Government Scheme & Pension Issue",
        "ta": "அரசு திட்டம் மற்றும் ஓய்வூதிய பிரச்சனை",
        "ta-en": "Arasu thittam matrum ooyvoothiya prachanai"
    },
    "GENERAL_LEGAL_AID": {
        "en": "General Legal Aid Grievance",
        "ta": "பொது சட்ட உதவி புகார்",
        "ta-en": "Podhu legal aid complaint"
    }
}

PRIORITY_LOCALIZATIONS = {
    "CRITICAL": {
        "en": "Urgent Action Required",
        "ta": "உடனடி அவசர நடவடிக்கை தேவை",
        "ta-en": "Udanadi avasara nadavadikkai thevai"
    },
    "HIGH": {
        "en": "High Priority Review Needed",
        "ta": "முக்கிய பரிசீலனை தேவைப்படுகிறது",
        "ta-en": "Mukkiya pariseelanai thevai"
    },
    "MEDIUM": {
        "en": "Standard Review",
        "ta": "இயல்பான பரிசீலனை",
        "ta-en": "Iyalbaana pariseelanai"
    },
    "LOW": {
        "en": "Standard Guidance",
        "ta": "பொது வழிகாட்டுதல்",
        "ta-en": "Podhu vazhikaattudhal"
    }
}

TEMPLATES = {
    "headline": {
        "en": "This is a {category} requiring {priority}.",
        "ta": "இது {category}, இதற்கு {priority}.",
        "ta-en": "Idhu {category}, idhukku {priority}."
    },
    "summary": {
        "en": "We understood your issue regarding '{title}'. Your grievance has been registered for free legal aid support in {district}.",
        "ta": "உங்கள் புகார் '{title}' தொடர்பாக பதிவு செய்யப்பட்டுள்ளது. {district} மாவட்டத்தில் இலவச சட்ட உதவிக்காக உங்களது கோரிக்கை அனுப்பப்பட்டுள்ளது.",
        "ta-en": "Unga complaint '{title}' thodarbaga padhivu seyyappattudhu. {district} district-il legal aid help-uku anuppiyullom."
    },
    "next_steps_default": {
        "en": [
            "Keep your identity proof or related document ready.",
            "A verified legal aid guide will review your file and contact you.",
            "Track updates anytime on your ARAM dashboard using your reference ID."
        ],
        "ta": [
            "உங்கள் அடையாள சான்று அல்லது ஆவணத்தை தயார் நிலையில் வைக்கவும்.",
            "சட்ட வழிகாட்டி உங்கள் புகாரை பரிசீலித்து தொடர்பு கொள்வார்.",
            "உங்கள் ஏஆர்ஏஎம் குறிப்பு எண்ணை கொண்டு நிலையைக் கண்காணிக்கலாம்."
        ],
        "ta-en": [
            "Unga ID proof alladhu document ready-ah veiyunga.",
            "Legal guide unga file-a review pannitu thodarbu kolvaar.",
            "Unga ARAM reference ID vechu status track pannalaam."
        ]
    }
}

def get_localized_category(category_key: str, lang: str) -> str:
    lang = lang.lower() if lang else "en"
    if lang in ["ta-in"]: lang = "ta"
    cat_dict = CATEGORY_LOCALIZATIONS.get(category_key, {})
    return cat_dict.get(lang, cat_dict.get("en", category_key or "Legal Grievance"))

def get_localized_priority(priority_key: str, lang: str) -> str:
    lang = lang.lower() if lang else "en"
    if lang in ["ta-in"]: lang = "ta"
    prio_dict = PRIORITY_LOCALIZATIONS.get(priority_key, {})
    return prio_dict.get(lang, prio_dict.get("en", priority_key or "Standard Review"))

def get_localized_response(template_key: str, language_code: str, **kwargs) -> str:
    lang = language_code.lower() if language_code else "en"
    if lang in ["en-in", "en-us"]: lang = "en"
    elif lang in ["ta-in"]: lang = "ta"
    elif lang in ["hi-in"]: lang = "hi"

    template_dict = TEMPLATES.get(template_key)
    if not template_dict:
        return f"[{template_key}]"

    if lang not in template_dict:
        lang = "en"

    template_str = template_dict.get(lang, template_dict.get("en", ""))
    
    if isinstance(template_str, list):
        return template_str

    try:
        return template_str.format(**kwargs)
    except Exception as e:
        print(f"Error formatting response template: {e}")
        return template_str
