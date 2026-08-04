import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
import joblib
import pandas as pd
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
from app.ml.text_preprocessor import clean_text

def main():
    print("--- Training Document Model ---")
    
    complaints_path = "datasets/legal_complaints_multilingual.csv"
    priority_path = "datasets/priority_training.csv"
    doc_map_path = "datasets/document_recommendation_training.csv"
    vectorizer_path = "models/vectorizer.pkl"
    
    if not all(os.path.exists(p) for p in [complaints_path, priority_path, doc_map_path, vectorizer_path]):
        print("Error: Missing required datasets or vectorizer.")
        return

    # Load document mappings
    doc_df = pd.read_csv(doc_map_path)
    doc_map = {}
    for idx, row in doc_df.iterrows():
        cat = row["category"]
        docs = [d.strip() for d in row["required_documents"].split(",")]
        doc_map[cat] = docs

    # Load complaints & priority
    comp_df = pd.read_csv(complaints_path)
    prio_df = pd.read_csv(priority_path)
    
    # Merge on text/index
    comp_df["cleaned_text"] = comp_df["complaint_text"].fillna("").apply(clean_text)
    
    # Combine inputs and create multilabel targets
    X_texts = []
    y_labels = []
    
    for idx, row in comp_df.iterrows():
        text = row["cleaned_text"]
        cat = row["category"]
        lang = row["language"]
        prio = prio_df.iloc[idx]["priority_label"] if idx < len(prio_df) else "MEDIUM"
        
        combined = f"text: {text} category: {cat} priority: {prio} language: {lang}"
        X_texts.append(combined)
        
        # Mapped documents
        docs = doc_map.get(cat, ["Aadhaar Card"])
        y_labels.append(docs)
        
    # Fit MultiLabelBinarizer
    mlb = MultiLabelBinarizer()
    y_bin = mlb.fit_transform(y_labels)
    
    # Transform via shared vectorizer
    vectorizer = joblib.load(vectorizer_path)
    X_vec = vectorizer.transform(X_texts)
    
    # Train MultiLabel model
    clf = OneVsRestClassifier(LogisticRegression(max_iter=1000, C=1.0))
    clf.fit(X_vec, y_bin)
    
    train_acc = clf.score(X_vec, y_bin)
    print(f"Document model multilabel accuracy: {train_acc:.4f}")
    
    # Save model and binarizer
    models_dir = "models"
    joblib.dump({"model": clf, "mlb": mlb}, os.path.join(models_dir, "document_model.pkl"))
    print("Saved document_model.pkl successfully.")

if __name__ == "__main__":
    main()
