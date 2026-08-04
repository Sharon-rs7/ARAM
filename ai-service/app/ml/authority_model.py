from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def recommend_authority(text: str, category: str, priority: str, district: str) -> dict:
    cleaned = clean_text(text)
    combined_input = f"text: {cleaned} category: {category} priority: {priority} district: {district}"
    
    if not ml_model_loader.is_available("authority_model") or not ml_model_loader.is_available("vectorizer"):
        # Fallback Map
        authority_map = {
            "LABOUR_DISPUTE": "Labour Office",
            "CONSUMER_COMPLAINT": "Consumer Forum",
            "CYBER_CRIME": "Cyber Crime Portal",
            "PROPERTY_CIVIL_DISPUTE": "Police Station",
            "WOMEN_SAFETY_DOMESTIC_VIOLENCE": "Women Helpline",
            "CRIMINAL_COMPLAINT": "Police Station",
            "GOVERNMENT_SCHEME": "Government Grievance Cell",
            "GENERAL_LEGAL_AID": "District Legal Services Authority"
        }
        fallback_auth = authority_map.get(category, "District Legal Services Authority")
        return {
            "recommendedAuthority": fallback_auth,
            "authorityType": fallback_auth,
            "confidence": 0.0,
            "manualReviewRequired": True,
            "modelBased": False
        }

    clf = ml_model_loader.get_model("authority_model")
    vec = ml_model_loader.get_model("vectorizer")
    
    try:
        features = vec.transform([combined_input])
        pred_auth = str(clf.predict(features)[0])
        
        probs = clf.predict_proba(features)[0]
        classes = clf.classes_
        class_idx = list(classes).index(pred_auth)
        confidence = round(float(probs[class_idx]), 3)
        
        manual_review = confidence < 0.65
        
        return {
            "recommendedAuthority": pred_auth,
            "authorityType": pred_auth,
            "confidence": confidence,
            "manualReviewRequired": manual_review,
            "modelBased": True
        }
    except Exception as e:
        print(f"Error predicting authority: {e}")
        return {
            "recommendedAuthority": "District Legal Services Authority",
            "authorityType": "District Legal Services Authority",
            "confidence": 0.0,
            "manualReviewRequired": True,
            "modelBased": False
        }
