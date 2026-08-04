import os
import numpy as np
import onnxruntime as ort
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.config import settings

router = APIRouter(prefix="/ai/legal-guides", tags=["Legal Guide AI Ranking"])

class CandidateSchema(BaseModel):
    legalGuideId: int
    languagesKnown: List[str]
    supportsTanglish: bool
    supportsHinglish: bool
    expertiseCategories: List[str]
    district: str
    currentWorkload: int
    maxCaseCapacity: int
    experienceYears: int
    creditScore: int
    levelNumber: int
    averageRating: float
    adminQualityScore: int
    womenSupportTrained: bool
    available: bool

class RankRequest(BaseModel):
    complaintId: Optional[str] = ""
    category: str
    priority: str
    detectedLanguage: str
    district: str
    sensitive: bool
    preferWomanGuide: bool
    candidates: List[CandidateSchema]

class GuideMatchScore(BaseModel):
    legalGuideId: int
    predictedMatchScore: float
    rank: int
    reasonFactors: List[str]
    manualReviewRequired: bool

class RankResponse(BaseModel):
    recommendedGuides: List[GuideMatchScore]
    modelVersion: str
    fallbackUsed: bool

# Global ONNX InferenceSession
_onnx_session = None

def get_ranking_model():
    global _onnx_session
    if _onnx_session is not None:
        return _onnx_session
    
    model_path = os.path.join(settings.MODEL_DIR, "volunteer_ranking_model.onnx")
    if os.path.exists(model_path):
        try:
            _onnx_session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
            print("[ONNX LOADED] Volunteer Ranking Session initialized.")
            return _onnx_session
        except Exception as e:
            print(f"Error loading ONNX ranking model: {e}")
            return None
    return None

@router.post("/rank", response_model=RankResponse)
def rank_legal_guides(request: RankRequest):
    session = get_ranking_model()
    fallback = (session is None)
    
    scored_candidates = []
    
    for c in request.candidates:
        lang_match = 0
        req_lang = request.detectedLanguage.lower()
        if req_lang in [lk.lower() for lk in c.languagesKnown]:
            lang_match = 1
        elif req_lang in ["ta-en", "tanglish"] and c.supportsTanglish:
            lang_match = 1
        elif req_lang in ["hi-en", "hinglish"] and c.supportsHinglish:
            lang_match = 1
        
        cat_match = 1 if request.category.upper() in [ec.upper() for ec in c.expertiseCategories] else 0
        dist_match = 1 if request.district.lower() == c.district.lower() else 0
        gender_match = 1 if (not request.preferWomanGuide or c.womenSupportTrained) else 0
        
        workload = c.currentWorkload
        capacity = max(1, c.maxCaseCapacity)
        
        reasons = []
        if lang_match == 1: reasons.append("Language match")
        if cat_match == 1: reasons.append("Category expertise")
        if workload / capacity < 0.5: reasons.append("Low workload")
        if c.levelNumber >= 3: reasons.append("Trusted level")
        if c.womenSupportTrained and request.sensitive: reasons.append("Women support trained")
        if dist_match == 1: reasons.append("Local guide")
            
        if not c.available:
            score = 0.0
        elif workload >= capacity:
            score = 10.0
        else:
            if not fallback and session is not None:
                try:
                    features = np.array([[
                        float(cat_match),
                        float(lang_match),
                        float(dist_match),
                        float(workload),
                        float(capacity),
                        float(c.experienceYears),
                        24.0,
                        float(c.adminQualityScore / 100.0 if c.adminQualityScore > 0 else 0.8),
                        float(1 if c.womenSupportTrained else 0),
                        float(gender_match),
                        float(1 if request.sensitive else 0),
                        float(workload * 3 + 10),
                        float(1 if c.available else 0)
                    ]], dtype=np.float32)
                    
                    input_name = session.get_inputs()[0].name
                    output_names = [o.name for o in session.get_outputs()]
                    res = session.run(output_names, {input_name: features})
                    raw_score = float(res[0].flat[0])
                    score = max(0.0, min(100.0, raw_score)) / 100.0
                except Exception as e:
                    print(f"ONNX ranking inference error: {e}")
                    fallback = True
            
            if fallback:
                base_score = 30.0
                if cat_match == 1: base_score += 25.0
                if lang_match == 1: base_score += 15.0
                if dist_match == 1: base_score += 10.0
                if gender_match == 1: base_score += 10.0
                if c.womenSupportTrained and request.sensitive: base_score += 5.0
                ratio = workload / capacity
                base_score -= ratio * 10.0
                base_score += min(5.0, c.experienceYears * 0.4)
                base_score += (c.averageRating / 5.0) * 5.0
                base_score += c.levelNumber * 2.0
                score = max(0.0, min(100.0, base_score)) / 100.0

        manual_review = (c.creditScore == 0 or c.experienceYears == 0)
        
        scored_candidates.append({
            "legalGuideId": c.legalGuideId,
            "predictedMatchScore": round(float(score), 3),
            "reasons": reasons,
            "manualReviewRequired": manual_review
        })
        
    scored_candidates.sort(key=lambda x: x["predictedMatchScore"], reverse=True)
    
    recommended = []
    for rank_idx, cand in enumerate(scored_candidates):
        recommended.append(GuideMatchScore(
            legalGuideId=cand["legalGuideId"],
            predictedMatchScore=cand["predictedMatchScore"],
            rank=rank_idx + 1,
            reasonFactors=cand["reasons"],
            manualReviewRequired=cand["manualReviewRequired"]
        ))
        
    return RankResponse(
        recommendedGuides=recommended,
        modelVersion="1.0-ONNX-Volunteer",
        fallbackUsed=fallback
    )
