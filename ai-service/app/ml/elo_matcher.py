import numpy as np
import datetime
from app.config import settings
from app.services.embedding_service import embedding_service
from app.mongo_logger import mongo_manager

def rank_volunteers_with_elo(
    complaint_text: str,
    category: str,
    language: str,
    prefer_woman: bool,
    district: str,
    volunteers: list,
    sensitive: bool = False
) -> dict:
    eligible_guides = []
    
    # 1. Eligibility Filtering & Multi-criteria Scoring
    for v in volunteers:
        matching_reasons = []
        
        # Region/District Match
        guide_dist = (v.get("district") or "").strip().lower()
        target_dist = (district or "").strip().lower()
        is_district_match = bool(not target_dist or not guide_dist or guide_dist == target_dist)
        if is_district_match:
            matching_reasons.append("Region match")
        
        # Supported Languages
        req_lang = (language or "en").strip().lower()
        raw_langs = v.get("languagesKnown", [])
        if isinstance(raw_langs, str):
            raw_langs = [l.strip() for l in raw_langs.split(",")]
        langs_known = [lk.lower() for lk in raw_langs]
        
        lang_ok = False
        if not req_lang or req_lang in ["any", "all"]:
            lang_ok = True
        elif any(req_lang in lk or lk in req_lang for lk in langs_known):
            lang_ok = True
        elif req_lang in ["english", "en"] and any(l in ["en", "english"] for l in langs_known):
            lang_ok = True
        elif req_lang in ["tamil", "ta"] and any(l in ["ta", "tamil"] for l in langs_known):
            lang_ok = True
        elif req_lang in ["ta-en", "tanglish"] and v.get("supportsTanglish", False):
            lang_ok = True
        elif req_lang in ["hi-en", "hinglish"] and v.get("supportsHinglish", False):
            lang_ok = True
        elif not langs_known:
            lang_ok = True
            
        if lang_ok:
            matching_reasons.append("Language match")
        
        # Specialization Match
        raw_specs = v.get("specializationCategories", [])
        if isinstance(raw_specs, str):
            raw_specs = [s.strip() for s in raw_specs.split(",")]
        specs = [s.upper() for s in raw_specs]
        target_cat = (category or "").strip().upper()
        
        cat_ok = False
        if not target_cat or target_cat in specs or "GENERAL_LEGAL_AID" in specs or "ANY" in specs or not specs:
            cat_ok = True
        else:
            cat_words = [w for w in target_cat.split("_") if len(w) > 3]
            if any(any(w in spec for w in cat_words) for spec in specs):
                cat_ok = True
                
        if cat_ok:
            matching_reasons.append("Relevant case experience")
            
        # Active and Available Capacity
        current_workload = int(v.get("currentActiveCases", 0))
        max_capacity = int(v.get("maxActiveCases", 5))
        avail_status = v.get("availabilityStatus", "AVAILABLE")
        
        if avail_status == "AVAILABLE":
            matching_reasons.append("Available capacity")
            
        # Sensitive/Women-related checks
        guide_gender = (v.get("gender") or "ANY").upper()
        if prefer_woman and guide_gender == "FEMALE":
            matching_reasons.append("Preferred female guide for sensitive case")
        elif prefer_woman:
            matching_reasons.append("Eligible guide")
            
        if not matching_reasons:
            matching_reasons.append("Registered Legal Guide")
            
        eligible_guides.append((v, matching_reasons))

    if not eligible_guides:
        return {
            "recommendedGuides": [],
            "recommendationMode": "COLD_START_RECOMMENDATION",
            "reason": "NO_ELIGIBLE_GUIDE"
        }
        
    # 2. Dynamic ELO & Case Similarity Scoring
    db = mongo_manager.get_db()
    scored_guides = []
    
    # Check global readiness threshold
    has_sufficient_history = False
    
    for v, reasons in eligible_guides:
        guide_id = str(v.get("id") or v.get("legalGuideId"))
        
        # A. Cosine similarity from guide_case_embeddings
        historical_embeddings = []
        if db is not None:
            try:
                history_cursor = db.guide_case_embeddings.find({
                    "guideId": guide_id,
                    "resolutionOutcome": "SUCCESS"
                })
                historical_embeddings = [h["embedding"] for h in history_cursor if "embedding" in h]
            except Exception as e:
                print(f"Error fetching historical embeddings for guide {guide_id}: {e}")
                
        # Determine if we meet the minimum data threshold
        is_cold_start = len(historical_embeddings) < settings.MIN_HISTORICAL_CASES
        if not is_cold_start:
            has_sufficient_history = True
            
        if is_cold_start or not complaint_text:
            case_similarity = 0.5 # Neutral baseline
        else:
            current_embedding = embedding_service.encode([complaint_text])[0]
            similarities = [float(np.dot(current_embedding, h_emb)) for h_emb in historical_embeddings]
            case_similarity = max(similarities) if similarities else 0.5
            
        # B. ELO sigmoid normalization
        elo = float(v.get("eloRating", 1000))
        elo_score = 1.0 / (1.0 + 10.0 ** ((1400.0 - elo) / 400.0))
        
        # C. Feedback quality (No fabrication)
        fb_count = int(v.get("feedbackCount", 0))
        if fb_count == 0:
            feedback_score = 0.5 # Neutral baseline
        else:
            avg_rating = float(v.get("averageRating", 0.0))
            feedback_score = avg_rating / 5.0
            
        # D. Normalize config weights
        w_embed = settings.GUIDE_MATCH_EMBED_WEIGHT
        w_elo = settings.GUIDE_MATCH_ELO_WEIGHT
        w_feedback = settings.GUIDE_MATCH_FEEDBACK_WEIGHT
        total_w = w_embed + w_elo + w_feedback
        if total_w > 0:
            w_embed /= total_w
            w_elo /= total_w
            w_feedback /= total_w
            
        # E. Final weighted score
        final_score = (w_embed * case_similarity) + (w_elo * elo_score) + (w_feedback * feedback_score)
        
        # Apply Women Safety and Sensitive Case Priority Boosts
        if prefer_woman:
            if v.get("gender", "ANY").upper() == "FEMALE":
                final_score += 0.3
                if "Highly recommended: Female guide matches preference" not in reasons:
                    reasons.append("Highly recommended: Female guide matches preference")
            if v.get("womenSupportTrained", False):
                final_score += 0.2
                if "Certified Women Support Trainer" not in reasons:
                    reasons.append("Certified Women Support Trainer")
            if v.get("canHandleSensitiveCases", False):
                final_score += 0.1
                if "Handles sensitive cases" not in reasons:
                    reasons.append("Handles sensitive cases")
        
        # Apply workload penalty (Dynamic workload scaling)
        current_workload = int(v.get("currentActiveCases", 0))
        max_capacity = int(v.get("maxActiveCases", 5))
        workload_ratio = current_workload / max(1, max_capacity)
        penalty = 1.0 - (workload_ratio ** 2)
        
        final_score = final_score * penalty
        final_score = max(0.0, min(1.0, final_score))
        
        scored_guides.append({
            "guideId": guide_id,
            "finalScore": round(final_score, 3),
            "caseSimilarityScore": round(case_similarity, 3),
            "eloScore": round(elo_score, 3),
            "feedbackScore": round(feedback_score, 3),
            "workload": current_workload,
            "availability": True,
            "matchingReasons": reasons
        })
        
    # Sort descending by finalScore
    scored_guides.sort(key=lambda x: x["finalScore"], reverse=True)
    
    # Keep Top 3
    top_3 = scored_guides[:3]
    
    mode = "ML_RECOMMENDATION" if has_sufficient_history else "COLD_START_RECOMMENDATION"
    
    return {
        "recommendedGuides": top_3,
        "recommendationMode": mode
    }
