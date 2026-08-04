import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import joblib
from datetime import datetime
import pandas as pd
from sklearn.metrics import accuracy_score

def main():
    print("--- Evaluating All ML Models ---")
    
    models_dir = "models"
    metadata_path = os.path.join(models_dir, "model_metadata.json")
    vectorizer_path = os.path.join(models_dir, "vectorizer.pkl")
    
    if not os.path.exists(vectorizer_path):
        print("Error: vectorizer.pkl is missing. Please train category model first.")
        return

    vectorizer = joblib.load(vectorizer_path)
    metadata = {
        "version": "aram_ml_v1.0.0",
        "trained_at": datetime.now().isoformat(),
        "metrics": {}
    }
    
    # 1. Category model evaluation
    cat_model_path = os.path.join(models_dir, "category_model.pkl")
    cat_data_path = "datasets/legal_complaints_multilingual.csv"
    if os.path.exists(cat_model_path) and os.path.exists(cat_data_path):
        clf = joblib.load(cat_model_path)
        df = pd.read_csv(cat_data_path)
        X = df["complaint_text"].fillna("").tolist()
        y = df["category"].tolist()
        
        preds = clf.predict(vectorizer.transform(X))
        acc = accuracy_score(y, preds)
        metadata["metrics"]["category_accuracy"] = round(acc, 4)
        print(f"Category Model Accuracy: {acc:.4f}")
        
    # 2. Priority model evaluation
    prio_model_path = os.path.join(models_dir, "priority_model.pkl")
    prio_data_path = "datasets/priority_training.csv"
    if os.path.exists(prio_model_path) and os.path.exists(prio_data_path):
        clf = joblib.load(prio_model_path)
        df = pd.read_csv(prio_data_path)
        X = df["complaint_text"].fillna("").tolist()
        y = df["priority_label"].tolist()
        
        preds = clf.predict(vectorizer.transform(X))
        acc = accuracy_score(y, preds)
        metadata["metrics"]["priority_accuracy"] = round(acc, 4)
        print(f"Priority Model Accuracy: {acc:.4f}")
        
    # 3. Authority model evaluation
    auth_model_path = os.path.join(models_dir, "authority_model.pkl")
    auth_data_path = "datasets/authority_training.csv"
    if os.path.exists(auth_model_path) and os.path.exists(auth_data_path):
        clf = joblib.load(auth_model_path)
        df = pd.read_csv(auth_data_path)
        
        X_texts = []
        for idx, row in df.iterrows():
            combined = f"text: {row['complaint_text']} category: {row['category']} priority: {row['priority']} district: {row['district']}"
            X_texts.append(combined)
            
        y = df["authority_label"].tolist()
        preds = clf.predict(vectorizer.transform(X_texts))
        acc = accuracy_score(y, preds)
        metadata["metrics"]["authority_accuracy"] = round(acc, 4)
        print(f"Authority Model Accuracy: {acc:.4f}")

    # Write metadata json
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Model evaluation completed. Metadata saved to {metadata_path}.")

if __name__ == "__main__":
    main()
