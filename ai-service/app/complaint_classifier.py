import numpy as np
from app.model_loader import model_loader

# Define a fallback catalog of keywords for safety verification
FALLBACK_KEYWORDS = {
    "LABOUR_DISPUTE": ["salary", "wage", "employer", "employee", "job", "termination", "overtime", "sambalam", "velai"],
    "CONSUMER_COMPLAINT": ["refund", "product", "damaged", "seller", "order", "invoice", "warranty", "bill"],
    "CYBER_CRIME": ["upi", "fraud", "scam", "otp", "bank", "account", "hacked", "online", "cyber"],
    "PROPERTY_DISPUTE": ["land", "property", "house", "patta", "deed", "boundary", "landlord", "rent"],
    "WOMEN_SAFETY": ["stalking", "harassment", "abuse", "follow", "women", "girl"],
    "DOMESTIC_VIOLENCE": ["husband", "beats", "beating", "abusing", "dowry", "starved", "domestic", "violence"],
    "CRIMINAL_COMPLAINT": ["theft", "stole", "robbed", "attack", "weapons", "assault"],
    "FAMILY_DISPUTE": ["divorce", "custody", "marriage", "inheritance", "ancestral", "ancestry", "division"],
    "GOVERNMENT_SCHEME": ["scheme", "pension", "bribe", "latcham", "ration", "benefits"]
}

def keyword_category(text: str):
    normalized = text.lower()
    matched_cat = "GENERAL_LEGAL_AID"
    highest_matches = 0

    for cat, keywords in FALLBACK_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in normalized)
        if matches > highest_matches:
            highest_matches = matches
            matched_cat = cat

    return matched_cat, highest_matches

def predict_category(text: str):
    # Safe validation and fallbacks if model is missing
    if model_loader.is_model_missing("complaint"):
        matched_cat, _ = keyword_category(text)
        return {
            "category": matched_cat,
            "confidence": 0.50,
            "manualReviewRequired": True,
            "modelBased": False
        }

    clf = model_loader.models["complaint_classifier"]
    le = model_loader.models["complaint_label_encoder"]
    vec = model_loader.models["complaint_vectorizer"]

    # Transform input
    if vec:
        # TF-IDF mode
        features = vec.transform([text])
    else:
        # Embeddings mode (uses TF-IDF vectorizer as default if import fails, but handled here)
        features = np.zeros((1, 384)) # fallback shape

    # Predict
    prob = clf.predict_proba(features)[0]
    pred_idx = np.argmax(prob)
    category = le.inverse_transform([pred_idx])[0]
    confidence = float(prob[pred_idx])
    fallback_category, keyword_matches = keyword_category(text)

    if fallback_category != "GENERAL_LEGAL_AID" and fallback_category != category:
        strong_keyword_signal = keyword_matches >= 2
        weak_model_signal = confidence < 0.60 and keyword_matches >= 1
        if strong_keyword_signal or weak_model_signal:
            category = fallback_category
            confidence = max(confidence, 0.61 if strong_keyword_signal else 0.55)

    return {
        "category": category,
        "confidence": confidence,
        "manualReviewRequired": confidence < 0.60,
        "modelBased": True
    }
