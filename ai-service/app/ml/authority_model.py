import numpy as np
import onnxruntime as ort
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def recommend_authority(text: str, category: str, priority: str, district: str) -> dict:
    cleaned = clean_text(text)
    combined_input = f"text: {cleaned} category: {category} priority: {priority} district: {district}"
    
    # Check if authority_model is available
    if not ml_model_loader.is_available("authority_model"):
        raise Exception("ML Authority Recommender model authority_model.onnx is missing or not loaded.")

    clf = ml_model_loader.get_model("authority_model")
    
    try:
        # Run ONNX inference with raw string input
        input_name = clf.get_inputs()[0].name
        output_names = [o.name for o in clf.get_outputs()]
        
        input_data = np.array([[combined_input]], dtype=object)
        res = clf.run(output_names, {input_name: input_data})
        
        pred_auth = str(res[0][0])
        probabilities = {}
        
        if len(res) > 1 and len(res[1]) > 0:
            raw_prob = res[1][0]
            if isinstance(raw_prob, dict):
                probabilities = {str(k): float(v) for k, v in raw_prob.items()}
                
        confidence = probabilities.get(pred_auth, 1.0)
        confidence = round(float(confidence), 3)
        
        manual_review = confidence < 0.65
        
        return {
            "recommendedAuthority": pred_auth,
            "authorityType": pred_auth,
            "confidence": confidence,
            "manualReviewRequired": manual_review,
            "modelBased": True
        }
    except Exception as e:
        print(f"Error predicting authority: {e}")
        raise e
