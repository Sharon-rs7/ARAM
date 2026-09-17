import datetime
from app.mongo_logger import mongo_manager

def get_ai_context(complaint_id: str) -> dict:
    db = mongo_manager.get_db()
    if db is None:
        return None
    try:
        return db.case_ai_context.find_one({"complaintId": complaint_id})
    except Exception as e:
        print(f"Error fetching AI Case Context: {e}")
        return None

def upsert_ai_context(complaint_id: str, context_data: dict) -> dict:
    db = mongo_manager.get_db()
    if db is None:
        return None
    try:
        now_str = datetime.datetime.now().isoformat()
        
        # Enforce unique complaintId and timestamp updates
        existing = get_ai_context(complaint_id)
        if existing:
            context_data["updatedAt"] = now_str
            context_data["createdAt"] = existing.get("createdAt", now_str)
            db.case_ai_context.replace_one({"complaintId": complaint_id}, context_data)
        else:
            context_data["createdAt"] = now_str
            context_data["updatedAt"] = now_str
            db.case_ai_context.insert_one(context_data)
            
        # Remove MongoDB ObjectId if present for serialization safety
        if "_id" in context_data:
            del context_data["_id"]
            
        return context_data
    except Exception as e:
        print(f"Error upserting AI Case Context: {e}")
        return None

def create_initial_context(
    complaint_id: str,
    citizen_id: int,
    region_id: str,
    original_text: str,
    original_lang: str,
    analysis: dict
) -> dict:
    now_str = datetime.datetime.now().isoformat()
    
    # Check if we have DATA_REQUIRED flags to set dataStatus
    prio_src = analysis.get("priorityPredictionSource", "DATA_REQUIRED")
    comp_src = analysis.get("complexityPredictionSource", "DATA_REQUIRED")
    auth_src = analysis.get("authorityPredictionSource", "DATA_REQUIRED")
    
    if "DATA_REQUIRED" in [prio_src, comp_src, auth_src]:
        data_status = "DATA_REQUIRED"
    elif analysis.get("categoryPredictionSource") == "FALLBACK / NON-ML":
        data_status = "FALLBACK"
    else:
        data_status = "READY"
        
    case_summary = analysis.get("caseSummary") or {}
    loc_data = case_summary.get("location") or {}
    
    # Map the FastAPI ComplaintMLResponse mapping to the logical MongoDB context
    context = {
        "complaintId": complaint_id,
        "complaintCustomId": complaint_id,
        "citizenId": citizen_id,
        "regionId": region_id,
        "language": original_lang,
        "category": analysis.get("category"),
        "complexity": analysis.get("complexity", "DATA_REQUIRED"),
        "dataStatus": data_status,
        "aiAnalysis": analysis,
        
        # New Case Summary Stage additions
        "guideRequested": False,
        "caseSummary": case_summary.get("whatHappened", ""),
        "recommendedActions": case_summary.get("actionPlan", []),
        "requiredEvidence": case_summary.get("evidenceNeeded", []),
        "caseLocation": loc_data.get("name", ""),
        "locationSource": "district_default" if "district" in loc_data.get("name", "").lower() else "user_provided",
        "latitude": loc_data.get("latitude", 13.0827),
        "longitude": loc_data.get("longitude", 80.2707),
        
        "originalText": original_text,
        "originalLanguage": original_lang,
        "englishProcessingText": analysis.get("normalizedText", ""),
        "issues": analysis.get("detectedIssues", [analysis.get("category")]),
        "department": {
            "label": analysis.get("recommendedRouting", analysis.get("recommendedAuthority")),
            "confidence": analysis.get("authorityConfidence", 0.0)
        },
        "priority": {
            "label": analysis.get("priority"),
            "confidence": analysis.get("priorityConfidence", 0.0)
        },
        "sensitiveCase": analysis.get("priority") == "CRITICAL" or any("SENSITIVE" in str(x) for x in analysis.get("urgencyFlags", [])),
        "summary": analysis.get("plainSummary", ""),
        "requiredDocuments": analysis.get("requiredDocuments", []),
        "documents": [],
        "ocrResults": [],
        "guideAssignment": {
            "guideId": None,
            "guideName": None,
            "assignedAt": None
        },
        "statusHistory": [
            {
                "status": "SUBMITTED",
                "timestamp": now_str,
                "note": "Initial submission and AI triage analysis."
            }
        ],
        "messages": [],
        "caseUpdates": [],
        "modelVersions": {
            "classifier": analysis.get("modelVersion", "1.0.0"),
            "recommendationMode": analysis.get("recommendationMode", "COLD_START_RECOMMENDATION")
        },
        "createdAt": now_str,
        "updatedAt": now_str
    }
    
    # If context already exists, preserve historical fields
    existing = get_ai_context(complaint_id)
    if existing:
        for k in ["documents", "ocrResults", "guideAssignment", "statusHistory", "messages", "caseUpdates", "createdAt", "guideRequested", "caseSummary", "recommendedActions", "requiredEvidence", "caseLocation", "locationSource", "latitude", "longitude"]:
            if k in existing:
                context[k] = existing[k]
                
    return upsert_ai_context(complaint_id, context)
