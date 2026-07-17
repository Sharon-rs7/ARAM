import os
import joblib
from app.config import settings

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.load_all()

    def load_all(self):
        model_dir = settings.MODEL_DIR
        
        # Helper to load a pickle safely
        def load_pkl(filename):
            path = os.path.join(model_dir, filename)
            if os.path.exists(path):
                try:
                    return joblib.load(path)
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
            return None

        # 1. Complaint classifier
        self.models["complaint_classifier"] = load_pkl("complaint_classifier.pkl")
        self.models["complaint_label_encoder"] = load_pkl("complaint_label_encoder.pkl")
        self.models["complaint_vectorizer"] = load_pkl("complaint_vectorizer.pkl")

        # 2. Priority model
        self.models["priority_model"] = load_pkl("priority_model.pkl")
        self.models["priority_regressor"] = load_pkl("priority_regressor.pkl")
        self.models["priority_label_encoder"] = load_pkl("priority_label_encoder.pkl")
        self.models["priority_vectorizer"] = load_pkl("priority_vectorizer.pkl")

        # 3. Authority recommender
        self.models["authority_model"] = load_pkl("authority_model.pkl")
        self.models["authority_label_encoder"] = load_pkl("authority_label_encoder.pkl")
        self.models["authority_metadata_encoder"] = load_pkl("authority_metadata_encoder.pkl")
        self.models["authority_vectorizer"] = load_pkl("authority_vectorizer.pkl")

        # 4. Document recommender
        self.models["document_recommender"] = load_pkl("document_recommender.pkl")
        self.models["document_label_binarizer"] = load_pkl("document_label_binarizer.pkl")
        self.models["document_metadata_encoder"] = load_pkl("document_metadata_encoder.pkl")
        self.models["document_vectorizer"] = load_pkl("document_vectorizer.pkl")

        # 5. Chatbot retriever
        self.models["chatbot_retriever"] = load_pkl("chatbot_retriever.pkl")

    def is_model_missing(self, name) -> bool:
        if name == "complaint":
            return not (self.models["complaint_classifier"] and self.models["complaint_label_encoder"])
        if name == "priority":
            return not (self.models["priority_model"] and self.models["priority_label_encoder"] and self.models["priority_vectorizer"])
        if name == "authority":
            return not (self.models["authority_model"] and self.models["authority_label_encoder"] and self.models["authority_vectorizer"])
        if name == "document":
            return not (self.models["document_recommender"] and self.models["document_label_binarizer"] and self.models["document_vectorizer"])
        if name == "chatbot":
            return not self.models["chatbot_retriever"]
        return True

model_loader = ModelLoader()
