import pandas as pd
from app.model_loader import model_loader

DOCUMENT_MAPPINGS = {
    "LABOUR_DISPUTE": ["Salary Slip", "Employee ID", "Bank Statement"],
    "CONSUMER_COMPLAINT": ["Invoice", "Transaction Screenshot", "Product Image"],
    "CYBER_CRIME": ["Bank Statement", "Transaction Screenshot", "Aadhaar Card"],
    "PROPERTY_DISPUTE": ["Property Document", "Aadhaar Card"],
    "WOMEN_SAFETY": ["Aadhaar Card"],
    "DOMESTIC_VIOLENCE": ["Medical Report", "Police Complaint Copy"],
    "CRIMINAL_COMPLAINT": ["Police Complaint Copy", "Aadhaar Card"],
    "GOVERNMENT_SCHEME": ["Ration Card", "Income Certificate"],
    "FAMILY_DISPUTE": ["Marriage Certificate", "Aadhaar Card"],
    "GENERAL_LEGAL_AID": ["Aadhaar Card"]
}

def recommend_documents(text: str, category: str, priority: str):
    # Fallback to rules if models are missing
    if model_loader.is_model_missing("document"):
        docs = DOCUMENT_MAPPINGS.get(category, ["Aadhaar Card"])
        return {
            "requiredDocuments": docs,
            "confidence": 0.50,
            "modelBased": False
        }

    clf = model_loader.models["document_recommender"]
    mlb = model_loader.models["document_label_binarizer"]
    ohe = model_loader.models["document_metadata_encoder"]
    vec = model_loader.models["document_vectorizer"]

    # Transform input
    text_feat = vec.transform([text])
    
    meta_df = pd.DataFrame([[category, priority]], columns=["category", "priority"])
    meta_feat = ohe.transform(meta_df)
    
    from scipy.sparse import hstack
    combined_feat = hstack([text_feat, meta_feat])

    # Predict
    pred_vec = clf.predict(combined_feat)
    docs = mlb.inverse_transform(pred_vec)[0]
    
    # If no labels predicted, fallback
    if len(docs) == 0:
        docs = DOCUMENT_MAPPINGS.get(category, ["Aadhaar Card"])

    return {
        "requiredDocuments": list(docs),
        "confidence": 0.85,
        "modelBased": True
    }
