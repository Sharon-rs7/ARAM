from fastapi import APIRouter, HTTPException, Depends
from app.auth import verify_internal_token
from app.ml.prediction_schema import ComplaintMLRequest, ComplaintMLResponse
from app.ml.category_model import predict_category
from app.ml.priority_model import predict_priority
from app.document_recommender import recommend_documents
from app.authority_recommender import recommend_authority
from app.ml.similar_complaint_model import find_similar_complaints
from app.ml.volunteer_ranking_model import rank_volunteers
from app.ml.model_loader import ml_model_loader
from app.nlp.language_detector import language_detector
from app.nlp.multilingual_normalizer import normalize_text
from app.nlp.response_templates import get_localized_response, get_localized_category, get_localized_priority
from app.nlp.complaint_summarizer import generate_plain_summary
from app.schemas import VolunteerMatchRequest, DocumentRecommendRequest, AuthorityRecommendRequest

import json
import os

METADATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models", "model_metadata.json")

def get_genuinely_trained_categories():
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
                return meta.get("categories_genuinely_trained", ["CONSUMER_COMPLAINT", "BANKING_DISPUTE"])
        except Exception:
            pass
    return ["CONSUMER_COMPLAINT", "BANKING_DISPUTE"]

router = APIRouter(dependencies=[Depends(verify_internal_token)])

