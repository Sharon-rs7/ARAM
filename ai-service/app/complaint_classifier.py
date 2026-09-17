import numpy as np
from app.model_loader import model_loader

# Define a fallback catalog of keywords for safety verification
FALLBACK_KEYWORDS = {
    # 1. Specific disputes take priority
    "RENT_TENANT_DISPUTE": ["tenant", "landlord", "rent", "agreement", "lease", "eviction", "vacate", "owner", "vaadagai", "வாடகை", "குடியிருப்பு"],
    "CORRUPTION_BRIBERY": ["bribe", "corruption", "latcham", "kickback", "officer", "money", "demanding", "லஞ்சம்", "ஊழல்"],
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["husband", "beats", "beating", "abusing", "dowry", "starved", "domestic", "violence", "harass", "stalking", "girl", "woman", "கணவர்", "தாக்குகிறார்", "மிரட்டுகிறார்", "கொடுமை", "வன்முறை", "அடிக்கிறார்", "துன்புறுத்தல்", "பெண்கள்", "पति", "मारपीट", "दहेज", "घरेलू हिंसा", "उत्पीड़न"],
    "DOMESTIC_VIOLENCE": ["husband", "beats", "beating", "abusing", "dowry", "starved", "domestic", "violence", "கணவர்", "தாக்குகிறார்", "மிரட்டுகிறார்", "கொடுமை", "வன்முறை", "அடிக்கிறார்", "पति", "मारपीट", "दहेज", "घरेलू हिंसा"],
    "WORKPLACE_HARASSMENT": ["toxic", "supervisor", "manager", "hostile", "workplace", "abusive", "sexual"],
    "SENIOR_CITIZEN_ABUSE": ["senior citizen", "elderly", "abandoned", "father", "mother", "pension", "maintenance", "muthiyor", "முதியோர்"],
    "CHILD_WELFARE": ["child", "labor", "minor", "marriage", "school dropout", "work", "abuse", "kuzhandhai", "குழந்தை"],
    "DISABILITY_RIGHTS": ["disability", "disabled", "accessibility", "ramp", "reservation", "quota", "differently abled", "மாற்றுத்திறனாளி"],
    "CASTE_DISCRIMINATION": ["caste", "discrimination", "boycott", "sc", "slurs", "glass", "temple", "jaathi", "சாதி"],
    "POLICE_MISCONDUCT": ["police", "fir", "detention", "lockup", "custodial", "violence", "misconduct", "beating", "காவல்துறை"],
    "CYBER_CRIME": ["upi", "fraud", "scam", "otp", "hacked", "online", "cyber", "மோசடி", "பணம் பறிப்பு", "ஹேக்", "धोखाधड़ी", "ऑनलाइन फ्रॉड"],
    "MOTOR_ACCIDENT_CLAIM": ["accident", "collision", "compensation", "vehicle", "car", "bike", "truck", "mact", "ibabathu", "விபத்து"],
    "INSURANCE_CLAIM": ["insurance", "rejection", "policy", "premium", "payout", "claim", "kaapeedu", "காப்பீடு"],
    "MEDICAL_NEGLIGENCE": ["negligence", "doctor", "surgical", "gauze", "wrong medication", "hospital", "injection", "treatment", "alatchiyam", "மருத்துவ அலட்சியம்"],
    "EDUCATION_DISPUTE": ["college", "school", "certificate", "capitation fee", "rte", "admission", "scholarship", "fees", "கல்லூரி", "பள்ளி"],
    "RTI_APPLICATION": ["rti", "information", "pio", "appeal", "application", "reply", "details", "தகவல் அறியும் உரிமை"],
    "GOVERNMENT_SCHEME": ["scheme", "pension", "ration", "benefits", "அரசு திட்டம்"],

    # 2. General/broader categories later
    "WOMEN_SAFETY": ["stalking", "harassment", "abuse", "follow", "women", "girl", "பெண்கள் பாதுகாப்பு"],
    "BANKING_DISPUTE": ["banking", "credit card", "frozen", "loan", "emi", "unauthorized", "charge", "interest", "banku", "bank", "account", "வங்கி"],
    "PROPERTY_DISPUTE": ["land", "property", "house", "patta", "deed", "boundary", "நிலம்", "சொத்து", "பட்டா", "பத்திரம்", "பாகப்பிரிவினை", "जमीन", "संपत्ति"],
    "LABOUR_DISPUTE": ["salary", "wage", "employer", "employee", "job", "termination", "overtime", "sambalam", "velai", "சம்பளம்", "வேலை", "முதலாளி", "ஊதியம்", "வேலைநீக்கம்", "தொழிலாளர்", "वेतन", "मजदूरी", "मालिक"],
    "FAMILY_DISPUTE": ["divorce", "custody", "marriage", "inheritance", "ancestral", "ancestry", "division", "விவாகரத்து", "திருமணம்"],
    "CIVIC_INFRASTRUCTURE": ["sewage", "drinking water", "potholes", "street light", "garbage", "civic", "municipal", "road", "kuppai", "குப்பை", "சாலை", "சாக்கடை"],
    "CRIMINAL_COMPLAINT": ["theft", "stole", "robbed", "attack", "weapons", "assault", "திருட்டு", "தாக்குதல்", "தாக்கினார்"],
    "CONSUMER_COMPLAINT": ["refund", "product", "damaged", "seller", "order", "invoice", "warranty", "bill", "பழுது", "விற்பனையாளர்", "ரசீது", "பொருட்கள்", "பணம் திரும்ப", "वारंटी", "रिफंड", "दुकानदार"]
}
import re

def keyword_category(text: str):
    normalized = text.lower()
    matched_cat = "GENERAL_LEGAL_AID"
    highest_matches = 0

    for cat, keywords in FALLBACK_KEYWORDS.items():
        matches = 0
        for kw in keywords:
            kw_clean = kw.lower()
            # If keyword is non-ASCII (Tamil, Hindi, etc.), check direct substring
            if any(ord(c) > 127 for c in kw_clean):
                if kw_clean in normalized:
                    matches += 1
            else:
                pattern = rf"(?:\b|[^a-zA-Z]){re.escape(kw_clean)}(?:\b|[^a-zA-Z])"
                if re.search(pattern, normalized):
                    matches += 1
        if matches > highest_matches:
            highest_matches = matches
            matched_cat = cat

    return matched_cat, highest_matches

def predict_category(text: str):
    try:
        from app.ml.category_model import predict_category as ml_predict
        res = ml_predict(text)
        if res and "category" in res:
            return res
    except Exception:
        pass

    matched_cat, matches = keyword_category(text)
    return {
        "category": matched_cat,
        "confidence": 0.70 if matches > 0 else 0.50,
        "manualReviewRequired": matches == 0,
        "modelBased": False
    }
