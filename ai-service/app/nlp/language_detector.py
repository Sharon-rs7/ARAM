from app.nlp.ml_language_detector import ml_language_detector

class LanguageDetectorWrapper:
    def detect(self, text: str) -> dict:
        return ml_language_detector.detect(text)

language_detector = LanguageDetectorWrapper()
