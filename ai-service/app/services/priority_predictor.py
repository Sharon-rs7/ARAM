import os
import numpy as np
import onnxruntime as ort

class PriorityPredictor:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.onnx_path = os.path.join(self.models_dir, "priority_model.onnx")
        self.session = None
        self.load_model()

    def load_model(self):
        from app.ml.model_loader import ml_model_loader
        self.session = ml_model_loader.get_model("priority_model")
        if self.session:
            print("[ONNX REUSED] PriorityPredictor session reused from ml_model_loader.")

    def predict(self, text: str, category: str, is_sensitive: bool = False) -> dict:
        score = 30
        priority_label = "LOW"
        model_based = False

        if self.session:
            try:
                input_name = self.session.get_inputs()[0].name
                output_names = [o.name for o in self.session.get_outputs()]
                res = self.session.run(output_names, {input_name: np.array([[text]], dtype=object)})
                
                priority_label = str(res[0][0])
                model_based = True
                
                score_map = {"CRITICAL": 92, "HIGH": 78, "MEDIUM": 55, "LOW": 30}
                score = score_map.get(priority_label, 30)
                
                if is_sensitive:
                    score = min(100, score + 15)
                    if score >= 90:
                        priority_label = "CRITICAL"
                    elif score >= 70:
                        priority_label = "HIGH"
            except Exception as e:
                print(f"ONNX priority prediction failed: {e}. Falling back to rules.")

        if not model_based:
            is_sensitive_kw = any(w in text.lower() for w in ["harassment", "beating", "abusing", "violence", "threaten", "casteist"])
            emergency_kw = any(w in text.lower() for w in ["kill", "attack", "suicide", "robbed", "lockup"])
            money_kw = any(w in text.lower() for w in ["salary", "money", "scam", "bribe"])

            if emergency_kw or is_sensitive or is_sensitive_kw:
                priority_label = "HIGH"
                score = 80
                if emergency_kw:
                    priority_label = "CRITICAL"
                    score = 95
            elif money_kw or category in ["CYBER_CRIME", "LABOUR_DISPUTE"]:
                priority_label = "MEDIUM"
                score = 55

        priority_names = {
            "LOW": "Standard Guidance",
            "MEDIUM": "Priority Review",
            "HIGH": "Urgent Intervention",
            "CRITICAL": "Urgent Intervention"
        }

        return {
            "priorityCode": priority_label,
            "priorityName": priority_names.get(priority_label, "Standard Guidance"),
            "priorityScore": int(score),
            "modelBased": model_based
        }

priority_predictor = PriorityPredictor()
