import numpy as np
from scipy.sparse import csr_matrix, hstack
from app.model_loader import model_loader

CRITICAL_WORDS = ["kill", "murder", "suicide", "weapons", "danger", "die", "attack", "blood", "emergency"]

def predict_priority(text: str, category: str, is_sensitive: bool, duration_months: int = 1):
    # Rule-based safety override: check for immediate danger/self-harm
    contains_emergency = any(w in text.lower() for w in CRITICAL_WORDS)
    
    if contains_emergency:
        return {
            "priority": "CRITICAL",
            "priorityScore": 95,
            "confidence": 0.95,
            "manualReviewRequired": True,
            "emergencyWarning": True,
            "modelBased": False
        }

    # If priority models are missing, fall back to rules
    if model_loader.is_model_missing("priority"):
        score = 30
        if is_sensitive or category in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT"]:
            score = 75
        elif category in ["CYBER_CRIME", "LABOUR_DISPUTE"]:
            score = 50
        
        # Adjust for duration
        if duration_months >= 3:
            score += 10
            
        priority = "LOW"
        if score >= 90:
            priority = "CRITICAL"
        elif score >= 70:
            priority = "HIGH"
        elif score >= 40:
            priority = "MEDIUM"

        return {
            "priority": priority,
            "priorityScore": int(min(100, score)),
            "confidence": 0.50,
            "manualReviewRequired": True,
            "emergencyWarning": False,
            "modelBased": False
        }

    clf = model_loader.models["priority_model"]
    reg = model_loader.models["priority_regressor"]
    le = model_loader.models["priority_label_encoder"]
    vec = model_loader.models["priority_vectorizer"]

    # Transform text and combine with metadata
    text_feat = vec.transform([text])
    sensitive_val = 1.0 if is_sensitive else 0.0
    emergency_val = 1.0 if contains_emergency else 0.0
    money_val = 1.0 if any(w in text.lower() for w in ["salary", "money", "rupees", "deposit"]) else 0.0
    
    metadata = np.array([[sensitive_val, emergency_val, money_val, float(duration_months)]])
    combined_feat = hstack([text_feat, csr_matrix(metadata)])

    # Predict label & score
    prob = clf.predict_proba(combined_feat)[0]
    pred_idx = np.argmax(prob)
    priority = le.inverse_transform([pred_idx])[0]
    confidence = float(prob[pred_idx])

    score = reg.predict(combined_feat)[0]

    return {
        "priority": priority,
        "priorityScore": int(min(100, max(0, score))),
        "confidence": confidence,
        "manualReviewRequired": confidence < 0.60 or priority == "CRITICAL",
        "emergencyWarning": False,
        "modelBased": True
    }
