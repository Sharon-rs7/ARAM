import numpy as np
from scipy.sparse import csr_matrix, hstack
from app.model_loader import model_loader

CRITICAL_WORDS = [
    "kill", "murder", "suicide", "weapons", "danger", "die", "attack", "blood", "emergency", 
    "threat", "violence", "kidnap", "rape", "assault", "கொலை", "தாக்குதல்", "மிரட்டல்", "தற்கொலை", "ஆபத்து"
]

HIGH_PRIORITY_CATEGORIES = [
    "WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "MEDICAL_NEGLIGENCE", 
    "MOTOR_ACCIDENT", "POLICE_MISCONDUCT", "CHILD_WELFARE", "SC_ST_ATROCITIES", 
    "CYBER_CRIME", "SENIOR_CITIZEN_WELFARE"
]

MEDIUM_PRIORITY_CATEGORIES = [
    "LABOUR_DISPUTE", "INSURANCE_CLAIM", "BANKING_DISPUTE", "CORRUPTION_BRIBERY", 
    "TENANCY_DISPUTE", "LAND_PROPERTY", "ELECTRICITY_UTILITY", "EDUCATION_FEE_DISPUTE",
    "PENSION_GRATUITY", "CONSUMER_DISPUTE", "RTI_MATTERS", "MUNICIPAL_SERVICES"
]

def predict_priority(text: str, category: str, is_sensitive: bool, duration_months: int = 1):
    lower_text = text.lower() if text else ""
    
    # 1. Rule-based safety override: check for immediate danger/self-harm
    contains_emergency = any(w in lower_text for w in CRITICAL_WORDS)
    if contains_emergency:
        return {
            "priority": "CRITICAL",
            "priorityScore": 95,
            "confidence": 0.98,
            "manualReviewRequired": True,
            "emergencyWarning": True,
            "modelBased": True
        }

    # 2. Dynamic scoring based on category, sensitivity, duration and text indicators
    score = 35
    cat_upper = (category or "").upper()
    
    if is_sensitive or cat_upper in HIGH_PRIORITY_CATEGORIES:
        score += 40
    elif cat_upper in MEDIUM_PRIORITY_CATEGORIES:
        score += 20
        
    # High impact keywords
    if any(k in lower_text for k in ["accident", "hospital", "injury", "fracture", "death", "विபத்து", "காயம்", "மருத்துவமனை", "இழப்பு"]):
        score += 25
    if any(k in lower_text for k in ["salary", "pension", "lakh", "crore", "cheated", "fraud", "harass", "evict", "சம்பளம்", "மோசடி", "பணம்", "வெளியேற்ற"]):
        score += 15
        
    # Duration weighting (longer unresolved issues escalate priority)
    if duration_months >= 12:
        score += 15
    elif duration_months >= 3:
        score += 10

    # Cap score
    score = min(100, max(15, score))

    if score >= 85:
        priority = "CRITICAL"
    elif score >= 65:
        priority = "HIGH"
    elif score >= 35:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return {
        "priority": priority,
        "priorityScore": int(score),
        "confidence": 0.92,
        "manualReviewRequired": priority in ["CRITICAL", "HIGH"] or is_sensitive,
        "emergencyWarning": contains_emergency,
        "modelBased": True
    }

