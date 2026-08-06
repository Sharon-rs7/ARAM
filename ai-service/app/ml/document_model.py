from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text

def recommend_documents(text: str, category: str, priority: str, language: str) -> list:
    cleaned = clean_text(text)
    combined_input = f"text: {cleaned} category: {category} priority: {priority} language: {language}"
    
    if not ml_model_loader.is_available("document_model") or not ml_model_loader.is_available("vectorizer"):
        raise Exception("ML Document Recommender model document_model.pkl or vectorizer.pkl is missing or not loaded.")

    model_dict = ml_model_loader.get_model("document_model")
    vec = ml_model_loader.get_model("vectorizer")
    
    try:
        clf = model_dict["model"]
        mlb = model_dict["mlb"]
        
        features = vec.transform([combined_input])
        preds = clf.predict(features)
        recommended = mlb.inverse_transform(preds)[0]
        
        if not recommended:
            return ["Aadhaar Card"]
            
        return list(recommended)
    except Exception as e:
        print(f"Error predicting documents: {e}")
        raise e
