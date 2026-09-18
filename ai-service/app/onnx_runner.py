import os
import numpy as np
try:
    import onnxruntime as ort
except Exception:
    ort = None

class ONNXRunner:
    def __init__(self, model_filename: str):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        self.model_path = os.path.join(self.models_dir, model_filename)
        self.session = None
        self.input_name = None
        self.output_names = []
        self.load_session()

    def load_session(self):
        if os.path.exists(self.model_path):
            try:
                self.session = ort.InferenceSession(self.model_path, providers=['CPUExecutionProvider'])
                self.input_name = self.session.get_inputs()[0].name
                self.output_names = [o.name for o in self.session.get_outputs()]
                print(f"[ONNX ACTIVE] Loaded ONNX session: {self.model_path}")
            except Exception as e:
                print(f"[ERROR] Failed to load ONNX session {self.model_path}: {e}")
                self.session = None

    def is_active(self) -> bool:
        return self.session is not None

    def predict_text(self, text: str) -> dict:
        if not self.session:
            raise RuntimeError(f"ONNX Session not active for {self.model_path}")
            
        input_data = np.array([[text]], dtype=object)
        res = self.session.run(self.output_names, {self.input_name: input_data})
        
        predicted_label = str(res[0][0])
        probabilities = {}
        
        # If model outputs probabilities map / array
        if len(res) > 1 and isinstance(res[1], list) and len(res[1]) > 0:
            raw_prob = res[1][0]
            if isinstance(raw_prob, dict):
                probabilities = {str(k): float(v) for k, v in raw_prob.items()}
                
        confidence = probabilities.get(predicted_label, 0.95)
        return {
            "label": predicted_label,
            "confidence": round(float(confidence), 2),
            "probabilities": probabilities
        }

    def predict_features(self, feature_array: np.ndarray) -> float:
        if not self.session:
            raise RuntimeError(f"ONNX Session not active for {self.model_path}")
            
        input_data = feature_array.astype(np.float32)
        res = self.session.run(self.output_names, {self.input_name: input_data})
        raw_val = float(res[0][0])
        return raw_val
