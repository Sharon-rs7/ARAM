import numpy as np
from app.ml.model_loader import ml_model_loader

def rank_volunteers(category: str, language: str, prefer_woman: bool, district: str, volunteers: list) -> list:
    ranked = []
    
    # Check if model is available
    model_loaded = ml_model_loader.is_available("volunteer_ranking_model")
    regressor = ml_model_loader.get_model("volunteer_ranking_model")
    
    if not model_loaded or not regressor:
        raise Exception("ML Volunteer Ranking Model is not loaded or missing.")
    
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
        
        exp_years = float(vol.get("experienceLevel", 2) if str(vol.get("experienceLevel")).isdigit() else 3)
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
        
        try:
            input_name = regressor.get_inputs()[0].name
            output_name = regressor.get_outputs()[0].name
            input_data = np.array([features], dtype=np.float32)
            
            res = regressor.run([output_name], {input_name: input_data})
            score = float(res[0][0])
            score = max(0.0, min(100.0, score))
        except Exception as e:
            print(f"ML ranking prediction failed for volunteer {vol.get('name')}: {e}")
            raise e
                
        ranked.append({
            "id": vol.get("id"),
            "name": vol.get("name"),
            "gender": gender,
            "languagesKnown": langs,
            "matchScore": int(score),
            "experienceLevel": vol.get("experienceLevel"),
            "reason": f"ML Predicted Match Score: {int(score)}% using volunteer_ranking_model.onnx."
        })
        
    # Sort by score descending
    ranked.sort(key=lambda x: x["matchScore"], reverse=True)
    return ranked
