import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, classification_report
from scipy.sparse import hstack, csr_matrix

df = pd.read_csv("datasets/priority_training.csv")
X_texts = df["complaint_text"].fillna("").astype(str).tolist()

# Encode inputs
df["is_sensitive_val"] = df["is_sensitive"].astype(str).str.lower().map({"true": 1, "false": 0}).fillna(0)
metadata = df[["is_sensitive_val", "emergency_keywords_present", "money_loss_present", "duration_months"]].values

# Vectorize text
vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
X_text_features = vectorizer.fit_transform(X_texts)

# Combine features
X_combined = hstack([X_text_features, csr_matrix(metadata)])

# Targets
le = LabelEncoder()
y_label = le.fit_transform(df["priority_label"].astype(str))
y_score = df["priority_score"].astype(float).values

# Train classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_combined, y_label)

# Train regressor
reg = RandomForestRegressor(n_estimators=100, random_state=42)
reg.fit(X_combined, y_score)

# Save
joblib.dump(clf, "models/priority_model.pkl")
joblib.dump(reg, "models/priority_regressor.pkl")
joblib.dump(le, "models/priority_label_encoder.pkl")
joblib.dump(vectorizer, "models/priority_vectorizer.pkl")

print("Priority classification and regression models trained successfully!")
