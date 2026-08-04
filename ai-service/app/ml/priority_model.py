import numpy as np
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def predict_priority(text: str) -> dict:
    cleaned = clean_text(text)
    
    if not ml_model_loader.is_available("priority_model") or not ml_model_loader.is_available("vectorizer"):
        return {
            "priority": "MEDIUM",
            "confidence": 0.0,
            "manualReviewRequired": True,
            "modelBased": False
        }

    clf = ml_model_loader.get_model("priority_model")
    vec = ml_model_loader.get_model("vectorizer")
    
    try:
        features = vec.transform([cleaned])
        pred_prio = str(clf.predict(features)[0])
        
        probs = clf.predict_proba(features)[0]
        classes = clf.classes_
        class_idx = list(classes).index(pred_prio)
        confidence = round(float(probs[class_idx]), 3)
        
        manual_review = confidence < 0.65
        
        return {
            "priority": pred_prio,
            "confidence": confidence,
            "manualReviewRequired": manual_review,
            "modelBased": True
        }
    except Exception as e:
        print(f"Error predicting priority: {e}")
        return {
            "priority": "MEDIUM",
            "confidence": 0.0,
            "manualReviewRequired": True,
            "modelBased": False
        }
