import os
import re
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
        if not text or not text.strip():
            return {
                "language": "en",
                "confidence": 0.0,
                "mixed": False,
                "script": "Latin",
                "method": "fallback",
                "topLanguages": [{"language": "en", "confidence": 0.0}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": True,
                "fallbackUsed": True
            }

        # Clean text of URLs, digits, punctuation for character analysis
        char_text = re.sub(r"https?://\S+|www\.\S+", "", text)
        char_text = re.sub(r"\d+", "", char_text)
        
        tamil_chars = 0
        devanagari_chars = 0
        latin_chars = 0
        total_letters = 0

        for char in char_text:
            val = ord(char)
            # Tamil block U+0B80–U+0BFF
            if 0x0B80 <= val <= 0x0BFF:
                tamil_chars += 1
                total_letters += 1
            # Devanagari block U+0900–U+097F
            elif 0x0900 <= val <= 0x097F:
                devanagari_chars += 1
                total_letters += 1
            elif ('a' <= char.lower() <= 'z'):
                latin_chars += 1
                total_letters += 1

        # Layer 1: Unicode script detection
        if tamil_chars > 0 or devanagari_chars > 0:
            if tamil_chars >= devanagari_chars:
                lang = "ta"
                script = "Tamil"
                native_count = tamil_chars
            else:
                lang = "hi"
                script = "Devanagari"
                native_count = devanagari_chars
            
            ratio = native_count / max(1, total_letters)
            mixed = latin_chars > 2  # If we have some Latin words mixed in
            
            confidence = max(0.95, ratio)
            
            return {
                "language": lang,
                "confidence": round(confidence, 3),
                "mixed": mixed,
                "script": script,
                "method": "unicode_script",
                "topLanguages": [{"language": lang, "confidence": round(confidence, 3)}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": confidence < 0.60,
                "fallbackUsed": False
            }

        # Layer 3: Latin script lexical & statistical classification
        cleaned = clean_text(text)
        words = set(cleaned.lower().split())

        tanglish_keywords = {
            "sambalam", "enaku", "ennoda", "tharala", "tarala", "kudukala", "maasam", "masam",
            "velai", "velay", "rendu", "moonu", "illai", "illa", "latcham", "prachanai", "prachana",
            "enaku", "romba", "nalla", "iruku", "panam", "nilam", "vivasayam", "yenna", "enna"
        }
        hinglish_keywords = {
            "mujhe", "mujhae", "nahi", "nahii", "nahee", "mili", "milee", "mahine", "maheene",
            "paisa", "kam", "ghar", "zamin", "jameen", "baki", "dikhkat", "shikayat", "thana",
            "malk", "maalk", "paise", "nhi", "nhii"
        }

        tanglish_hits = len(words.intersection(tanglish_keywords))
        hinglish_hits = len(words.intersection(hinglish_keywords))

        if tanglish_hits >= 2 and tanglish_hits > hinglish_hits:
            return {
                "language": "ta",
                "confidence": round(0.70 + (0.05 * min(5, tanglish_hits)), 3),
                "mixed": True,
                "script": "Latin",
                "method": "lexical_latin",
                "topLanguages": [{"language": "ta", "confidence": 0.85}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": False,
                "fallbackUsed": False
            }
        elif hinglish_hits >= 2 and hinglish_hits > tanglish_hits:
            return {
                "language": "hi",
                "confidence": round(0.70 + (0.05 * min(5, hinglish_hits)), 3),
                "mixed": True,
                "script": "Latin",
                "method": "lexical_latin",
                "topLanguages": [{"language": "hi", "confidence": 0.85}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": False,
                "fallbackUsed": False
            }

        # Fallback to statistical ONNX model session
        if self.session:
            try:
                input_name = self.session.get_inputs()[0].name
                output_names = [o.name for o in self.session.get_outputs()]
                res = self.session.run(output_names, {input_name: np.array([[cleaned]], dtype=object)})
                best_lang = str(res[0][0])
                
                if best_lang in ["ta-en", "tanglish"]:
                    best_lang = "ta"
                elif best_lang in ["hi-en", "hinglish"]:
                    best_lang = "hi"
                elif best_lang not in ["en", "ta", "hi"]:
                    best_lang = "en"
                
                top_langs = [{"language": best_lang, "confidence": 0.95}]
                if len(res) > 1 and isinstance(res[1], list) and len(res[1]) > 0:
                    raw_prob = res[1][0]
                    if isinstance(raw_prob, dict):
                        sorted_probs = sorted(raw_prob.items(), key=lambda x: x[1], reverse=True)
                        top_langs = []
                        for k, v in sorted_probs[:3]:
                            lang_code = k
                            if lang_code in ["ta-en", "tanglish"]: lang_code = "ta"
                            elif lang_code in ["hi-en", "hinglish"]: lang_code = "hi"
                            elif lang_code not in ["en", "ta", "hi"]: lang_code = "en"
                            top_langs.append({"language": lang_code, "confidence": round(float(v), 3)})

                confidence = top_langs[0]["confidence"]
                
                if len(words) <= 2:
                    confidence = 0.50

                return {
                    "language": best_lang,
                    "confidence": confidence,
                    "mixed": False,
                    "script": "Latin",
                    "method": "statistical_onnx",
                    "topLanguages": top_langs,
                    "modelVersion": "lang-detector-onnx-v1",
                    "manualReviewRequired": confidence < 0.70,
                    "fallbackUsed": False
                }
            except Exception as e:
                print(f"ONNX language detection inference error: {e}")

        # Lexical matching single word fallbacks
        if "help" in words or "problem" in words or "complaint" in words:
            return {
                "language": "en",
                "confidence": 0.60,
                "mixed": False,
                "script": "Latin",
                "method": "lexical_fallback",
                "topLanguages": [{"language": "en", "confidence": 0.60}],
                "modelVersion": "lang-detector-onnx-v1",
                "manualReviewRequired": True,
                "fallbackUsed": False
            }

        return {
            "language": "en",
            "confidence": 0.40,
            "mixed": False,
            "script": "Latin",
            "method": "lexical_fallback",
            "topLanguages": [{"language": "en", "confidence": 0.40}],
            "modelVersion": "lang-detector-onnx-v1",
            "manualReviewRequired": True,
            "fallbackUsed": True
        }

ml_language_detector = MLLanguageDetector()
