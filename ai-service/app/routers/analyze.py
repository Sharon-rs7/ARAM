from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import (
    ComplaintAnalyzeRequest, 
    VolunteerMatchRequest, 
    DocumentRecommendRequest, 
    AuthorityRecommendRequest
)
from app.services.language_detector import language_detector
from app.services.category_classifier import category_classifier
from app.services.priority_predictor import priority_predictor
from app.services.document_recommender import document_recommender
from app.services.authority_recommender import authority_recommender
from app.services.women_safety_detector import women_safety_detector
from app.services.volunteer_matcher import volunteer_matcher

router = APIRouter()

@router.post("/analyze/complaint")
@router.post("/complaint/analyze")
def analyze_complaint(request: ComplaintAnalyzeRequest):
    try:
        text = request.complaintText
        
        # 1. Language Detection
        detected_lang = language_detector.detect_language(text)
        
        # 2. Category Classification
        cat_res = category_classifier.classify(text)
        category = cat_res["category"]
        confidence = cat_res["confidence"]
        
        # 3. Priority Prediction
        prio_res = priority_predictor.predict(text, category, request.isSensitive)
        priority = prio_res["priorityCode"]
        priority_name = prio_res["priorityName"]
        priority_score = prio_res["priorityScore"]
        
        # 4. Women Safety & Gender Comfort Checks
        safety_res = women_safety_detector.detect(text, category)
        women_sensitive = safety_res["womenSensitive"]
        prefer_woman = safety_res["preferWomanVolunteer"] or (request.preferredHelperGender == "FEMALE")
        
        # 5. Authority Recommendation
        recommended_authority = authority_recommender.recommend(text, category)
        
        # 6. Required Documents
        required_docs = document_recommender.recommend(text, category)
        
        # 7. Next Steps mapping based on category default rules
        next_steps = [
            f"Collect your {', '.join(required_docs[:2])} and proof of identity.",
            f"Draft a formal complaint describing the {category.lower().replace('_', ' ')} issue.",
            f"Submit petition to the local {recommended_authority} office for action."
        ]
        
        return {
            "detectedLanguage": detected_lang,
            "normalizedText": text.strip(),
            "predictedCategory": category,
            "predictedSubcategory": "General Grievance",
            "priorityCode": priority,
            "priorityName": priority_name,
            "priorityScore": priority_score,
            "confidenceScore": int(confidence * 100) if cat_res["modelBased"] else 50,
            "womenSensitive": women_sensitive,
            "preferWomanVolunteer": prefer_woman,
            "recommendedAuthority": recommended_authority,
            "requiredDocuments": required_docs,
            "nextSteps": next_steps,
            "riskSignals": ["safety_override_triggered"] if women_sensitive else [],
            "disclaimer": "ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.",
            "category": category,
            "priority": priority_name,
            "authorityType": recommended_authority
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/volunteer")
def recommend_volunteer(request: VolunteerMatchRequest):
    try:
        vol_list = [v.dict() for v in request.volunteers]
        matches = volunteer_matcher.match(
            category=request.category,
            language=request.language,
            prefer_woman=request.preferWomanVolunteer,
            district=request.district,
            volunteers=vol_list
        )
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/documents")
def recommend_documents(request: DocumentRecommendRequest):
    try:
        docs = document_recommender.recommend(request.complaintText, request.category)
        return {"requiredDocuments": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/authority")
def recommend_authority_endpoint(request: AuthorityRecommendRequest):
    try:
        auth = authority_recommender.recommend(request.complaintText, request.category)
        return {"recommendedAuthority": auth}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