@router.post("/complaint/analyze", response_model=ComplaintMLResponse)
@router.post("/analyze/complaint", response_model=ComplaintMLResponse)
def analyze_complaint(request: ComplaintMLRequest):
    try:
        raw_desc = request.description or request.text or ""
        combined_text = f"{request.title or ''} {raw_desc}".strip()
        if not combined_text:
            combined_text = " "
        
        # 1. Language Detection & Normalization with prioritization
        lang_res = language_detector.detect(combined_text)
        lang_confidence = lang_res["confidence"]
        
        # Priorities:
        # - user manually passed request.detectedLanguage (override)
        # - NLP found native script (Tamil/Devanagari) which overrides default hints
        # - NLP found Tanglish/Hinglish (confidence >= 0.45 for non-en classes)
        # - request.languageHint
        # - NLP detected fallback
        is_strong_non_en = (lang_res["language"] in ["ta", "hi"] and lang_res.get("confidence", 0.0) >= 0.45)
        if request.detectedLanguage:
            raw_lang = request.detectedLanguage
        elif lang_res.get("method") == "unicode_script" or is_strong_non_en:
            raw_lang = lang_res["language"]
        elif request.languageHint:
            raw_lang = request.languageHint
        else:
            raw_lang = lang_res["language"]

        # Standardize language code format and map mixed script types
        raw_lang_lower = raw_lang.lower()
        if raw_lang_lower in ["english", "en", "en-in", "en-us"]:
            detected_lang = "en"
        elif raw_lang_lower in ["tamil", "ta", "ta-in"]:
            # If NLP says ta mixed or Latin, map to Tanglish/mixed
            if lang_res["language"] == "ta" and (lang_res.get("mixed") or lang_res.get("script") == "Latin"):
                detected_lang = "ta-en"
            else:
                detected_lang = "ta"
        elif raw_lang_lower in ["hindi", "hi", "hi-in"]:
            # If NLP says hi mixed or Latin, map to Hinglish/mixed
            if lang_res["language"] == "hi" and (lang_res.get("mixed") or lang_res.get("script") == "Latin"):
                detected_lang = "hi-en"
            else:
                detected_lang = "hi"
        elif raw_lang_lower in ["tanglish", "ta-en"]:
            detected_lang = "ta-en"
        elif raw_lang_lower in ["hinglish", "hi-en"]:
            detected_lang = "hi-en"
        else:
            detected_lang = "en"

        # Normalize using our resolved language
        norm_res = normalize_text(combined_text, resolved_lang=detected_lang)
        normalized_text = norm_res["normalizedText"]

        # 2. Category Classifier
        cat_res = predict_category(normalized_text)
        category = cat_res["category"]
        category_conf = cat_res["confidence"]
        top_categories = cat_res["topCategories"]
        
        # 3. Priority Classifier
        prio_res = predict_priority(normalized_text, category=category, is_sensitive=request.sensitive)
        priority = prio_res["priority"]
        priority_conf = prio_res["confidence"]
        
        # 4. Document Recommendations
        doc_res = recommend_documents(normalized_text, category, priority)
        req_docs = doc_res["requiredDocuments"] if isinstance(doc_res, dict) else (doc_res or ["Aadhaar Card"])
        
        # 5. Authority Recommendations
        auth_res = recommend_authority(normalized_text, category, priority, request.district)
        rec_auth = auth_res["recommendedAuthority"]
        auth_conf = auth_res["confidence"]
        
        # 6. Similar Complaint Detection
        sim_res = find_similar_complaints(normalized_text, request.existingComplaints or [])
        sim_found = sim_res["similarComplaintFound"]
        
        # 7. Same Language Response Selection
        response_lang = detected_lang
        
        # Check if category model is loaded
        if not ml_model_loader.is_available("category_model"):
            raise HTTPException(status_code=500, detail="ML Classifier models are currently offline. Analysis failed.")
            
        fallback_used = not cat_res.get("modelBased", False)
        localized_msg = get_localized_response("complaint_received", response_lang)
        
        # Manual Review flags
        manual_review = cat_res["manualReviewRequired"]
        reasons = []
        if cat_res["manualReviewRequired"]:
            reasons.append("Category classifier confidence is low.")
        if request.sensitive:
            manual_review = True
            reasons.append("Complaint is marked sensitive by user.")
            
        explanation = f"Processed via ARAM Multilingual NLP pipeline. Category Prediction: {category} ({cat_res.get('prediction_source', 'ONNX_ML')})."
        
        loc_cat = get_localized_category(category, response_lang)
        loc_prio = get_localized_priority(priority, response_lang)
        
        from app.nlp.case_summary_generator import generate_case_summary_details, generate_problem_title
        problem_title = generate_problem_title(combined_text, category, request.district or "Coimbatore", response_lang)
        headline = problem_title
        plain_summary = generate_plain_summary(request.title, request.description, response_lang, category, request.district or "Coimbatore")

        # V2 features
        detected_issues = [c["category"] for c in top_categories if c["probability"] >= 0.15] if cat_res.get("modelBased", False) else [category or "GENERAL_LEGAL_AID"]
        if not detected_issues:
            detected_issues = [category]
        
        urgency_flags = []
        if request.sensitive:
            urgency_flags.append("SENSITIVE_CASE")
        lower_desc = combined_text.lower()
        if any(w in lower_desc for w in ["kill", "murder", "threat", "violence", "beat", "தாக்கினர்", "மிரட்டுகிறார்"]):
            urgency_flags.append("PHYSICAL_VIOLENCE_RISK")
        
        # Construct next steps dynamically
        next_steps = [
            get_localized_response("documents_required", response_lang, documents=", ".join(req_docs[:2])),
            get_localized_response("authority_recommended", response_lang, authority=rec_auth)
        ]
        
        case_summary_details = generate_case_summary_details(
            title=problem_title,
            description=request.description,
            category=category,
            district=request.district or "Coimbatore",
            language_code=detected_lang,
            required_docs=req_docs
        )
        
        res_dict = {
            "caseSummary": case_summary_details,
            "detectedLanguage": detected_lang,
            "languageConfidence": lang_confidence,
            "normalizedText": normalized_text,
            "problemTitle": problem_title,
            "title": problem_title,
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
            "modelVersion": ml_model_loader.get_version() or "ARAM_RAG_ML_V2.0.0",
            "fallbackUsed": fallback_used,
            "explanation": explanation,
            "headline": headline,
            "plainSummary": plain_summary,
            "similarComplaintFound": sim_found,
            "primaryCategory": category,
            "detectedIssues": detected_issues,
            "urgencyFlags": urgency_flags,
            "complexity": "HIGH" if priority in ["URGENT", "HIGH"] else "MEDIUM",
            "recommendedRouting": rec_auth,
            "recommendationMode": "ML_RECOMMENDATION" if ml_model_loader.metadata.get("trained_on_real_data", False) else "DYNAMIC_LEGAL_ANALYSIS",
            
            # Real-data Phase 2 attributes
            "categoryPredictionSource": cat_res.get("prediction_source", "ONNX_ML"),
            "priorityPredictionSource": prio_res.get("prediction_source", "ONNX_ML"),
            "complexityPredictionSource": "DYNAMIC_RULES",
            "authorityPredictionSource": auth_res.get("prediction_source", "INTELLIGENT_LEGAL_ROUTING"),
            "categoriesGenuinelyTrained": get_genuinely_trained_categories(),
            
            # Preserving MySQL/MongoDB links
            "complaintId": request.complaintId,
            "citizenId": request.citizenId,
            "regionId": request.regionId,
            
            # Training Data Feedback Loop Schema
            "trainingFeedbackSchema": {
                "complaintText": combined_text,
                "categoryPrediction": category,
                "finalAdminCategory": "PENDING_RESOLUTION",
                "assignedDepartment": "PENDING_RESOLUTION",
                "assignedGuideId": "PENDING_RESOLUTION",
                "resolutionTimeMinutes": None,
                "resolutionOutcome": "PENDING_RESOLUTION",
                "citizenFeedbackScore": None,
                "reopenStatus": False
            }
        }

        if request.complaintId:
            from app.mongo_context import create_initial_context
            create_initial_context(
                complaint_id=request.complaintId,
                citizen_id=request.citizenId,
                region_id=request.regionId or request.district,
                original_text=combined_text,
                original_lang=detected_lang,
                analysis=res_dict
            )
            
        return res_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/volunteer")
