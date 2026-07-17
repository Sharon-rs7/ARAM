import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score, f1_score

os.makedirs("models", exist_ok=True)

df = pd.read_csv("datasets/legal_complaints_multilingual.csv")
X_texts = df["complaint_text"].fillna("").astype(str).tolist()
y_cats = df["category"].tolist()

# Label Encode targets
le = LabelEncoder()
y = le.fit_transform(y_cats)

# Attempt Sentence-Transformers embedding, fall back to TF-IDF
use_tfidf = True
embeddings = None
vectorizer = None

try:
    print("Attempting to load sentence-transformers model...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    print("Generating sentence embeddings...")
    embeddings = model.encode(X_texts, show_progress_bar=True)
    use_tfidf = False
    print("Embeddings generated successfully.")
except Exception as e:
    print(f"Sentence-Transformers loading failed or not installed: {e}")
    print("Falling back to TfidfVectorizer...")

if use_tfidf:
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    embeddings = vectorizer.fit_transform(X_texts)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(embeddings, y, test_size=0.2, random_state=42, stratify=y)

clf = LogisticRegression(max_iter=1000, C=1.0)
clf.fit(X_train, y_train)

# Evaluate
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average="macro")
weighted_f1 = f1_score(y_test, y_pred, average="weighted")

print(f"Accuracy: {acc:.4f}")
print(f"Macro F1: {macro_f1:.4f}")
print(f"Weighted F1: {weighted_f1:.4f}")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# Save models
joblib.dump(clf, "models/complaint_classifier.pkl")
joblib.dump(le, "models/complaint_label_encoder.pkl")
if use_tfidf:
    joblib.dump(vectorizer, "models/complaint_vectorizer.pkl")
    print("Saved TF-IDF complaint vectorizer.")
else:
    # Remove old vectorizer if it exists
    if os.path.exists("models/complaint_vectorizer.pkl"):
        os.remove("models/complaint_vectorizer.pkl")

print("Complaint classifier model trained and saved successfully!")
