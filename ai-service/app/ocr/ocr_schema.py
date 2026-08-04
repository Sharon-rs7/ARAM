from pydantic import BaseModel
from typing import List, Dict, Any

class DocumentVerifyResponseSchema(BaseModel):
    documentType: str
    ocrTextMasked: str
    ocrConfidence: float
    imageQualityScore: float
    verificationScore: float
    status: str
    reasons: List[str]
    errors: List[str]
    warnings: List[str]
    extractedFields: Dict[str, Any]
    engine: str
    modelVersion: str
