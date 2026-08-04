from fastapi import APIRouter, HTTPException
from app.ml.prediction_schema import ComplaintMLRequest, ComplaintMLResponse
from app.ml.category_model import predict_category
from app.ml.priority_model import predict_priority
from app.ml.document_model import recommend_documents
from app.ml.authority_model import recommend_authority
from app.ml.similar_complaint_model import find_similar_complaints
from app.ml.volunteer_ranking_model import rank_volunteers
from app.ml.model_loader import ml_model_loader
from app.nlp.language_detector import language_detector
from app.nlp.response_templates import get_localized_response, get_localized_category, get_localized_priority
from app.nlp.complaint_summarizer import generate_plain_summary
from app.schemas import VolunteerMatchRequest, DocumentRecommendRequest, AuthorityRecommendRequest

router = APIRouter()

@router.post("/complaint/analyze", response_model=ComplaintMLResponse)
@router.post("/analyze/complaint", response_model=ComplaintMLResponse)
def analyze_complaint(request: ComplaintMLRequest):
    try:
        combined_text = f"{request.title} {request.description}"
        
        # 1. Normalization & Language Detection
        norm_res = normalize_text(combined_text)
        normalized_text = norm_res["normalizedText"]
        
        detected_lang = request.detectedLanguage or request.languageHint or norm_res["detectedLanguage"]
        # Standardize language code format
        if detected_lang.lower() in ["english", "en", "en-in", "en-us"]:
            detected_lang = "en"
        elif detected_lang.lower() in ["tamil", "ta", "ta-in"]:
            detected_lang = "ta"
        elif detected_lang.lower() in ["hindi", "hi", "hi-in"]:
            detected_lang = "hi"
        elif detected_lang.lower() in ["tanglish", "ta-en"]:
            detected_lang = "ta-en"
        elif detected_lang.lower() in ["hinglish", "hi-en"]:
            detected_lang = "hi-en"
        else:
            detected_lang = "en"

        # Detect confidence
        lang_res = language_detector.detect(combined_text)
        lang_confidence = lang_res["confidence"]

        # 2. Category Classifier
        cat_res = predict_category(normalized_text)
        category = cat_res["category"]
        category_conf = cat_res["confidence"]
        top_categories = cat_res["topCategories"]
        
        # 3. Priority Classifier
        prio_res = predict_priority(normalized_text)
        priority = prio_res["priority"]
        priority_conf = prio_res["confidence"]
        
        # 4. Document Recommendations
        req_docs = recommend_documents(normalized_text, category, priority, detected_lang)
        
        # 5. Authority Recommendations
        auth_res = recommend_authority(normalized_text, category, priority, request.district)
        rec_auth = auth_res["recommendedAuthority"]
        auth_conf = auth_res["confidence"]
        
        # 6. Similar Complaint Detection
        sim_res = find_similar_complaints(normalized_text, request.existingComplaints or [])
        sim_found = sim_res["similarComplaintFound"]
        
        # 7. Same Language Response Selection
        response_lang = detected_lang
        
        # Check if any ML model was unavailable/failed
        any_failed = (not cat_res.get("modelBased", False) or 
                      not prio_res.get("modelBased", False) or 
                      not auth_res.get("modelBased", False))
        
        if any_failed:
            fallback_used = True
            manual_review = True
            reasons = ["ML model unavailable"]
            category = None
            category_conf = 0.0
            top_categories = []
            priority = None
            priority_conf = 0.0
            rec_auth = None
            auth_conf = 0.0
            req_docs = []
            localized_msg = "Model unavailable, Admin review required"
            next_steps = ["Your complaint was submitted. Admin will review it."]
            explanation = "ML models are currently unavailable. Grievance sent to queue for manual review."
        else:
            fallback_used = False
            localized_msg = get_localized_response("complaint_received", response_lang)
            
            # 8. Manual Review flags
            manual_review = cat_res["manualReviewRequired"] or prio_res["manualReviewRequired"] or auth_res["manualReviewRequired"]
            reasons = []
            if cat_res["manualReviewRequired"]:
                reasons.append("Category classifier confidence is low.")
            if prio_res["manualReviewRequired"]:
                reasons.append("Priority classifier confidence is low.")
            if auth_res["manualReviewRequired"]:
                reasons.append("Authority recommender confidence is low.")
            if request.sensitive:
                manual_review = True
                reasons.append("Complaint is marked sensitive by user.")
                
            explanation = f"Processed via ARAM Multilingual NLP pipeline. Detected language: {detected_lang}."
            
            loc_cat = get_localized_category(category, response_lang)
            loc_prio = get_localized_priority(priority, response_lang)
            headline = f"This is a {loc_cat} requiring {loc_prio}." if response_lang == "en" else f"இது {loc_cat}, இதற்கு {loc_prio}."
            plain_summary = generate_plain_summary(request.title, request.description, response_lang, category, request.district or "Coimbatore")

            # Construct next steps dynamically
            next_steps = [
                get_localized_response("documents_required", response_lang, documents=", ".join(req_docs[:2])),
                get_localized_response("authority_recommended", response_lang, authority=rec_auth)
            ]
        
        return {
            "detectedLanguage": detected_lang,
            "languageConfidence": lang_confidence,
            "normalizedText": normalized_text,
            "category": category,
            "categoryConfidence": category_conf,
            "topCategories": top_categories,
            "priority": priority,
            "priorityConfidence": priority_conf,
            "recommendedAuthority": rec_auth,
            "authorityConfidence": auth_conf,
            "requiredDocuments": req_docs,
            "responseLanguage": response_lang,
            "localizedMessage": localized_msg,
            "nextSteps": next_steps,
            "manualReviewRequired": manual_review,
            "manualReviewReasons": reasons,
            "modelVersion": ml_model_loader.get_version(),
            "fallbackUsed": fallback_used,
            "explanation": explanation,
            "headline": headline,
            "plainSummary": plain_summary,
            "similarComplaintFound": sim_found
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/volunteer")
def recommend_volunteer(request: VolunteerMatchRequest):
    try:
        vol_list = [v.dict() for v in request.volunteers]
        matches = rank_volunteers(
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
def recommend_documents_endpoint(request: DocumentRecommendRequest):
    try:
        docs = recommend_documents(request.complaintText, request.category, "MEDIUM", "en")
        return {"requiredDocuments": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/authority")
def recommend_authority_endpoint(request: AuthorityRecommendRequest):
    try:
        auth_res = recommend_authority(request.complaintText, request.category, "MEDIUM", "Coimbatore")
        return {"recommendedAuthority": auth_res["recommendedAuthority"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
