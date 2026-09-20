from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class RAGResultStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    NO_RELEVANT_SOURCE = "NO_RELEVANT_SOURCE"
    RAG_UNAVAILABLE = "RAG_UNAVAILABLE"

class LegalChunkProvenance(BaseModel):
    chunk_id: str
    document_id: str
    source: str
    act_name: str
    chapter: Optional[str] = None
    section: Optional[str] = None
    subsection: Optional[str] = None
    jurisdiction: str = "India"
    language: str = "en"
    text: str
    metadata: Dict[str, Any] = Field(default_factory=lambda: {"source_type": "statute", "country": "India"})

class LawCitation(BaseModel):
    actName: str
    section: Optional[str] = None
    provision: Optional[str] = None
    explanation: str
    sourceChunkId: Optional[str] = None
    verified: bool = True

class PunishmentDetail(BaseModel):
    available: bool = False
    details: str = "No specific statutory penalty was verified from the available legal sources for this exact grievance."
    sourceChunkId: Optional[str] = None
    verified: bool = False

class AuthorityProvenance(BaseModel):
    authority: Optional[str] = None
    verified: bool = False
    sourceChunkId: Optional[str] = None
    routingNote: str = "No specific authority routing could be verified from available sources."

class LegalClaim(BaseModel):
    claim: str
    sourceChunkId: Optional[str] = None
    act: Optional[str] = None
    section: Optional[str] = None
    verified: bool = False

class SourceReference(BaseModel):
    chunkId: str
    actName: str
    section: Optional[str] = None
    source: str = "Verified Indian Statute"
    relevanceScore: float = 0.0

class CategoryInfo(BaseModel):
    id: str = "C10"
    name: str = "GENERAL_LEGAL_AID"

class RAGStructuredResponse(BaseModel):
    language: str = "en"
    problemUnderstanding: str
    rag_status: RAGResultStatus = RAGResultStatus.NO_RELEVANT_SOURCE
    category: CategoryInfo = Field(default_factory=CategoryInfo)
    laws: List[LawCitation] = Field(default_factory=list)
    punishment: PunishmentDetail = Field(default_factory=PunishmentDetail)
    authorityProvenance: AuthorityProvenance = Field(default_factory=AuthorityProvenance)
    recommendedAuthority: Optional[str] = None
    authorityVerified: bool = False
    verifiedRequiredDocuments: List[str] = Field(default_factory=list)
    suggestedEvidence: List[str] = Field(default_factory=list)
    claims: List[LegalClaim] = Field(default_factory=list)
    nextSteps: List[str] = Field(default_factory=list)
    humanReviewRequired: bool = False
    emergency: bool = False
    sources: List[SourceReference] = Field(default_factory=list)
    disclaimer: str = "This information is for general legal-aid guidance and is not a substitute for advice from a qualified legal professional."
    
    # Backward compatibility with existing frontend/API contracts
    documents: List[str] = Field(default_factory=list)
    documents_required: List[str] = Field(default_factory=list)
    answer: Optional[str] = None
    reply: Optional[str] = None
    confidence: float = 0.85
    suggestedActions: List[str] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)

class RAGRetrievalResult(BaseModel):
    query: str
    detected_language: str
    retrieval_query: str
    top_k_chunks: List[LegalChunkProvenance]
    scores: List[float]
    highest_score: float
    grounded_context: str
    has_sufficient_context: bool
    status: RAGResultStatus = RAGResultStatus.NO_RELEVANT_SOURCE
    diagnostics: Optional[Dict[str, Any]] = None

    def __len__(self) -> int:
        return len(self.top_k_chunks) if self.top_k_chunks is not None else 0

    def __bool__(self) -> bool:
        return bool(self.top_k_chunks)
