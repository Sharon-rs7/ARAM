import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from app.ml.text_preprocessor import clean_text

def main():
    print("--- Training Category Model ---")
    
    # Read datasets
    dataset_path = "datasets/legal_complaints_multilingual.csv"
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Run generate_datasets.py first.")
        return

    df = pd.read_csv(dataset_path)
    df["cleaned_text"] = df["complaint_text"].fillna("").apply(clean_text)
    
    X = df["cleaned_text"].tolist()
    y = df["category"].tolist()
    
    # Vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_vec = vectorizer.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.15, random_state=42, stratify=y)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_train, y_train)
    
    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(f"Category Train Accuracy: {train_acc:.4f}")
    print(f"Category Test Accuracy: {test_acc:.4f}")
    
    # Save vectorizer & model
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(vectorizer, os.path.join(models_dir, "vectorizer.pkl"))
    joblib.dump(clf, os.path.join(models_dir, "category_model.pkl"))
    print("Saved shared vectorizer.pkl and category_model.pkl successfully.")

if __name__ == "__main__":
    main()
