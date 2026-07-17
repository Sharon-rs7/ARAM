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
