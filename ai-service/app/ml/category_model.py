import numpy as np
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def predict_category(text: str) -> dict:
    cleaned = clean_text(text)
    
    # Check if models are available
    if not ml_model_loader.is_available("category_model") or not ml_model_loader.is_available("vectorizer"):
        return {
            "category": "GENERAL_LEGAL_AID",
            "confidence": 0.0,
            "topCategories": [{"category": "GENERAL_LEGAL_AID", "probability": 0.0}],
            "manualReviewRequired": True,
            "modelBased": False
        }

    clf = ml_model_loader.get_model("category_model")
    vec = ml_model_loader.get_model("vectorizer")
    
    try:
        features = vec.transform([cleaned])
        probs = clf.predict_proba(features)[0]
        
        # Get classes and sort by probability descending
        classes = clf.classes_
        sorted_indices = np.argsort(probs)[::-1]
        
        top_cats = []
        for idx in sorted_indices[:3]:
            top_cats.append({
                "category": str(classes[idx]),
                "probability": round(float(probs[idx]), 3)
            })
            
        best_cat = top_cats[0]["category"]
        confidence = top_cats[0]["probability"]
        
        manual_review = confidence < 0.65
        
        return {
            "category": best_cat,
            "confidence": confidence,
            "topCategories": top_cats,
            "manualReviewRequired": manual_review,
            "modelBased": True
        }
    except Exception as e:
        print(f"Error predicting category: {e}")
        return {
            "category": "GENERAL_LEGAL_AID",
            "confidence": 0.0,
            "topCategories": [{"category": "GENERAL_LEGAL_AID", "probability": 0.0}],
            "manualReviewRequired": True,
            "modelBased": False
        }
