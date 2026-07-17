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
    "GENERAL_LEGAL_AID": ["Aadhaar Card"],
    "MOTOR_ACCIDENT_CLAIM": ["FIR Copy", "Medical Report", "Aadhaar Card", "Insurance Policy"],
    "INSURANCE_CLAIM": ["Insurance Policy", "Rejection Letter", "Premium Receipts", "Aadhaar Card"],
    "BANKING_DISPUTE": ["Bank Statement", "Complaint Letter to Bank", "Passbook Copy", "Aadhaar Card"],
    "RENT_TENANT_DISPUTE": ["Rent Agreement", "Rent Receipts", "Eviction Notice", "Aadhaar Card"],
    "MEDICAL_NEGLIGENCE": ["Medical Report", "Treatment Bills", "Prescription Sheets", "Aadhaar Card"],
    "EDUCATION_DISPUTE": ["Fee Receipts", "Admission Card", "Aadhaar Card"],
    "WORKPLACE_HARASSMENT": ["Employment Contract", "Email/Chat Screenshots", "Aadhaar Card"],
    "SENIOR_CITIZEN_ABUSE": ["Age Proof", "Aadhaar Card", "Medical Report"],
    "CHILD_WELFARE": ["Child Identity Proof", "Guardian Aadhaar Card"],
    "DISABILITY_RIGHTS": ["Disability Certificate", "Aadhaar Card"],
    "CASTE_DISCRIMINATION": ["Community Certificate", "Aadhaar Card", "Complaint Copy"],
    "POLICE_MISCONDUCT": ["FIR Copy", "Complaint Copy", "Aadhaar Card"],
    "CORRUPTION_BRIBERY": ["Evidence (Audio/Video)", "Transaction Proof", "Aadhaar Card"],
    "CIVIC_INFRASTRUCTURE": ["Grievance Letter", "Infrastructure Photos", "Aadhaar Card"],
    "RTI_APPLICATION": ["RTI Draft Copy", "Aadhaar Card", "Fee Receipt"]
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
