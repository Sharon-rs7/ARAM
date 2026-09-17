import numpy as np
import onnxruntime as ort
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text
from app.complaint_classifier import keyword_category

def predict_category(text: str) -> dict:
    cleaned = clean_text(text)
    
    # 1. Try Fallback Keyword Check first for other 23 categories
    matched_cat, highest_matches = keyword_category(text)
    if highest_matches > 0 and matched_cat not in ["CONSUMER_COMPLAINT", "BANKING_DISPUTE"]:
        return {
            "category": matched_cat,
            "confidence": 0.70,
            "topCategories": [{"category": matched_cat, "probability": 0.70}],
            "manualReviewRequired": False,
            "modelBased": False,
            "prediction_source": "FALLBACK / NON-ML"
        }
        
    # Check if category_model is available
    if not ml_model_loader.is_available("category_model"):
        # Fallback to general if ONNX is missing
        return {
            "category": matched_cat if highest_matches > 0 else "GENERAL_LEGAL_AID",
            "confidence": 0.50,
            "topCategories": [{"category": matched_cat if highest_matches > 0 else "GENERAL_LEGAL_AID", "probability": 0.50}],
            "manualReviewRequired": True,
            "modelBased": False,
            "prediction_source": "FALLBACK / NON-ML"
        }

    clf = ml_model_loader.get_model("category_model")
    
    try:
        # Run ONNX inference with raw string input
        input_name = clf.get_inputs()[0].name
        output_names = [o.name for o in clf.get_outputs()]
        
        input_data = np.array([[cleaned]], dtype=object)
        res = clf.run(output_names, {input_name: input_data})
        
        pred_label = str(res[0][0])
        probabilities = {}
        
        if len(res) > 1 and len(res[1]) > 0:
            raw_prob = res[1][0]
            if isinstance(raw_prob, dict):
                probabilities = {str(k): float(v) for k, v in raw_prob.items()}
        
        # Sort by probability descending
        top_cats = []
        if probabilities:
            sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
            for cat, p in sorted_probs[:3]:
                top_cats.append({
                    "category": cat,
                    "probability": round(p, 3)
                })
        else:
            top_cats = [{"category": pred_label, "probability": 1.0}]
            
        best_cat = top_cats[0]["category"]
        confidence = top_cats[0]["probability"]
        
        # Override with keyword matched category if ML prediction is weak or different,
        # and keyword matching shows strong evidence (>= 2 matches)
        if (confidence < 0.75 or best_cat != matched_cat) and highest_matches >= 2:
            best_cat = matched_cat
            confidence = 0.75
            manual_review = False
            model_based = False
            pred_source = "FALLBACK / NON-ML"
        else:
            manual_review = confidence < 0.65
            model_based = True
            pred_source = "REAL_ML_MODEL"
            
        return {
            "category": best_cat,
            "confidence": confidence,
            "topCategories": top_cats if model_based else [{"category": best_cat, "probability": confidence}],
            "manualReviewRequired": manual_review,
            "modelBased": model_based,
            "prediction_source": pred_source
        }
    except Exception as e:
        print(f"Error predicting category via ONNX: {e}")
        # Final fallback
        return {
            "category": matched_cat if highest_matches > 0 else "GENERAL_LEGAL_AID",
            "confidence": 0.50,
            "topCategories": [{"category": matched_cat if highest_matches > 0 else "GENERAL_LEGAL_AID", "probability": 0.50}],
            "manualReviewRequired": True,
            "modelBased": False,
            "prediction_source": "FALLBACK / NON-ML"
        }
