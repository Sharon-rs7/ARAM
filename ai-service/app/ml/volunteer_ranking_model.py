import numpy as np
from app.ml.model_loader import ml_model_loader

def rank_volunteers(category: str, language: str, prefer_woman: bool, district: str, volunteers: list) -> list:
    ranked = []
    
    # Check if model is trained on real data
    trained_on_real = ml_model_loader.metadata.get("trained_on_real_data", False)
    model_loaded = ml_model_loader.is_available("volunteer_ranking_model")
    regressor = ml_model_loader.get_model("volunteer_ranking_model")
    
    use_ml = trained_on_real and model_loaded and regressor
    mode = "ML_RECOMMENDATION" if use_ml else "COLD_START_RECOMMENDATION"
    
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
        
        # Double check capability keys (experience level can be experienceYears or experienceLevel)
        exp_val = vol.get("experienceYears") or vol.get("experienceLevel") or 2
        try:
            exp_years = float(exp_val)
        except Exception:
            exp_years = 2.0
            
        avg_resp = float(vol.get("avgResponseTime", 24.0)) 
        success = float(vol.get("successRate", 0.75)) 
        
        trained = 1.0 if vol.get("womenSupportTrained", False) else 0.0
        
        gender = vol.get("gender", "ANY").upper()
        gender_match = 1.0
        if prefer_woman:
            gender_match = 1.0 if gender == "FEMALE" else 0.0
            
        sensitive_case = 1.0 if vol.get("canHandleSensitiveCases", False) else 0.0
        past_cases = float(vol.get("pastCaseCount", active_cases * 3))
        avail = 1.0 if vol.get("availabilityStatus", "AVAILABLE") == "AVAILABLE" else 0.0
        
        score = 0.0
        reason_str = ""
        
        if use_ml:
            # ML Feature vector
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
                reason_str = f"ML Predicted Match Score: {int(score)}% using volunteer_ranking_model.onnx."
            except Exception as e:
                print(f"ML ranking prediction failed for volunteer {vol.get('name')}: {e}. Falling back to cold start.")
                use_ml = False # fallback to cold-start on failure
        
        if not use_ml:
            # Deterministic Cold-Start Score (max 100)
            # 1. Specialization Category Match: 35 points
            # 2. District Match: 25 points
            # 3. Language Match: 20 points
            # 4. Under workload capacity: 10 points
            # 5. Experience years: 5 points
            # 6. Gender match: 5 points
            score = (cat_match * 35.0) + (dist_match * 25.0) + (lang_match * 20.0)
            if active_cases < max_cases:
                score += 10.0
            score += min(5.0, exp_years * 0.5)
            score += (gender_match * 5.0)
            
            # Penalize unavailable volunteers
            if avail == 0.0:
                score = score * 0.2
                
            score = max(0.0, min(100.0, score))
            reason_str = f"Cold-Start Match Score: {int(score)}% based on capability matching rules."
            
        ranked.append({
            "id": vol.get("id"),
            "name": vol.get("name"),
            "gender": gender,
            "languagesKnown": langs,
            "matchScore": int(score),
            "experienceLevel": exp_years,
            "reason": reason_str,
            "recommendationMode": mode
        })
        
    # Sort by score descending
    ranked.sort(key=lambda x: x["matchScore"], reverse=True)
    return ranked
