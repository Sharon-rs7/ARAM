import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

os.makedirs("models", exist_ok=True)

# Load QA dataset
df_qa = pd.read_csv("datasets/chatbot_qa_dataset.csv")
qa_questions = df_qa["question"].fillna("").astype(str).tolist()
qa_answers = df_qa["answer"].fillna("").tolist()
qa_categories = df_qa["category"].fillna("").tolist()

# Load next steps knowledge base
df_kb = pd.read_csv("datasets/next_steps_knowledge_base.csv")
kb_questions = df_kb["user_query"].fillna("").astype(str).tolist()
# Construct structured answer
kb_answers = []
for idx, row in df_kb.iterrows():
    kb_answers.append({
        "reply": str(row["answer"]),
        "steps": [x.strip() for x in str(row["steps"]).split("|") if x.strip()]
    })
kb_categories = df_kb["category"].fillna("").tolist()

# Combine corpora
questions = qa_questions + kb_questions
# Standardize answers to a dict format
answers = []
for ans in qa_answers:
    answers.append({"reply": ans, "steps": []})
for ans in kb_answers:
    answers.append(ans)

categories = qa_categories + kb_categories

# Vectorize questions
vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
corpus_features = vectorizer.fit_transform(questions)

# Package index
retriever = {
    "vectorizer": vectorizer,
    "corpus_features": corpus_features,
    "questions": questions,
    "answers": answers,
    "categories": categories
}

joblib.dump(retriever, "models/chatbot_retriever.pkl")
print("Chatbot retriever index trained and saved successfully!")
