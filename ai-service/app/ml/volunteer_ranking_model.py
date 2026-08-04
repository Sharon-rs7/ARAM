import numpy as np
from app.ml.model_loader import ml_model_loader

def rank_volunteers(category: str, language: str, prefer_woman: bool, district: str, volunteers: list) -> list:
    ranked = []
    
    # Check if model is available
    model_loaded = ml_model_loader.is_available("volunteer_ranking_model")
    regressor = ml_model_loader.get_model("volunteer_ranking_model")
    
    for vol in volunteers:
        # Extract features
        specs = vol.get("specializationCategories", [])
        if isinstance(specs, str):
            specs = [s.strip() for s in specs.split(",")]
        cat_match = 1.0 if category in specs else 0.0
        
        langs = vol.get("languagesKnown", [])
        if isinstance(langs, str):
            langs = [l.strip() for l in langs.split(",")]
        lang_match = 1.0 if language in langs else 0.0
        
        vol_dist = vol.get("district", "")
        dist_match = 1.0 if vol_dist.lower() == district.lower() else 0.0
        
        active_cases = int(vol.get("currentActiveCases", 0))
        max_cases = int(vol.get("maxActiveCases", 5))
        workload = float(active_cases)
        capacity = float(max_cases)
        
        exp_years = float(vol.get("experienceLevel", 2))
        avg_resp = float(vol.get("avgResponseTime", 24.0)) # hours default
        success = float(vol.get("successRate", 0.75)) # 75% default
        
        trained = 1.0 if vol.get("womenSupportTrained", False) else 0.0
        
        gender = vol.get("gender", "ANY").upper()
        gender_match = 1.0
        if prefer_woman:
            gender_match = 1.0 if gender == "FEMALE" else 0.0
            
        sensitive_case = 1.0 if vol.get("canHandleSensitiveCases", False) else 0.0
        past_cases = float(vol.get("pastCaseCount", active_cases * 3))
        
        avail = 1.0 if vol.get("availabilityStatus", "AVAILABLE") == "AVAILABLE" else 0.0
        
        # ML Feature vector
        # Features must be in the exact order as training:
        # [cat_match, lang_match, dist_match, workload, capacity, exp_years, avg_resp, success, trained, gender_match, sensitive_case, past_cases, avail]
        features = [
            cat_match, lang_match, dist_match, workload, capacity,
            exp_years, avg_resp, success, trained, gender_match,
            sensitive_case, past_cases, avail
        ]
        
        score = 0.0
        if model_loaded and regressor:
            try:
                score = float(regressor.predict([features])[0])
                # Ensure it is between 0 and 100
                score = max(0.0, min(100.0, score))
            except Exception as e:
                print(f"ML ranking prediction failed: {e}. Using fallback heuristic.")
                model_loaded = False
                
        if not model_loaded:
            # Fallback heuristic calculation
            score = 30.0
            if cat_match: score += 30.0
            if lang_match: score += 20.0
            if dist_match: score += 10.0
            if gender_match: score += 10.0
            if trained and prefer_woman: score += 10.0
            # Capacity penalty
            if active_cases >= max_cases:
                score = 0.0
            if avail == 0.0:
                score = 0.0
                
        ranked.append({
            "id": vol.get("id"),
            "name": vol.get("name"),
            "gender": gender,
            "languagesKnown": langs,
            "matchScore": int(score),
            "reason": f"ML Predicted Match Score: {int(score)}% using volunteer_ranking_model.pkl." if model_loaded else "Fallback heuristic matched parameters."
        })
        
    # Sort by score descending
    ranked.sort(key=lambda x: x["matchScore"], reverse=True)
    return ranked
