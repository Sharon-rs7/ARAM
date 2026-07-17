import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from scipy.sparse import hstack, csr_matrix

df = pd.read_csv("datasets/authority_training.csv")
X_texts = df["complaint_text"].fillna("").astype(str).tolist()

# Vectorize text
vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
X_text_features = vectorizer.fit_transform(X_texts)

# OneHot encode category, priority, district
ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=True)
metadata = ohe.fit_transform(df[["category", "priority", "district"]])

# Combine features
X_combined = hstack([X_text_features, metadata])

# Target labels
le = LabelEncoder()
y = le.fit_transform(df["authority_label"].astype(str))

# Train classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_combined, y)

# Save models
joblib.dump(clf, "models/authority_model.pkl")
joblib.dump(le, "models/authority_label_encoder.pkl")
joblib.dump(ohe, "models/authority_metadata_encoder.pkl")
joblib.dump(vectorizer, "models/authority_vectorizer.pkl")

print("Authority recommender model trained successfully!")
