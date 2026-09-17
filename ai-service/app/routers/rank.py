import os
import numpy as np
import onnxruntime as ort
from fastapi import APIRouter, HTTPException, Depends
from app.auth import verify_internal_token
from pydantic import BaseModel
from typing import List, Optional
from app.config import settings
from app.ml.model_loader import ml_model_loader

router = APIRouter(prefix="/ai/legal-guides", tags=["Legal Guide AI Ranking"], dependencies=[Depends(verify_internal_token)])

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
    eloRating: Optional[int] = 1000
    feedbackCount: Optional[int] = 0

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
    recommendationMode: str = "COLD_START_RECOMMENDATION"

# Global ONNX InferenceSession
_onnx_session = None

def get_ranking_model():
    from app.ml.model_loader import ml_model_loader
    return ml_model_loader.get_model("volunteer_ranking_model")

@router.post("/rank", response_model=RankResponse)
def rank_legal_guides(request: RankRequest):
    volunteers_list = []
    for c in request.candidates:
        volunteers_list.append({
            "id": c.legalGuideId,
            "legalGuideId": c.legalGuideId,
            "languagesKnown": c.languagesKnown,
            "supportsTanglish": c.supportsTanglish,
            "supportsHinglish": c.supportsHinglish,
            "specializationCategories": c.expertiseCategories,
            "district": c.district,
            "currentActiveCases": c.currentWorkload,
            "maxActiveCases": c.maxCaseCapacity,
            "availabilityStatus": "AVAILABLE" if c.available else "UNAVAILABLE",
            "gender": "FEMALE" if (c.womenSupportTrained or getattr(c, 'gender', 'ANY') == 'FEMALE') else "ANY",
            "canHandleSensitiveCases": True,
            "eloRating": c.eloRating if c.eloRating is not None else 1000,
            "averageRating": c.averageRating,
            "feedbackCount": c.feedbackCount if c.feedbackCount is not None else 0
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
        language=request.detectedLanguage,
        prefer_woman=request.preferWomanGuide,
        district=request.district,
        volunteers=volunteers_list,
        sensitive=request.sensitive
    )

    recommended = []
    for rank_idx, cand in enumerate(matching_result["recommendedGuides"]):
        recommended.append(GuideMatchScore(
            legalGuideId=int(cand["guideId"]),
            predictedMatchScore=cand["finalScore"],
            rank=rank_idx + 1,
            reasonFactors=cand["matchingReasons"],
            manualReviewRequired=False
        ))

    return RankResponse(
        recommendedGuides=recommended,
        modelVersion="2.0-ELO-Matching",
        fallbackUsed=(matching_result["recommendationMode"] == "COLD_START_RECOMMENDATION"),
        recommendationMode=matching_result["recommendationMode"]
    )
