import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from app.ml.text_preprocessor import clean_text

def main():
    print("--- Training Authority Model ---")
    
    dataset_path = "datasets/authority_training.csv"
    vectorizer_path = "models/vectorizer.pkl"
    
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return
    if not os.path.exists(vectorizer_path):
        print(f"Error: Shared vectorizer.pkl not found. Run train_category_model.py first.")
        return

    df = pd.read_csv(dataset_path)
    df["cleaned_text"] = df["complaint_text"].fillna("").apply(clean_text)
    
    X_texts = []
    y_labels = []
    
    for idx, row in df.iterrows():
        text = row["cleaned_text"]
        cat = row["category"]
        prio = row["priority"]
        dist = row["district"]
        combined = f"text: {text} category: {cat} priority: {prio} district: {dist}"
        X_texts.append(combined)
        y_labels.append(row["authority_label"])
        
    vectorizer = joblib.load(vectorizer_path)
    X_vec = vectorizer.transform(X_texts)
    
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y_labels, test_size=0.15, random_state=42, stratify=y_labels)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_train, y_train)
    
    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(f"Authority Train Accuracy: {train_acc:.4f}")
    print(f"Authority Test Accuracy: {test_acc:.4f}")
    
    models_dir = "models"
    joblib.dump(clf, os.path.join(models_dir, "authority_model.pkl"))
    print("Saved authority_model.pkl successfully.")

if __name__ == "__main__":
    main()
