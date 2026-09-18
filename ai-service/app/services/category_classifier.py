import os
import numpy as np
try:
    import onnxruntime as ort
except Exception:
    ort = None
from app.complaint_classifier import keyword_category

class CategoryClassifier:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.onnx_path = os.path.join(self.models_dir, "category_model.onnx")
        self.session = None
        self.load_model()

    def load_model(self):
        from app.ml.model_loader import ml_model_loader
        self.session = ml_model_loader.get_model("category_model")
        if self.session:
            print("[ONNX REUSED] CategoryClassifier session reused from ml_model_loader.")

    def classify(self, text: str) -> dict:
        if not text or not text.strip():
            return {"category": "GENERAL_LEGAL_AID", "confidence": 1.0, "modelBased": False}

        # Try ONNX prediction
        if self.session:
            try:
                input_name = self.session.get_inputs()[0].name
                output_names = [o.name for o in self.session.get_outputs()]
                res = self.session.run(output_names, {input_name: np.array([[text]], dtype=object)})
                
                pred_category = str(res[0][0])
                confidence = 0.95
                
                if len(res) > 1 and isinstance(res[1], list) and len(res[1]) > 0:
                    probs = res[1][0]
                    if isinstance(probs, dict):
                        confidence = float(probs.get(pred_category, 0.95))
                
                return {
                    "category": pred_category,
                    "confidence": round(confidence, 2),
                    "modelBased": True
                }
            except Exception as e:
                print(f"ONNX classification failed: {e}. Falling back to keywords.")
                
        fallback = keyword_category(text)
        return {
            "category": fallback,
            "confidence": 0.50,
            "modelBased": False
        }

category_classifier = CategoryClassifier()
