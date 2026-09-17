import os
import sys
import json
import datetime
import joblib
import pandas as pd
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import StringTensorType, FloatTensorType
from app.ml.text_preprocessor import clean_text

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def map_product_to_category(product):
    p = str(product).lower()
    # Direct, supported mappings
    banking_keywords = ["bank", "checking", "savings", "credit card", "prepaid card", "money transfer", "virtual currency"]
    for k in banking_keywords:
        if k in p:
            return "BANKING_DISPUTE"
            
    consumer_keywords = ["mortgage", "loan", "lease", "debt collection", "credit reporting", "credit repair", "payday"]
    for k in consumer_keywords:
        if k in p:
            return "CONSUMER_COMPLAINT"
            
    return None

def train_category_classifier():
    print("=== Training Category Classifier on Real CFPB Data ===")
    from datasets import load_dataset
    import time
    
    # 1. Load real dataset with retries
    print("Loading claritystorm/cfpb-consumer-complaints from HF...")
    ds = None
    for attempt in range(5):
        try:
            ds = load_dataset("claritystorm/cfpb-consumer-complaints", split="train", streaming=True)
            break
        except Exception as e:
            print(f"HF load attempt {attempt+1} failed: {e}. Retrying in 3s...")
            time.sleep(3)
            
    if ds is None:
        print("[FATAL] Could not load dataset from HF due to persistent connection failures.")
        sys.exit(1)
    
    records = []
    for row in ds:
        narrative = row.get("consumer_narrative")
        product = row.get("product")
        cid = row.get("complaint_id")
        
        if narrative and str(narrative).strip() and str(narrative).lower() != "none" and product:
            category = map_product_to_category(product)
            if category:
                records.append({
                    "text": clean_text(narrative),
                    "category": category,
                    "source_dataset": "claritystorm/cfpb-consumer-complaints",
                    "source_record_id": str(cid)
                })
            # Collect 1000 records to train quickly in local CPU dev/test environment
            if len(records) >= 1000:
                break
                
    df = pd.DataFrame(records)
    print(f"Loaded {len(df)} mapped records.")
    
    # Deduplicate to prevent train/test leakage
    df = df.drop_duplicates(subset=["text"])
    print(f"Deduplicated count: {len(df)}")
    
    # 2. Stratified Train/Val/Test Split (70/15/15)
    X = df["text"].astype(str).tolist()
    y = df["category"].astype(str).tolist()
    
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    print(f"Split sizes - Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    
    # 3. Train Pipeline
    vec = TfidfVectorizer(max_features=3000, ngram_range=(1, 2))
    clf = LogisticRegression(max_iter=1000, C=1.0)
    
    pipe = Pipeline([
        ('vectorizer', vec),
        ('classifier', clf)
    ])
    pipe.fit(X_train, y_train)
    
    # 4. Evaluate on Test Set
    y_pred = pipe.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro')
    _, _, micro_f1, _ = precision_recall_fscore_support(y_test, y_pred, average='micro')
    
    cm = confusion_matrix(y_test, y_pred)
    classes = list(pipe.classes_)
    
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {acc:.4f}")
    print(f"Macro F1: {f1:.4f}")
    print(f"Micro F1: {micro_f1:.4f}")
    
    # 5. Export to ONNX
    onnx_model = convert_sklearn(pipe, initial_types=[('string_input', StringTensorType([None, 1]))])
    onnx_path = os.path.join(MODELS_DIR, "category_model.onnx")
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"Saved category classifier ONNX to {onnx_path}")
    
    # 6. Save model metadata
    all_categories = [
        "LABOUR_DISPUTE", "CONSUMER_COMPLAINT", "CYBER_CRIME", "PROPERTY_DISPUTE",
        "WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "FAMILY_DISPUTE",
        "GOVERNMENT_SCHEME", "GENERAL_LEGAL_AID", "MOTOR_ACCIDENT_CLAIM", "INSURANCE_CLAIM",
        "BANKING_DISPUTE", "RENT_TENANT_DISPUTE", "MEDICAL_NEGLIGENCE", "EDUCATION_DISPUTE",
        "WORKPLACE_HARASSMENT", "SENIOR_CITIZEN_ABUSE", "CHILD_WELFARE", "DISABILITY_RIGHTS",
        "CASTE_DISCRIMINATION", "POLICE_MISCONDUCT", "CORRUPTION_BRIBERY", "CIVIC_INFRASTRUCTURE",
        "RTI_APPLICATION"
    ]
    trained_cats = ["CONSUMER_COMPLAINT", "BANKING_DISPUTE"]
    data_req_cats = [c for c in all_categories if c not in trained_cats]
    
    metadata = {
        "dataset_sources": {
            "SHULAMITSHARABANI/consumer-complaints-pro": "UNSUITABLE_FOR_SUPERVISED_COMPLAINT_TRAINING (Tokenization error)",
            "opennyaiorg/InJudgements_dataset": "UNSUITABLE_FOR_SUPERVISED_COMPLAINT_TRAINING (Gated dataset, authentication required)",
            "claritystorm/cfpb-consumer-complaints": "Public domain (US Consumer Complaint Narrative data)"
        },
        "licenses": {
            "claritystorm/cfpb-consumer-complaints": "CC0: Public Domain"
        },
        "actual_training_row_count": len(X_train),
        "categories_genuinely_trained": trained_cats,
        "categories_marked_DATA_REQUIRED": data_req_cats,
        "split_counts": {
            "train": len(X_train),
            "validation": len(X_val),
            "test": len(X_test)
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "macro_precision": round(precision, 4),
            "macro_recall": round(recall, 4),
            "macro_f1": round(f1, 4),
            "micro_f1": round(micro_f1, 4),
            "confusion_matrix": cm.tolist(),
            "classes": classes
        },
        "model_version": "ARAM_RAG_ML_V2.0.0",
        "training_timestamp": datetime.datetime.now().isoformat(),
        "priority_status": "DATA_REQUIRED",
        "complexity_status": "DATA_REQUIRED",
        "authority_status": "DATA_REQUIRED"
    }
    
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f"Saved training metadata configuration to {meta_path}")

