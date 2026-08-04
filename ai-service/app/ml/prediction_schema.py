from pydantic import BaseModel
from typing import List, Optional

class ComplaintMLRequest(BaseModel):
    title: str
    description: str
    languageHint: Optional[str] = "en"
    detectedLanguage: Optional[str] = ""
    district: Optional[str] = "Coimbatore"
    area: Optional[str] = ""
    sensitive: Optional[bool] = False
    voiceComplaintUsed: Optional[bool] = False
    preferredLegalGuideGender: Optional[str] = "ANY"
    existingComplaints: Optional[List[dict]] = []

class CategoryProbability(BaseModel):
    category: str
    probability: float

class ComplaintMLResponse(BaseModel):
    detectedLanguage: str
    languageConfidence: float
    normalizedText: str
    category: Optional[str] = None
    categoryConfidence: float
    topCategories: List[CategoryProbability]
    priority: Optional[str] = None
    priorityConfidence: float
    recommendedAuthority: Optional[str] = None
    authorityConfidence: float
    requiredDocuments: List[str]
    responseLanguage: str
    localizedMessage: str
    nextSteps: List[str]
    manualReviewRequired: bool
    manualReviewReasons: List[str]
    modelVersion: str
    headline: Optional[str] = ""
    plainSummary: Optional[str] = ""
    similarComplaintFound: bool
