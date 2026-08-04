from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def recommend_documents(text: str, category: str, priority: str, language: str) -> list:
    cleaned = clean_text(text)
    combined_input = f"text: {cleaned} category: {category} priority: {priority} language: {language}"
    
    if not ml_model_loader.is_available("document_model") or not ml_model_loader.is_available("vectorizer"):
        # Fallback list based on category
        category_defaults = {
            "LABOUR_DISPUTE": ["Salary Slip", "Employee ID", "Bank Statement"],
            "CONSUMER_COMPLAINT": ["Invoice", "Transaction Screenshot", "Product Image"],
            "CYBER_CRIME": ["Bank Statement", "Transaction Screenshot", "Aadhaar Card"],
            "PROPERTY_CIVIL_DISPUTE": ["Property Document", "Sale Deed", "Aadhaar Card"],
            "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["Aadhaar Card", "Police Complaint Copy"],
            "CRIMINAL_COMPLAINT": ["Police Complaint Copy", "Aadhaar Card", "FIR Copy"],
            "GOVERNMENT_SCHEME": ["Ration Card", "Income Certificate", "Aadhaar Card"]
        }
        return category_defaults.get(category, ["Aadhaar Card"])

    model_dict = ml_model_loader.get_model("document_model")
    vec = ml_model_loader.get_model("vectorizer")
    
    try:
        clf = model_dict["model"]
        mlb = model_dict["mlb"]
        
        features = vec.transform([combined_input])
        preds = clf.predict(features)
        recommended = mlb.inverse_transform(preds)[0]
        
        # If model predicted nothing, return at least Aadhaar Card as default
        if not recommended:
            return ["Aadhaar Card"]
            
        return list(recommended)
    except Exception as e:
        print(f"Error predicting documents: {e}")
        return ["Aadhaar Card"]
