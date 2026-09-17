import numpy as np
from app.ml.text_preprocessor import clean_text

def recommend_authority(text: str, category: str, priority: str, district: str) -> dict:
    return {
        "recommendedAuthority": "DATA_REQUIRED",
        "authorityType": "DATA_REQUIRED",
        "confidence": 0.0,
        "manualReviewRequired": True,
        "modelBased": False,
        "prediction_source": "DATA_REQUIRED"
    }
