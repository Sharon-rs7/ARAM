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
from app.ml.text_preprocessor import clean_text

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")

def train_and_export_category_onnx():
    path = os.path.join(DATASETS_DIR, "legal_complaints_multilingual.csv")
    if not os.path.exists(path): return False
    df = pd.read_csv(path)
    df["cleaned"] = df["complaint_text"].fillna("").apply(clean_text)
    
    vec = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    clf = LogisticRegression(max_iter=1000, C=1.0)
    
    pipe = Pipeline([
        ('vectorizer', vec),
        ('classifier', clf)
    ])
    pipe.fit(df["cleaned"], df["category"].fillna("OTHER"))
    
    # Save .pkl files for backward compatibility
    joblib.dump(clf, os.path.join(MODELS_DIR, "category_model.pkl"))
    joblib.dump(vec, os.path.join(MODELS_DIR, "vectorizer.pkl"))
    joblib.dump(pipe, os.path.join(MODELS_DIR, "category_pipeline.pkl"))
    
    onnx_model = convert_sklearn(pipe, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "category_model.onnx"), "wb") as f:
        f.write(onnx_model.SerializeToString())
    print("[SUCCESS] Trained & Exported category_model.onnx and category_model.pkl")

def train_and_export_priority_onnx():
    path = os.path.join(DATASETS_DIR, "priority_training.csv")
    if not os.path.exists(path): return False
    df = pd.read_csv(path)
    text_col = "complaint_text" if "complaint_text" in df.columns else "text"
    df["cleaned"] = df[text_col].fillna("").apply(clean_text)
    
    vec = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    clf = LogisticRegression(max_iter=1000, C=1.0)
    
    pipe = Pipeline([
        ('vectorizer', vec),
        ('classifier', clf)
    ])
    pipe.fit(df["cleaned"], df["priority_label"].fillna("MEDIUM"))
    
    joblib.dump(clf, os.path.join(MODELS_DIR, "priority_model.pkl"))
    joblib.dump(vec, os.path.join(MODELS_DIR, "priority_vectorizer.pkl"))
    
    onnx_model = convert_sklearn(pipe, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "priority_model.onnx"), "wb") as f:
        f.write(onnx_model.SerializeToString())
    print("[SUCCESS] Trained & Exported priority_model.onnx and priority_model.pkl")

def train_and_export_language_onnx():
    path = os.path.join(DATASETS_DIR, "language_detection_training.csv")
    if not os.path.exists(path): return False
    df = pd.read_csv(path)
    df["cleaned"] = df["text"].fillna("").apply(clean_text)
    
    vec = TfidfVectorizer(max_features=5000, analyzer='char', ngram_range=(2, 4))
    clf = LogisticRegression(max_iter=1000, C=1.0)
    
    pipe = Pipeline([
        ('vectorizer', vec),
        ('classifier', clf)
    ])
    lang_col = "language_code" if "language_code" in df.columns else "language"
    pipe.fit(df["cleaned"], df[lang_col].fillna("en"))
    
    joblib.dump(clf, os.path.join(MODELS_DIR, "language_detector.pkl"))
    joblib.dump(vec, os.path.join(MODELS_DIR, "language_vectorizer.pkl"))
    
    onnx_model = convert_sklearn(pipe, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "language_detector.onnx"), "wb") as f:
        f.write(onnx_model.SerializeToString())
    print("[SUCCESS] Trained & Exported language_detector.onnx and language_detector.pkl")

def train_and_export_doc_text_onnx():
    doc_data = [
        ("Salary payslip wage statement month of July total salary 45000 rupees employer earnings", "Salary Slip"),
        ("Monthly payslip wage breakdown basic pay hra bonus deduction Net pay", "Salary Slip"),
        ("Bank account statement transaction debit credit balance passbook branch IFSC", "Bank Statement"),
        ("State Bank of India account balance transaction statement withdrawal transfer", "Bank Statement"),
        ("Rent agreement lease tenant landlord monthly rent deposit clause premises vacate", "Rent Agreement"),
        ("Medical report patient doctor hospital diagnosis treatment prescription injury", "Medical Report"),
        ("Police Station FIR complaint report stolen theft assault crime officer investigation", "Police Complaint / FIR Copy"),
        ("Aadhaar card identity proof government of india uidai pan card voter id", "Aadhaar / ID Proof"),
        ("Screenshot whatsapp chat message conversation screen capture photo evidence", "Screenshot Evidence"),
        ("Tax Invoice bill total amount GSTIN seller buyer receipt payment", "Consumer Bill / Invoice"),
        ("Property sale deed patta land survey boundaries plot ownership registrar", "Property Document")
    ]
    texts, labels = zip(*doc_data)
    cleaned_texts = [clean_text(t) for t in texts]

    pipe = Pipeline([
        ('vectorizer', TfidfVectorizer(max_features=3000, ngram_range=(1, 2))),
        ('classifier', LogisticRegression(max_iter=1000, C=1.0))
    ])
    pipe.fit(cleaned_texts, labels)

    onnx_model = convert_sklearn(pipe, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "document_text_classifier.onnx"), "wb") as f:
        f.write(onnx_model.SerializeToString())
    print("[SUCCESS] Trained & Exported document_text_classifier.onnx on document types")

def train_and_export_ranking_onnx():
    np.random.seed(42)
    n_samples = 500
    cat_match = np.random.choice([0, 1], n_samples)
    lang_match = np.random.choice([0, 1], n_samples)
    dist_match = np.random.choice([0, 1], n_samples)
    workload = np.random.randint(0, 10, n_samples)
    capacity = np.random.randint(5, 20, n_samples)
    exp_years = np.random.randint(0, 15, n_samples)
    avg_resp = np.random.uniform(1, 48, n_samples)
    success = np.random.uniform(0.5, 1.0, n_samples)
    trained = np.random.choice([0, 1], n_samples)
    gender_match = np.random.choice([0, 1], n_samples)
    sensitive = np.random.choice([0, 1], n_samples)
    past_cases = workload * 3 + np.random.randint(0, 20, n_samples)
    available = np.random.choice([0, 1], n_samples)

    X = np.column_stack([cat_match, lang_match, dist_match, workload, capacity, exp_years, avg_resp, success, trained, gender_match, sensitive, past_cases, available]).astype(np.float32)
    y = (cat_match * 35 + lang_match * 25 + dist_match * 15 + success * 15 + trained * 10 - (workload / capacity) * 10).astype(np.float32)

    rf = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    rf.fit(X, y)

    joblib.dump(rf, os.path.join(MODELS_DIR, "volunteer_ranking_model.pkl"))

    onnx_model = convert_sklearn(rf, initial_types=[('float_input', FloatTensorType([None, 13]))])
    with open(os.path.join(MODELS_DIR, "volunteer_ranking_model.onnx"), "wb") as f:
        f.write(onnx_model.SerializeToString())
    print("[SUCCESS] Trained & Exported volunteer_ranking_model.onnx and volunteer_ranking_model.pkl")

if __name__ == "__main__":
    train_and_export_category_onnx()
    train_and_export_priority_onnx()
    train_and_export_language_onnx()
    train_and_export_doc_text_onnx()
    train_and_export_ranking_onnx()
