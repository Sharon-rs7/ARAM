import os
import numpy as np
import onnxruntime as ort
from app.ml.text_preprocessor import clean_text

class MLLanguageDetector:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.onnx_path = os.path.join(self.models_dir, "language_detector.onnx")
        self.session = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.onnx_path):
            try:
                self.session = ort.InferenceSession(self.onnx_path, providers=['CPUExecutionProvider'])
                print("[ONNX LOADED] ML Language Detector session active.")
            except Exception as e:
                print(f"Error loading ONNX Language Detector: {e}")

    def detect(self, text: str) -> dict:
        if not self.session or not text or not text.strip():
            return {
                "language": "en",
                "confidence": 0.0,
                "topLanguages": [{"language": "en", "confidence": 0.0}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": True,
                "fallbackUsed": True
            }

        try:
            cleaned = clean_text(text)
            input_name = self.session.get_inputs()[0].name
            output_names = [o.name for o in self.session.get_outputs()]
            
            res = self.session.run(output_names, {input_name: np.array([[cleaned]], dtype=object)})
            best_lang = str(res[0][0])
            
            top_langs = [{"language": best_lang, "confidence": 0.95}]
            if len(res) > 1 and isinstance(res[1], list) and len(res[1]) > 0:
                raw_prob = res[1][0]
                if isinstance(raw_prob, dict):
                    sorted_probs = sorted(raw_prob.items(), key=lambda x: x[1], reverse=True)
                    top_langs = [{"language": str(k), "confidence": round(float(v), 3)} for k, v in sorted_probs[:3]]

            confidence = top_langs[0]["confidence"]
            manual_review = confidence < 0.70

            return {
                "language": best_lang,
                "confidence": confidence,
                "topLanguages": top_langs,
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": manual_review,
                "fallbackUsed": False
            }
        except Exception as e:
            print(f"Error in ONNX language detection: {e}")
            return {
                "language": "en",
                "confidence": 0.0,
                "topLanguages": [{"language": "en", "confidence": 0.0}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": True,
                "fallbackUsed": True
            }

ml_language_detector = MLLanguageDetector()
