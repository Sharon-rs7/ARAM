import os
import numpy as np
try:
    import onnxruntime as ort
except Exception:
    ort = None
from app.ml.text_preprocessor import clean_text

class DocumentClassifier:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        self.onnx_path = os.path.join(self.models_dir, "document_text_classifier.onnx")
        self.session = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.onnx_path):
            try:
                self.session = ort.InferenceSession(self.onnx_path, providers=['CPUExecutionProvider'])
                print("[ONNX LOADED] Document Text Classifier session active.")
            except Exception as e:
                print(f"Error loading ONNX document text classifier: {e}")

    def classify(self, ocr_text: str) -> dict:
        if not ocr_text or not ocr_text.strip():
            return {
                "documentType": "General Supporting Document",
                "confidence": 0.0,
                "topTypes": [{"documentType": "General Supporting Document", "probability": 1.0}]
            }

        cleaned = clean_text(ocr_text)

        # Attempt ONNX Text Classification
        if self.session:
            try:
                input_name = self.session.get_inputs()[0].name
                output_names = [o.name for o in self.session.get_outputs()]
                
                res = self.session.run(output_names, {input_name: np.array([[cleaned]], dtype=object)})
                pred_label = str(res[0][0])
                
                top_types = [{"documentType": pred_label, "probability": 0.90}]
                if len(res) > 1 and isinstance(res[1], list) and len(res[1]) > 0:
                    raw_prob = res[1][0]
                    if isinstance(raw_prob, dict):
                        sorted_probs = sorted(raw_prob.items(), key=lambda x: x[1], reverse=True)
                        top_types = [{"documentType": str(k), "probability": round(float(v), 3)} for k, v in sorted_probs[:3]]
                        
                confidence = top_types[0]["probability"]
                if confidence < 0.65:
                    pred_label = "General Supporting Document"
                    
                return {
                    "documentType": pred_label,
                    "confidence": confidence,
                    "topTypes": top_types
                }
            except Exception as e:
                print(f"ONNX document classification failed: {e}. Falling back to keywords.")

        # Keyword Heuristics Fallback
        lower_text = cleaned.lower()
        heuristics = {
            "Salary Slip": ["salary", "payslip", "wage", "pay slip", "employer", "sambalam"],
            "Bank Statement": ["bank", "statement", "account", "transaction", "debit", "credit"],
            "Rent Agreement": ["tenant", "landlord", "rent", "agreement", "lease", "vacate"],
            "Medical Report": ["patient", "doctor", "hospital", "diagnosis", "treatment", "neglegence"],
            "Police Complaint / FIR Copy": ["police", "fir", "complaint", "stolen", "theft", "station"],
            "Aadhaar / ID Proof": ["aadhaar", "uidai", "government of india", "pan card", "identity card"],
            "Screenshot Evidence": ["screenshot", "screen capture", "whatsapp", "chat", "message"],
            "Consumer Bill / Invoice": ["invoice", "bill", "gstin", "total amount", "receipt", "seller"],
            "Property Document": ["property", "sale deed", "patta", "survey", "boundaries"]
        }

        best_type = "General Supporting Document"
        max_matches = 0
        
        for doc_type, keywords in heuristics.items():
            matches = sum(1 for kw in keywords if kw in lower_text)
            if matches > max_matches:
                max_matches = matches
                best_type = doc_type

        conf = 0.50 if max_matches > 0 else 0.30
        return {
            "documentType": best_type,
            "confidence": conf,
            "topTypes": [{"documentType": best_type, "probability": conf}]
        }

document_classifier = DocumentClassifier()
