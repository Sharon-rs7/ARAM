import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import StringTensorType, FloatTensorType
import onnxruntime as ort

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
SAVED_DIR = os.path.join(MODELS_DIR, "saved")

def export_text_pipeline(model_file, vec_file, out_onnx):
    model_path = os.path.join(MODELS_DIR, model_file)
    vec_path = os.path.join(MODELS_DIR, vec_file)
    
    if not os.path.exists(model_path):
        model_path = os.path.join(SAVED_DIR, model_file)
        vec_path = os.path.join(SAVED_DIR, vec_file)
        
    if not os.path.exists(model_path) or not os.path.exists(vec_path):
        print(f"[SKIP] Missing {model_file} or {vec_file}")
        return False
        
    clf = joblib.load(model_path)
    vec = joblib.load(vec_path)
    
    pipe = Pipeline([
        ('vectorizer', vec),
        ('classifier', clf)
    ])
    
    initial_type = [('string_input', StringTensorType([None, 1]))]
    onnx_model = convert_sklearn(pipe, initial_types=initial_type)
    
    out_path = os.path.join(MODELS_DIR, out_onnx)
    with open(out_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"[SUCCESS] Exported {out_onnx} pipeline.")
    return True

def export_ranking_model():
    model_path = os.path.join(MODELS_DIR, "volunteer_ranking_model.pkl")
    if not os.path.exists(model_path):
        return False
    rf = joblib.load(model_path)
    
    # 13 float features
    initial_type = [('float_input', FloatTensorType([None, 13]))]
    onnx_model = convert_sklearn(rf, initial_types=initial_type)
    
    out_path = os.path.join(MODELS_DIR, "volunteer_ranking_model.onnx")
    with open(out_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"[SUCCESS] Exported volunteer_ranking_model.onnx.")
    return True

if __name__ == "__main__":
    export_text_pipeline("category_model.pkl", "vectorizer.pkl", "category_model.onnx")
    export_text_pipeline("priority_model.pkl", "priority_vectorizer.pkl", "priority_model.onnx")
    export_text_pipeline("authority_model.pkl", "authority_vectorizer.pkl", "authority_model.onnx")
    export_text_pipeline("language_detector.pkl", "language_vectorizer.pkl", "language_detector.onnx")
    export_text_pipeline("complaint_classifier.pkl", "complaint_vectorizer.pkl", "complaint_classifier.onnx")
    export_text_pipeline("document_text_classifier.pkl", "document_text_vectorizer.pkl", "document_text_classifier.onnx")
    export_ranking_model()
