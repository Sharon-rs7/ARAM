import os
import joblib
from app.complaint_classifier import keyword_category

class CategoryClassifier:
    def __init__(self):
        self.model_path = "models/saved/complaint_classifier.pkl"
        self.encoder_path = "models/saved/complaint_label_encoder.pkl"
        self.vectorizer_path = "models/saved/complaint_vectorizer.pkl"
        self.model = None
        self.encoder = None
        self.vectorizer = None
        
        if os.path.exists(self.model_path) and os.path.exists(self.encoder_path) and os.path.exists(self.vectorizer_path):
            try:
                self.model = joblib.load(self.model_path)
                self.encoder = joblib.load(self.encoder_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                print("CategoryClassifier loaded trained ML models successfully.")
            except Exception as e:
                print(f"Error loading trained CategoryClassifier: {e}")

    def classify(self, text: str) -> dict:
        if not text or not text.strip():
            return {"category": "GENERAL_LEGAL_AID", "confidence": 1.0, "modelBased": False}

        # Try ML prediction
        if self.model and self.vectorizer and self.encoder:
            try:
                vec = self.vectorizer.transform([text])
                pred_encoded = self.model.predict(vec)[0]
                pred_category = self.encoder.inverse_transform([pred_encoded])[0]
                
                # Get probabilities
                probs = self.model.predict_proba(vec)[0]
                confidence = float(probs[pred_encoded])
                
                return {
                    "category": pred_category,
                    "confidence": round(confidence, 2),
                    "modelBased": True
                }
            except Exception as e:
                print(f"ML classification failed: {e}. Falling back to keywords.")
                
        # Keyword-based fallback
        fallback = keyword_category(text)
        return {
            "category": fallback,
            "confidence": 0.50,
            "modelBased": False
        }

category_classifier = CategoryClassifier()
