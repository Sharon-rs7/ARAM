from pydantic import BaseModel
from typing import Optional, List, Any, Union, Dict

class ComplaintAnalyzeRequest(BaseModel):
    complaintText: str
    language: Optional[str] = "en"
    district: Optional[str] = "Coimbatore"
    isSensitive: Optional[bool] = False
    preferredHelperGender: Optional[str] = "ANY"
    identityVisibility: Optional[str] = "VISIBLE"

class ChatAskRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    userRole: Optional[str] = "CITIZEN"
    complaintId: Optional[Any] = None
    complaintCustomId: Optional[str] = None
    sessionId: Optional[str] = None
    caseId: Optional[str] = None
    conversationId: Optional[str] = None
    citizenContext: Optional[Dict[str, Any]] = None

class VolunteerProfileSchema(BaseModel):
    id: int
    name: str
    gender: Optional[str] = "ANY"
    languagesKnown: Optional[Union[List[str], str]] = ["English"]
    district: Optional[str] = "Coimbatore"
    specializationCategories: Optional[Union[List[str], str]] = ["GENERAL_LEGAL_AID"]
    maxActiveCases: Optional[int] = 5
    currentActiveCases: Optional[int] = 0
    availabilityStatus: Optional[str] = "AVAILABLE"
    womenSupportTrained: Optional[bool] = False
    eloRating: Optional[int] = 1000
    averageRating: Optional[float] = 0.0
    feedbackCount: Optional[int] = 0
    supportsTanglish: Optional[bool] = False
    supportsHinglish: Optional[bool] = False

class VolunteerMatchRequest(BaseModel):
    complaintId: Optional[Any] = ""
    category: Optional[str] = "GENERAL_LEGAL_AID"
    language: Optional[str] = "en"
    preferWomanVolunteer: Optional[bool] = False
    district: Optional[str] = "Coimbatore"
    volunteers: List[VolunteerProfileSchema] = []

class DocumentRecommendRequest(BaseModel):
    complaintText: str
    category: str

class AuthorityRecommendRequest(BaseModel):
    complaintText: str
    category: str
