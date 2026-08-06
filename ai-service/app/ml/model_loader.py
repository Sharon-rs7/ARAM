import os
import json
import onnxruntime as ort
import joblib

class ModelLoader:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.models = {}
        self.metadata = {
            "version": "aram_ml_onnx_v1.0.0",
            "accuracy": 0.0,
            "trained_at": ""
        }
        self.load_all()

    def load_all(self):
        os.makedirs(self.models_dir, exist_ok=True)
        
        meta_path = os.path.join(self.models_dir, "model_metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"Error loading model_metadata.json: {e}")

        # Load ONNX sessions (excluding pickle-based models)
        model_names = [
            "category_model",
            "priority_model",
            "authority_model",
            "volunteer_ranking_model"
        ]

        for name in model_names:
            path = os.path.join(self.models_dir, f"{name}.onnx")
            if os.path.exists(path):
                try:
                    self.models[name] = ort.InferenceSession(path, providers=['CPUExecutionProvider'])
                    print(f"[ONNX LOADED] {name}.onnx successfully.")
                except Exception as e:
                    self.models[name] = None
                    print(f"Error loading {name}.onnx: {e}")
            else:
                self.models[name] = None
                print(f"ONNX Model file not found: {name}.onnx")

        # Load Pickle-based document model
        doc_path = os.path.join(self.models_dir, "document_model.pkl")
        if os.path.exists(doc_path):
            try:
                self.models["document_model"] = joblib.load(doc_path)
                print("[PKL LOADED] document_model.pkl successfully.")
            except Exception as e:
                self.models["document_model"] = None
                print(f"Error loading document_model.pkl: {e}")
        else:
            self.models["document_model"] = None
            print("Pickle Model file not found: document_model.pkl")

        # Load Pickle-based shared vectorizer
        vec_path = os.path.join(self.models_dir, "vectorizer.pkl")
        if os.path.exists(vec_path):
            try:
                self.models["vectorizer"] = joblib.load(vec_path)
                print("[PKL LOADED] vectorizer.pkl successfully.")
            except Exception as e:
                self.models["vectorizer"] = None
                print(f"Error loading vectorizer.pkl: {e}")
        else:
            self.models["vectorizer"] = None
            print("Pickle Vectorizer file not found: vectorizer.pkl")

    def get_model(self, name):
        return self.models.get(name)

    def is_available(self, name) -> bool:
        return self.models.get(name) is not None

    def get_version(self) -> str:
        return self.metadata.get("version", "aram_ml_onnx_v1.0.0")

ml_model_loader = ModelLoader()
