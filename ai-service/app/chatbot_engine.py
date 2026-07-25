import numpy as np
from app.model_loader import model_loader
from app.language_detector import detect_language
from app.complaint_classifier import predict_category
from app.safety_filter import sanitize_chat_reply, DISCLAIMER

FALLBACK_ANSWERS = {
    "ta": "மன்னிக்கவும், உங்கள் கேள்விக்கு பொருத்தமான தகவல் இல்லை. உதவிக்கு தாலுகா சட்டப்பணி ஆணையத்தை அணுகவும். இது ஆரம்ப வழிகாட்டுதல் மட்டுமே.",
    "hi": "क्षमा करें, हमारे पास इस संबंध में जानकारी उपलब्ध नहीं है। कृपया कानूनी सहायता लें।",
    "en": "I'm sorry, I don't have specific guidance on that query. You may contact your District Legal Services Authority (DLSA) for further help. This is preliminary legal aid guidance only."
}

def ask_chatbot_engine(message: str, language: str = None, user_role: str = "CITIZEN", complaint_id: int = None):
    # Detect language if not provided
    if not language:
        language = detect_language(message)

    # Classify category
    cat_pred = predict_category(message)
    category = cat_pred["category"]

    # Default values
    reply = FALLBACK_ANSWERS.get(language, FALLBACK_ANSWERS["en"])
    confidence = 0.50
    suggested_actions = ["Submit complaint", "Track status"]

    # Try similarity retrieval
    if not model_loader.is_model_missing("chatbot"):
        retriever = model_loader.models["chatbot_retriever"]
        vec = retriever["vectorizer"]
        corpus = retriever["corpus_features"]
        
        # Calculate similarity
        query_feat = vec.transform([message])
        similarities = query_feat.dot(corpus.T).toarray()[0]
        
        if len(similarities) > 0:
            best_idx = int(similarities.argmax())
            best_score = float(similarities[best_idx])
            
            if best_score > 0.15:
                match = retriever["answers"][best_idx]
                reply = match["reply"]
                confidence = best_score
                
                # If there are next steps in the retrieved record
                if "steps" in match and match["steps"]:
                    suggested_actions = match["steps"]
                elif category == "LABOUR_DISPUTE":
                    suggested_actions = ["Collect salary proof", "Prepare contract copy", "Approach Labour Office"]
                elif category == "CYBER_CRIME":
                    suggested_actions = ["Call 1930 immediately", "Save transaction screenshot", "Register Cyber Cell case"]

    # Sanitize and apply disclaimer rules
    reply = sanitize_chat_reply(reply)

    return {
        "reply": reply,
        "answer": reply,
        "category": category,
        "confidence": confidence,
        "suggestedActions": suggested_actions,
        "disclaimer": DISCLAIMER
    }
