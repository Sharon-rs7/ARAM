import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer

# Create directories
os.makedirs("models/saved", exist_ok=True)

def train_language_model():
    print("--- Training Language Detector ---")
    if not os.path.exists("datasets/language_samples.csv"):
        print("datasets/language_samples.csv not found. Skipping.")
        return
        
    df = pd.read_csv("datasets/language_samples.csv")
    X = df["text"].fillna("").astype(str).tolist()
    y = df["language"].tolist()
    
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    X_vec = vectorizer.fit_transform(X)
    
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_vec, y)
    
    joblib.dump(clf, "models/saved/language_detector.pkl")
    joblib.dump(vectorizer, "models/saved/language_vectorizer.pkl")
    print("Language detector model saved to models/saved/.")

def train_category_model():
    print("--- Training Category Classifier ---")
    if not os.path.exists("datasets/legal_complaints_multilingual.csv"):
        print("datasets/legal_complaints_multilingual.csv not found. Skipping.")
        return
        
    df = pd.read_csv("datasets/legal_complaints_multilingual.csv")
    X = df["complaint_text"].fillna("").astype(str).tolist()
    y_cats = df["category"].tolist()
    
    le = LabelEncoder()
    y = le.fit_transform(y_cats)
    
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_vec = vectorizer.fit_transform(X)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_vec, y)
    
    joblib.dump(clf, "models/saved/complaint_classifier.pkl")
    joblib.dump(le, "models/saved/complaint_label_encoder.pkl")
    joblib.dump(vectorizer, "models/saved/complaint_vectorizer.pkl")
    print("Category classifier model saved to models/saved/.")

def train_priority_model():
    print("--- Training Priority Predictor ---")
    if not os.path.exists("datasets/priority_training.csv"):
        print("datasets/priority_training.csv not found. Skipping.")
        return
        
    df = pd.read_csv("datasets/priority_training.csv")
    X = df["complaint_text"].fillna("").astype(str).tolist()
    y_prio = df["priority_label"].tolist()
    
    le = LabelEncoder()
    y = le.fit_transform(y_prio)
    
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_vec = vectorizer.fit_transform(X)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_vec, y)
    
    joblib.dump(clf, "models/saved/priority_model.pkl")
    joblib.dump(le, "models/saved/priority_label_encoder.pkl")
    joblib.dump(vectorizer, "models/saved/priority_vectorizer.pkl")
    print("Priority predictor model saved to models/saved/.")

if __name__ == "__main__":
    # Redirect print to models/saved/training.log
    import sys
    log_file = open("models/saved/training.log", "w", encoding="utf-8")
    sys.stdout = log_file
    sys.stderr = log_file
    
    try:
        train_language_model()
        train_category_model()
        train_priority_model()
        print("All models trained and saved successfully.")
    except Exception as e:
        print(f"Error during training pipeline execution: {e}")
    finally:
        log_file.close()
