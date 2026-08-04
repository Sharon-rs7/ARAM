import os
import numpy as np
import onnxruntime as ort
from langdetect import detect

class LanguageDetector:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.onnx_path = os.path.join(self.models_dir, "language_detector.onnx")
        self.session = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.onnx_path):
            try:
                self.session = ort.InferenceSession(self.onnx_path, providers=['CPUExecutionProvider'])
                print("[ONNX LOADED] LanguageDetector session active.")
            except Exception as e:
                print(f"Error loading ONNX Language Detector: {e}")

    def detect_language(self, text: str) -> str:
        if not text or not text.strip():
            return "English"
            
        if self.session:
            try:
                input_name = self.session.get_inputs()[0].name
                output_names = [o.name for o in self.session.get_outputs()]
                res = self.session.run(output_names, {input_name: np.array([[text]], dtype=object)})
                return str(res[0][0])
            except Exception as e:
                print(f"ONNX Language detection failed: {e}")

        if any('\u0b80' <= char <= '\u0bff' for char in text):
            return "Tamil"
        if any('\u0900' <= char <= '\u097f' for char in text):
            return "Hindi"

        try:
            lang = detect(text)
            if lang == 'ta': return "Tamil"
            elif lang == 'hi': return "Hindi"
        except Exception:
            pass

        tanglish_keywords = ["ennoda", "panam", "sambalam", "romba", "veetu", "ketu", "pesuran", "kuduka", "tarala"]
        if any(w in text.lower() for w in tanglish_keywords):
            return "Tanglish"

        return "English"

language_detector = LanguageDetector()
