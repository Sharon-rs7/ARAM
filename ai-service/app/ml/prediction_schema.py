from pydantic import BaseModel
from typing import List, Optional

class ComplaintMLRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    text: Optional[str] = ""
    languageHint: Optional[str] = "en"
    detectedLanguage: Optional[str] = ""
    district: Optional[str] = "Coimbatore"
    area: Optional[str] = ""
    sensitive: Optional[bool] = False
    voiceComplaintUsed: Optional[bool] = False
    preferredLegalGuideGender: Optional[str] = "ANY"
    existingComplaints: Optional[List[dict]] = []
    complaintId: Optional[str] = ""
    citizenId: Optional[int] = None
    regionId: Optional[str] = ""

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
    problemTitle: Optional[str] = ""
    plainSummary: Optional[str] = ""
    similarComplaintFound: bool
    primaryCategory: Optional[str] = None
    detectedIssues: Optional[List[str]] = []
    urgencyFlags: Optional[List[str]] = []
    complexity: Optional[str] = "MEDIUM"
    recommendedRouting: Optional[str] = "District Legal Services Authority"
    recommendationMode: Optional[str] = "COLD_START_RECOMMENDATION"
    categoryPredictionSource: Optional[str] = "FALLBACK / NON-ML"
    priorityPredictionSource: Optional[str] = "DATA_REQUIRED"
    complexityPredictionSource: Optional[str] = "DATA_REQUIRED"
    authorityPredictionSource: Optional[str] = "DATA_REQUIRED"
    trainingFeedbackSchema: Optional[dict] = None
    complaintId: Optional[str] = ""
    citizenId: Optional[int] = None
    regionId: Optional[str] = ""
    categoriesGenuinelyTrained: Optional[List[str]] = []
    caseSummary: Optional[dict] = None
