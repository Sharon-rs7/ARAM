import os
import onnxruntime as ort
from app.config import settings

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.load_all()

    def load_all(self):
        model_dir = settings.MODEL_DIR
        
        def load_onnx(filename):
            path = os.path.join(model_dir, filename)
            if os.path.exists(path):
                try:
                    return ort.InferenceSession(path, providers=['CPUExecutionProvider'])
                except Exception as e:
                    print(f"Error loading ONNX {filename}: {e}")
            return None

        # ONNX sessions
        self.models["complaint_classifier"] = load_onnx("complaint_classifier.onnx")
        
        from app.ml.model_loader import ml_model_loader
        self.models["priority_model"] = ml_model_loader.get_model("priority_model") or load_onnx("priority_model.onnx")
        self.models["authority_model"] = ml_model_loader.get_model("authority_model") or load_onnx("authority_model.onnx")
        
        self.models["document_recommender"] = load_onnx("document_model.onnx")

    def is_model_missing(self, name) -> bool:
        if name == "complaint":
            return self.models.get("complaint_classifier") is None
        if name == "priority":
            return self.models.get("priority_model") is None
        if name == "authority":
            return self.models.get("authority_model") is None
        if name == "document":
            return self.models.get("document_recommender") is None
        return True

model_loader = ModelLoader()
