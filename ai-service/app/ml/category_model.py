import numpy as np
import onnxruntime as ort
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def predict_category(text: str) -> dict:
    cleaned = clean_text(text)
    
    # Check if category_model is available
    if not ml_model_loader.is_available("category_model"):
        raise Exception("ML Category Classifier model category_model.onnx is missing or not loaded.")

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
        raise e
