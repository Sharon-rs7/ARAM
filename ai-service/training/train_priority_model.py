import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from app.ml.text_preprocessor import clean_text

def main():
    print("--- Training Priority Model ---")
    
    dataset_path = "datasets/priority_training.csv"
    vectorizer_path = "models/vectorizer.pkl"
    
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return
    if not os.path.exists(vectorizer_path):
        print(f"Error: Shared vectorizer.pkl not found. Run train_category_model.py first.")
        return

    df = pd.read_csv(dataset_path)
    df["cleaned_text"] = df["complaint_text"].fillna("").apply(clean_text)
    
    X = df["cleaned_text"].tolist()
    y = df["priority_label"].tolist()
    
    vectorizer = joblib.load(vectorizer_path)
    X_vec = vectorizer.transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.15, random_state=42, stratify=y)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_train, y_train)
    
    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(f"Priority Train Accuracy: {train_acc:.4f}")
    print(f"Priority Test Accuracy: {test_acc:.4f}")
    
    models_dir = "models"
    joblib.dump(clf, os.path.join(models_dir, "priority_model.pkl"))
    print("Saved priority_model.pkl successfully.")

if __name__ == "__main__":
    main()
