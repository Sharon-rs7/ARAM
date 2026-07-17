import pandas as pd
from app.model_loader import model_loader

# Category mappings for rule-based fallbacks
AUTHORITY_MAPPINGS = {
    "LABOUR_DISPUTE": "Labour Office",
    "CONSUMER_COMPLAINT": "Consumer Forum",
    "CYBER_CRIME": "Cyber Crime Portal",
    "PROPERTY_DISPUTE": "Police Station",
    "WOMEN_SAFETY": "Women Helpline",
    "DOMESTIC_VIOLENCE": "Protection Officer",
    "CRIMINAL_COMPLAINT": "Police Station",
    "FAMILY_DISPUTE": "Civil Court",
    "GOVERNMENT_SCHEME": "Government Grievance Cell",
    "GENERAL_LEGAL_AID": "District Legal Services Authority",
    "MOTOR_ACCIDENT_CLAIM": "Motor Accident Claims Tribunal",
    "INSURANCE_CLAIM": "Insurance Ombudsman",
    "BANKING_DISPUTE": "Banking Ombudsman",
    "RENT_TENANT_DISPUTE": "Rent Controller Office",
    "MEDICAL_NEGLIGENCE": "State Medical Council",
    "EDUCATION_DISPUTE": "Education Department Office",
    "WORKPLACE_HARASSMENT": "Internal Complaints Committee",
    "SENIOR_CITIZEN_ABUSE": "Social Welfare Officer",
    "CHILD_WELFARE": "Child Welfare Committee",
    "DISABILITY_RIGHTS": "Differently Abled Commissioner Office",
    "CASTE_DISCRIMINATION": "District Collector Office",
    "POLICE_MISCONDUCT": "District Collector Office",
    "CORRUPTION_BRIBERY": "Vigilance and Anti-Corruption Bureau",
    "CIVIC_INFRASTRUCTURE": "Municipal Corporation Grievance Cell",
    "RTI_APPLICATION": "Public Information Officer"
}

def recommend_authority(text: str, category: str, priority: str, district: str = "Coimbatore"):
    # Fallback to rules if authority models are missing
    if model_loader.is_model_missing("authority"):
        rec = AUTHORITY_MAPPINGS.get(category, "District Legal Services Authority")
        return {
            "recommendedAuthority": rec,
            "confidence": 0.50,
            "manualReviewRequired": True,
            "modelBased": False
        }

    clf = model_loader.models["authority_model"]
    le = model_loader.models["authority_label_encoder"]
    ohe = model_loader.models["authority_metadata_encoder"]
    vec = model_loader.models["authority_vectorizer"]

    # Transform input
    text_feat = vec.transform([text])
    
    meta_df = pd.DataFrame([[category, priority, district]], columns=["category", "priority", "district"])
    meta_feat = ohe.transform(meta_df)
    
    from scipy.sparse import hstack
    combined_feat = hstack([text_feat, meta_feat])

    # Predict
    prob = clf.predict_proba(combined_feat)[0]
    pred_idx = np_argmax = prob.argmax()
    authority = le.inverse_transform([pred_idx])[0]
    confidence = float(prob[pred_idx])

    return {
        "recommendedAuthority": authority,
        "confidence": confidence,
        "manualReviewRequired": confidence < 0.60,
        "modelBased": True
    }
