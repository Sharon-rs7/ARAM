import os
import joblib
from langdetect import detect

# Mocks or Simple ML Language detector
class LanguageDetector:
    def __init__(self):
        self.model_path = "models/saved/language_detector.pkl"
        self.vectorizer_path = "models/saved/language_vectorizer.pkl"
        self.model = None
        self.vectorizer = None
        
        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            try:
                self.model = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
            except Exception as e:
                print(f"Error loading Language Detector: {e}")

    def detect_language(self, text: str) -> str:
        if not text or not text.strip():
            return "English"
            
        # Try model prediction first
        if self.model and self.vectorizer:
            try:
                vec = self.vectorizer.transform([text])
                pred = self.model.predict(vec)[0]
                return pred
            except Exception as e:
                print(f"ML Language detection failed: {e}")

        # Fallback 1: Script character detection
        # If text contains Tamil letters
        if any('\u0b80' <= char <= '\u0bff' for char in text):
            return "Tamil"
        # If text contains Devanagari letters (Hindi)
        if any('\u0900' <= char <= '\u097f' for char in text):
            return "Hindi"

        # Fallback 2: langdetect library
        try:
            lang = detect(text)
            if lang == 'ta':
                return "Tamil"
            elif lang == 'hi':
                return "Hindi"
        except Exception:
            pass

        # Fallback 3: Tanglish check (Latin letters, but contains colloquial Tamil words)
        tanglish_keywords = ["ennoda", "panam", "sambalam", "romba", "veetu", "ketu", "pesuran", "kuduka", "tarala"]
        if any(w in text.lower() for w in tanglish_keywords):
            return "Tanglish"

        return "English"

language_detector = LanguageDetector()
