import os
import joblib
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack

df = pd.read_csv("datasets/document_recommendation_training.csv")
X_texts = df["complaint_text"].fillna("").astype(str).tolist()

# Process multi-label targets
df["doc_list"] = df["required_documents"].fillna("").apply(lambda s: [x.strip() for x in s.split("|") if x.strip()])
mlb = MultiLabelBinarizer()
y = mlb.fit_transform(df["doc_list"])

# Vectorize text
vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
X_text_features = vectorizer.fit_transform(X_texts)

# OneHot encode category, priority
ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=True)
metadata = ohe.fit_transform(df[["category", "priority"]])

# Combine features
X_combined = hstack([X_text_features, metadata])

# Train multi-label classifier
clf = OneVsRestClassifier(LogisticRegression(max_iter=1000))
clf.fit(X_combined, y)

# Save models
joblib.dump(clf, "models/document_recommender.pkl")
joblib.dump(mlb, "models/document_label_binarizer.pkl")
joblib.dump(ohe, "models/document_metadata_encoder.pkl")
joblib.dump(vectorizer, "models/document_vectorizer.pkl")

print("Multi-label document recommender model trained successfully!")
