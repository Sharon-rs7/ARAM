import os
import joblib

class PriorityPredictor:
    def __init__(self):
        self.model_path = "models/saved/priority_model.pkl"
        self.encoder_path = "models/saved/priority_label_encoder.pkl"
        self.vectorizer_path = "models/saved/priority_vectorizer.pkl"
        self.model = None
        self.encoder = None
        self.vectorizer = None

        if os.path.exists(self.model_path) and os.path.exists(self.encoder_path) and os.path.exists(self.vectorizer_path):
            try:
                self.model = joblib.load(self.model_path)
                self.encoder = joblib.load(self.encoder_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                print("PriorityPredictor loaded trained ML models successfully.")
            except Exception as e:
                print(f"Error loading trained PriorityPredictor: {e}")

    def predict(self, text: str, category: str, is_sensitive: bool = False) -> dict:
        score = 30
        priority_label = "LOW"
        model_based = False

        if self.model and self.vectorizer and self.encoder:
            try:
                vec = self.vectorizer.transform([text])
                pred_encoded = self.model.predict(vec)[0]
                priority_label = self.encoder.inverse_transform([pred_encoded])[0]
                model_based = True
                
                # Determine score based on class probabilities
                probs = self.model.predict_proba(vec)[0]
                prob_idx = list(self.encoder.classes_).index(priority_label)
                confidence = probs[prob_idx]
                
                # Map classes to baseline scores
                score_map = {"CRITICAL": 92, "HIGH": 78, "MEDIUM": 55, "LOW": 30}
                score = score_map.get(priority_label, 30)
                
                # Add sensitivity boost if flagged
                if is_sensitive:
                    score = min(100, score + 15)
                    if score >= 90:
                        priority_label = "CRITICAL"
                    elif score >= 70:
                        priority_label = "HIGH"
            except Exception as e:
                print(f"ML priority prediction failed: {e}. Falling back to rules.")

        if not model_based:
            # Rule fallback
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
