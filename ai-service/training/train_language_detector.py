import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from app.ml.text_preprocessor import clean_text

def main():
    print("--- Training ML Language Detector Model ---")
    
    datasets_dir = "datasets"
    csv_path = os.path.join(datasets_dir, "language_detection_training.csv")
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} does not exist. Run generate_language_dataset.py first.")
        sys.exit(1)
        
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} samples from {csv_path}.")
    
    # Preprocess text
    df["cleaned_text"] = df["text"].apply(clean_text)
    X = df["cleaned_text"].tolist()
    y = df["language_code"].tolist()
    
    # Use character n-grams to capture language sub-structures, script blocks, and spelling changes
    vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(2, 5), max_features=5000)
    X_vec = vectorizer.fit_transform(X)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_vec, y)
    
    # Save
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(clf, os.path.join(models_dir, "language_detector.pkl"))
    joblib.dump(vectorizer, os.path.join(models_dir, "language_vectorizer.pkl"))
    
    print(f"Language detector ML model trained on character n-grams successfully. Exited successfully.")

if __name__ == "__main__":
    main()
