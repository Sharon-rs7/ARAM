import os
import sys
import io
import joblib
import numpy as np
import onnxruntime as ort

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml.text_preprocessor import clean_text

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
SAVED_DIR = os.path.join(MODELS_DIR, "saved")

def compare_category_models():
    print("\n--- 1. CATEGORY CLASSIFIER COMPARISON ---")
    sample_text = "Factory manager has not paid my salary for 3 months."
    cleaned = clean_text(sample_text)

    # A. PKL Model
    pkl_model_path = os.path.join(SAVED_DIR, "complaint_classifier.pkl")
    pkl_vec_path = os.path.join(SAVED_DIR, "complaint_vectorizer.pkl")
    pkl_enc_path = os.path.join(SAVED_DIR, "complaint_label_encoder.pkl")
    
    if os.path.exists(pkl_model_path) and os.path.exists(pkl_vec_path) and os.path.exists(pkl_enc_path):
        clf = joblib.load(pkl_model_path)
        vec = joblib.load(pkl_vec_path)
        enc = joblib.load(pkl_enc_path)
        
        feat = vec.transform([cleaned])
        pred_enc = clf.predict(feat)[0]
        pred_label = enc.inverse_transform([pred_enc])[0]
        probs = clf.predict_proba(feat)[0]
        conf = probs[pred_enc]
        print(f"PKL Prediction: label='{pred_label}', confidence={conf:.4f}")
    else:
        print("PKL model files not found in saved/")

    # B. ONNX Model
    onnx_path = os.path.join(MODELS_DIR, "category_model.onnx")
    if os.path.exists(onnx_path):
        sess = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
        input_name = sess.get_inputs()[0].name
        output_names = [o.name for o in sess.get_outputs()]
        res = sess.run(output_names, {input_name: np.array([[sample_text]], dtype=object)})
        onnx_label = str(res[0][0])
        onnx_probs = res[1][0] if len(res) > 1 else {}
        onnx_conf = onnx_probs.get(onnx_label, 0.0) if isinstance(onnx_probs, dict) else 0.0
        print(f"ONNX Prediction: label='{onnx_label}', confidence={onnx_conf:.4f}")

def compare_doc_models():
    print("\n--- 2. DOCUMENT CLASSIFIER COMPARISON ---")
    ocr_text = "Salary payslip wage statement month of July total salary 45000 rupees"
    cleaned = clean_text(ocr_text)

    # A. PKL Model
    pkl_model_path = os.path.join(MODELS_DIR, "document_text_classifier.pkl")
    pkl_vec_path = os.path.join(MODELS_DIR, "document_text_vectorizer.pkl")
    
    if os.path.exists(pkl_model_path) and os.path.exists(pkl_vec_path):
        clf = joblib.load(pkl_model_path)
        vec = joblib.load(pkl_vec_path)
        feat = vec.transform([cleaned])
        pred_label = str(clf.predict(feat)[0])
        probs = clf.predict_proba(feat)[0]
        max_idx = np.argmax(probs)
        conf = probs[max_idx]
        print(f"PKL Prediction: label='{pred_label}', confidence={conf:.4f}")
    else:
        print("PKL document classifier not found in models/")

    # B. ONNX Model
    onnx_path = os.path.join(MODELS_DIR, "document_text_classifier.onnx")
    if os.path.exists(onnx_path):
        sess = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
        input_name = sess.get_inputs()[0].name
        output_names = [o.name for o in sess.get_outputs()]
        res = sess.run(output_names, {input_name: np.array([[ocr_text]], dtype=object)})
        onnx_label = str(res[0][0])
        onnx_probs = res[1][0] if len(res) > 1 else {}
        onnx_conf = onnx_probs.get(onnx_label, 0.0) if isinstance(onnx_probs, dict) else 0.0
        print(f"ONNX Prediction: label='{onnx_label}', confidence={onnx_conf:.4f}")

if __name__ == "__main__":
    compare_category_models()
    compare_doc_models()