def recommend_volunteer(request: VolunteerMatchRequest):
    try:
        vol_list = []
        for v in request.volunteers:
            langs = v.languagesKnown if isinstance(v.languagesKnown, list) else [str(v.languagesKnown)] if v.languagesKnown else ["English"]
            specs = v.specializationCategories if isinstance(v.specializationCategories, list) else [str(v.specializationCategories)] if v.specializationCategories else ["GENERAL_LEGAL_AID"]
            vol_list.append({
                "id": v.id,
                "legalGuideId": v.id,
                "languagesKnown": langs,
                "supportsTanglish": v.supportsTanglish or False,
                "supportsHinglish": v.supportsHinglish or False,
                "specializationCategories": specs,
                "district": v.district or "Coimbatore",
                "currentActiveCases": v.currentActiveCases or 0,
                "maxActiveCases": v.maxActiveCases or 5,
                "availabilityStatus": v.availabilityStatus or "AVAILABLE",
                "gender": v.gender or "ANY",
                "canHandleSensitiveCases": True,
                "eloRating": v.eloRating if v.eloRating is not None else 1000,
                "averageRating": v.averageRating or 0.0,
                "feedbackCount": v.feedbackCount if v.feedbackCount is not None else 0
            })

        from app.ml.elo_matcher import rank_volunteers_with_elo
        from app.mongo_context import get_ai_context

        complaint_text = ""
        if request.complaintId:
            context = get_ai_context(str(request.complaintId))
            if context:
                complaint_text = context.get("originalText", "")

        matching_result = rank_volunteers_with_elo(
            complaint_text=complaint_text,
            category=request.category,
            language=request.language,
            prefer_woman=request.preferWomanVolunteer,
            district=request.district,
            volunteers=vol_list
        )

        vol_lookup = {str(v.id): v for v in request.volunteers}
        results = []
        for cand in matching_result.get("recommendedGuides", []):
            gid = str(cand["guideId"])
            guide_v = vol_lookup.get(gid)
            guide_name = guide_v.name if guide_v and guide_v.name else f"Guide #{gid}"
            guide_langs = guide_v.languagesKnown if guide_v and isinstance(guide_v.languagesKnown, list) else ["English"]
            results.append({
                "id": int(cand["guideId"]),
                "name": guide_name,
                "languagesKnown": guide_langs,
                "matchScore": int(cand["finalScore"] * 100),
                "reason": cand["matchingReasons"][0] if cand.get("matchingReasons") else "Capable",
                "recommendationMode": matching_result.get("recommendationMode", "RECOMMENDATION_MATCH")
            })
        return results
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
