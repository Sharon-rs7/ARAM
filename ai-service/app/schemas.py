from pydantic import BaseModel
from typing import Optional, List

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
    complaintId: Optional[int] = None

class VolunteerProfileSchema(BaseModel):
    id: int
    name: str
    gender: str
    languagesKnown: List[str]
    district: str
    specializationCategories: List[str]
    maxActiveCases: Optional[int] = 5
    currentActiveCases: Optional[int] = 0
    availabilityStatus: Optional[str] = "AVAILABLE"
    womenSupportTrained: Optional[bool] = False

class VolunteerMatchRequest(BaseModel):
    category: str
    language: str
    preferWomanVolunteer: bool
    district: str
    volunteers: List[VolunteerProfileSchema]

class DocumentRecommendRequest(BaseModel):
    complaintText: str
    category: str

class AuthorityRecommendRequest(BaseModel):
    complaintText: str
    category: str
