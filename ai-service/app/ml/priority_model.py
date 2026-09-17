from app.priority_predictor import predict_priority as calculate_priority

def predict_priority(text: str, category: str = "GENERAL_LEGAL_AID", is_sensitive: bool = False, duration_months: int = 1) -> dict:
    res = calculate_priority(text, category, is_sensitive, duration_months)
    return {
        "priority": res.get("priority", "MEDIUM"),
        "confidence": res.get("confidence", 0.85),
        "priorityScore": res.get("priorityScore", 50),
        "manualReviewRequired": res.get("manualReviewRequired", False),
        "emergencyWarning": res.get("emergencyWarning", False),
        "modelBased": res.get("modelBased", True),
        "prediction_source": "INTELLIGENT_PRIORITY_CLASSIFIER"
    }