def export_placeholders_for_loaders():
    print("=== Creating Placeholder ONNX Files for Application Loader Compatibility ===")
    
    # 1. Priority model placeholder
    vec_p = TfidfVectorizer()
    clf_p = LogisticRegression()
    pipe_p = Pipeline([('vectorizer', vec_p), ('classifier', clf_p)])
    pipe_p.fit(["dummy priority text 1", "dummy priority text 2"], ["LOW", "HIGH"])
    
    onnx_p = convert_sklearn(pipe_p, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "priority_model.onnx"), "wb") as f:
        f.write(onnx_p.SerializeToString())
        
    # 2. Authority model placeholder
    vec_a = TfidfVectorizer()
    clf_a = LogisticRegression()
    pipe_a = Pipeline([('vectorizer', vec_a), ('classifier', clf_a)])
    pipe_a.fit(["dummy authority text 1", "dummy authority text 2"], ["DLSA", "POLICE"])
    
    onnx_a = convert_sklearn(pipe_a, initial_types=[('string_input', StringTensorType([None, 1]))])
    with open(os.path.join(MODELS_DIR, "authority_model.onnx"), "wb") as f:
        f.write(onnx_a.SerializeToString())
        
    # 3. Volunteer ranking placeholder (takes float input)
    X_rank = np.zeros((1, 13), dtype=np.float32)
    y_rank = np.array([50.0], dtype=np.float32)
    
    from sklearn.ensemble import RandomForestRegressor
    rf = RandomForestRegressor(n_estimators=1, max_depth=1)
    rf.fit(X_rank, y_rank)
    
    onnx_rank = convert_sklearn(rf, initial_types=[('float_input', FloatTensorType([None, 13]))])
    with open(os.path.join(MODELS_DIR, "volunteer_ranking_model.onnx"), "wb") as f:
        f.write(onnx_rank.SerializeToString())
        
    print("Placeholder ONNX models exported successfully.")

if __name__ == "__main__":
    train_category_classifier()
    export_placeholders_for_loaders()
