import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.auth import verify_internal_token
from app.mongo_context import get_ai_context, upsert_ai_context

router = APIRouter(dependencies=[Depends(verify_internal_token)])

from app.mongo_logger import mongo_manager

class ComplaintSyncRequest(BaseModel):
    complaintId: str
    status: str
    assignedGuideId: Optional[str] = None
    assignedGuideName: Optional[str] = None
    note: Optional[str] = None
    complexity: Optional[str] = None
    resolutionTime: Optional[float] = None
    feedbackScore: Optional[float] = None
    resolutionOutcome: Optional[str] = None
    guideRequested: Optional[bool] = None

@router.post("/complaint/sync")
def sync_complaint_status(request: ComplaintSyncRequest):
    try:
        context = get_ai_context(request.complaintId)
        if not context:
            # If the context doesn't exist yet, construct a placeholder to be resilient
            now_str = datetime.datetime.now().isoformat()
            context = {
                "complaintId": request.complaintId,
                "citizenId": None,
                "regionId": None,
                "originalText": "",
                "originalLanguage": "en",
                "englishProcessingText": "",
                "issues": [],
                "department": {"label": None, "confidence": 0.0},
                "priority": {"label": "MEDIUM", "confidence": 0.0},
                "sensitiveCase": False,
                "summary": "",
                "requiredDocuments": [],
                "documents": [],
                "ocrResults": [],
                "guideAssignment": {
                    "guideId": None,
                    "guideName": None,
                    "assignedAt": None
                },
                "statusHistory": [],
                "messages": [],
                "caseUpdates": [],
                "modelVersions": {},
                "createdAt": now_str,
                "updatedAt": now_str
            }
            
        now_str = datetime.datetime.now().isoformat()
        
        # 1. Update Guide assignment if provided
        if request.assignedGuideId is not None:
            context["guideAssignment"] = {
                "guideId": request.assignedGuideId,
                "guideName": request.assignedGuideName,
                "assignedAt": now_str
            }
            
        if request.guideRequested is not None:
            context["guideRequested"] = request.guideRequested
            
        # 2. Append status history (Ensuring idempotency)
        history = context.setdefault("statusHistory", [])
        if not history or history[-1].get("status") != request.status:
            history.append({
                "status": request.status,
                "timestamp": now_str,
                "note": request.note or f"Lifecycle transition to {request.status}."
            })
            
        upsert_ai_context(request.complaintId, context)

        # 3. Store historical case embedding on completion
        if request.status == "CLOSED_BY_USER" or request.resolutionOutcome:
            try:
                db = mongo_manager.get_db()
                if db is not None:
                    existing_emb = db.guide_case_embeddings.find_one({"complaintId": request.complaintId})
                    target_guide = request.assignedGuideId or context.get("guideAssignment", {}).get("guideId")
                    if not existing_emb and target_guide:
                        from app.services.embedding_service import embedding_service
                        text_to_embed = context.get("originalText", "")
                        embedding = [float(x) for x in embedding_service.encode([text_to_embed])[0]] if text_to_embed else [0.0] * 384
                        
                        embedding_doc = {
                            "complaintId": request.complaintId,
                            "guideId": str(target_guide),
                            "regionId": context.get("regionId") or "Chennai",
                            "category": context.get("department", {}).get("label") or "GENERAL_LEGAL_AID",
                            "department": context.get("department", {}).get("label") or "GENERAL_LEGAL_AID",
                            "embedding": embedding,
                            "resolutionOutcome": request.resolutionOutcome or "SUCCESS",
                            "resolutionTime": request.resolutionTime or 24.0,
                            "feedbackScore": request.feedbackScore or 5.0,
                            "complexity": request.complexity or "MEDIUM",
                            "modelVersion": "2.0-ELO",
                            "createdAt": now_str
                        }
                        db.guide_case_embeddings.insert_one(embedding_doc)
            except Exception as e:
                import traceback
                print("[SYNC EXCEPTION]")
                traceback.print_exc()
                raise e

        return {"status": "synchronized", "complaintId": request.complaintId}
    except Exception as e:
        import traceback
        print("[ROUTE EXCEPTION]")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
