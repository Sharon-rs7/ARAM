import os
import json
import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
AUDIT_LOG_PATH = os.path.join(MODELS_DIR, "retrain_audit_log.json")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "legal_complaints_multilingual.csv")

def run_retrain_validation_gate():
    print("\n==================================================")
    print("RUNNING RETRAINING VALIDATION GATE")
    print("==================================================")
    
    # Load dataset
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset file not found at {DATASET_PATH}")
        return False
        
    df = pd.read_csv(DATASET_PATH)
    if "complaint_text" not in df.columns or "category" not in df.columns:
        print("[ERROR] Dataset missing complaint_text or category columns")
        return False
        
    X = df["complaint_text"].fillna("")
    y = df["category"].fillna("OTHER")
    
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 1. Evaluate Current Production Model (if exists)
    prod_model_path = os.path.join(MODELS_DIR, "category_model.pkl")
    prod_vec_path = os.path.join(MODELS_DIR, "category_vectorizer.pkl")
    
    current_f1 = 0.0
    current_acc = 0.0
    
    if os.path.exists(prod_model_path) and os.path.exists(prod_vec_path):
        try:
            prod_model = joblib.load(prod_model_path)
            prod_vec = joblib.load(prod_vec_path)
            X_val_vec = prod_vec.transform(X_val)
            y_pred_prod = prod_model.predict(X_val_vec)
            current_f1 = float(f1_score(y_val, y_pred_prod, average="weighted"))
            current_acc = float(accuracy_score(y_val, y_pred_prod))
            print(f"[CURRENT PROD MODEL] Accuracy: {current_acc:.4f} | F1: {current_f1:.4f}")
        except Exception as e:
            print(f"[WARN] Could not evaluate existing prod model: {e}")
    else:
        print("[INFO] No existing prod model found. Initial training baseline.")

    # 2. Train Candidate Model
    candidate_vec = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = candidate_vec.fit_transform(X_train)
    X_val_candidate_vec = candidate_vec.transform(X_val)
    
    candidate_model = LogisticRegression(max_iter=1000, C=1.0)
    candidate_model.fit(X_train_vec, y_train)
    
    y_pred_cand = candidate_model.predict(X_val_candidate_vec)
    candidate_f1 = float(f1_score(y_val, y_pred_cand, average="weighted"))
    candidate_acc = float(accuracy_score(y_val, y_pred_cand))
    
    print(f"[CANDIDATE MODEL]    Accuracy: {candidate_acc:.4f} | F1: {candidate_f1:.4f}")
    
    # 3. Decision Gate Logic
    # Must meet or exceed baseline (allowing max 0.5% tolerance for small variance)
    decision = "REJECTED"
    reason = f"Candidate F1 ({candidate_f1:.4f}) did not beat current baseline F1 ({current_f1:.4f})"
    
    if current_f1 == 0.0 or candidate_f1 >= (current_f1 - 0.005):
        decision = "APPROVED"
        reason = f"Candidate model passed validation gate. F1 ({candidate_f1:.4f}) >= Current F1 ({current_f1:.4f})"
        
        # Save updated models
        joblib.dump(candidate_model, prod_model_path)
        joblib.dump(candidate_vec, prod_vec_path)
        print(f"[SUCCESS] Candidate model APPROVED and deployed to {prod_model_path}")
    else:
        print(f"[BLOCKED] Candidate model REJECTED. Production model retained.")
        
    # 4. Audit Log Entry
    audit_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "current_prod_f1": current_f1,
        "current_prod_acc": current_acc,
        "candidate_f1": candidate_f1,
        "candidate_acc": candidate_acc,
        "decision": decision,
        "reason": reason
    }
    
    audit_logs = []
    if os.path.exists(AUDIT_LOG_PATH):
        try:
            with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
                audit_logs = json.load(f)
        except Exception:
            audit_logs = []
            
    audit_logs.append(audit_entry)
    with open(AUDIT_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(audit_logs, f, indent=2)
        
    print(f"[AUDIT LOGGED] Saved to {AUDIT_LOG_PATH}")
    print("==================================================\n")
    return decision == "APPROVED"

if __name__ == "__main__":
    run_retrain_validation_gate()
