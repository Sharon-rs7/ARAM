import time
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.auth import verify_internal_token
from app.mongo_logger import log_ai_action
from app.mongo_context import get_ai_context
from rag.retrieval.retriever import legal_retriever
from rag.retrieval.context_builder import build_grounded_context as build_rag_context_block
from llm.llm_router import llm_router
from app.safety_filter import DISCLAIMER

router = APIRouter()

from app.chatbot_engine import ask_chatbot_engine

class CaseAssistantRequest(BaseModel):
    complaintId: Optional[Any] = None
    complaintCustomId: Optional[str] = None
    message: Optional[str] = None
    userQuery: Optional[str] = None
    query: Optional[str] = None
    caseTitle: Optional[str] = None
    caseDescription: Optional[str] = None
    userRole: Optional[str] = "GUIDE"
    language: Optional[str] = "en"
    district: Optional[str] = "Coimbatore"
    caseSummary: Optional[str] = None
    category: Optional[str] = None
    evidenceFindings: Optional[List[Dict[str, Any]]] = None
    conversationHistory: Optional[List[Dict[str, Any]]] = None
    citizenContext: Optional[Dict[str, Any]] = None

@router.post("/ai/case-assistant", dependencies=[Depends(verify_internal_token)])
@router.post("/case-assistant", dependencies=[Depends(verify_internal_token)])
def case_assistant_endpoint(
    request: CaseAssistantRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_district: Optional[str] = Header(None, alias="X-User-District")
):
    try:
        user_role = x_user_role or request.userRole or "GUIDE"
        user_district = x_user_district or request.district or "Coimbatore"
        query_msg = (request.message or request.userQuery or request.query or "").strip()
        if not query_msg:
            query_msg = f"Provide legal aid action guidance for: {request.caseTitle or ''} {request.caseDescription or ''}".strip()
        complaint_id = request.complaintId

        if request.citizenContext or user_role == "CITIZEN":
            return ask_chatbot_engine(
                message=query_msg,
                language=request.language,
                user_role=user_role,
                complaint_id=complaint_id,
                citizen_context=request.citizenContext,
                complaint_custom_id=request.complaintCustomId
            )

        # 1. Fetch Case Context from Mongo if complaintId provided
        mongo_ctx = None
        if complaint_id:
            mongo_ctx = get_ai_context(str(complaint_id))

        # Merge facts
        category = request.category or (mongo_ctx.get("category") if mongo_ctx else "GENERAL_LEGAL_AID")
        case_summary = request.caseSummary or (mongo_ctx.get("caseSummary") if mongo_ctx else "")
        if not case_summary and mongo_ctx:
            case_summary = mongo_ctx.get("originalText") or mongo_ctx.get("summary") or ""

        # Evidence
        evidence_list = request.evidenceFindings or []
        required_docs = (mongo_ctx.get("requiredEvidence") if mongo_ctx else []) or []
        
        # 2. Targeted RAG Retrieval using combined case context
        combined_rag_query = f"{category}: {case_summary} — {query_msg}"
        retrieval_res = legal_retriever.retrieve(
            query=combined_rag_query,
            category=category,
            user_state="Tamil Nadu",
            top_k=5,
            threshold=0.40,
            language_override=request.language
        )

        # 3. Formulate Answer based on question type
        q_lower = query_msg.lower()
        lang = (request.language or "en").lower()
        is_ta = lang.startswith("ta") or any(k in q_lower for k in ["tamil", "enna", "sollu", "irukku", "evvalavu"])

        missing_docs = []
        if required_docs:
            uploaded_types = [str(d.get("documentType", "")).lower() for d in evidence_list]
            for rd in required_docs:
                if not any(rd.lower() in ut or ut in rd.lower() for ut in uploaded_types):
                    missing_docs.append(rd)

        # Copilot question analysis
        suggested_actions = []
        copilot_answer = ""
        provider_used = "rag_case_copilot"

        if any(k in q_lower for k in ["missing", "document", "evidence", "proof", "ஆவணம்", "சான்று"]):
            if missing_docs:
                if is_ta:
                    copilot_answer = f"📌 **வழக்கிற்கு இன்னும் சமர்ப்பிக்கப்படாத முக்கிய ஆவணங்கள்:**\n\n" + "\n".join([f"- {d}" for d in missing_docs]) + "\n\nமனுதாரரிடம் 'Request Documents' மூலம் இவற்றை கோரலாம்."
                else:
                    copilot_answer = f"📌 **Missing / Pending Required Documents for this Case:**\n\n" + "\n".join([f"- {d}" for d in missing_docs]) + "\n\n**Recommendation:** Use the 'Request Additional Document' action to notify the citizen."
                suggested_actions = ["Request Missing Documents via Portal", "Verify Uploaded Evidence Quality"]
            else:
                if is_ta:
                    copilot_answer = "✅ வழக்கிற்கு தேவையான அனைத்து முதன்மை ஆவணங்களும் சமர்ப்பிக்கப்பட்டுள்ளன. பதிவேற்றப்பட்ட ஆவணங்களின் சரிபார்ப்பு நிலையை சரிபார்க்கவும்."
                else:
                    copilot_answer = "✅ All baseline required documents have been uploaded by the citizen. Review the verification confidence and extracted fields below."
                suggested_actions = ["Review Verified Evidence", "Proceed to Action Plan"]

        elif any(k in q_lower for k in ["summarize evidence", "uploaded evidence", "சான்று சுருக்கம்"]):
            if evidence_list:
                doc_lines = []
                for doc in evidence_list:
                    doc_type = doc.get("documentType") or doc.get("fileName") or "Document"
                    status = doc.get("verificationStatus") or doc.get("status") or "UPLOADED"
                    score = doc.get("verificationScore") or doc.get("confidence") or "N/A"
                    doc_lines.append(f"- **{doc_type}**: Status `{status}`, Confidence `{score}`")
                
                if is_ta:
                    copilot_answer = f"📄 **பதிவேற்றப்பட்ட ஆவணங்களின் சுருக்கம் ({len(evidence_list)} ஆவணங்கள்):**\n\n" + "\n".join(doc_lines)
                else:
                    copilot_answer = f"📄 **Uploaded Evidence Summary ({len(evidence_list)} documents):**\n\n" + "\n".join(doc_lines)
                suggested_actions = ["Inspect Document Extracted Fields", "Request Clear Scan if Status Unclear"]
            else:
                copilot_answer = "மனுதாரர் இதுவரை எந்த ஆவணத்தையும் பதிவேற்றவில்லை." if is_ta else "No evidence documents have been uploaded by the citizen for this case yet."
                suggested_actions = ["Send Document Request to Citizen"]

        elif any(k in q_lower for k in ["summarize", "case summary", "வழக்கு சுருக்கம்", "பற்றி"]):
            if is_ta:
                copilot_answer = f"📋 **வழக்கு சுருக்கம் (ARAM-{complaint_id or 'N/A'}):**\n\n- **பிரிவு**: {category}\n- **மாவட்ட எல்லை**: {user_district}\n- **விவரம்**: {case_summary or 'விவரங்கள் மதிப்பீட்டில் உள்ளன.'}\n- **நிலை**: வழக்கறிஞர் / வழிகாட்டி ஆய்வில் உள்ளது."
            else:
                copilot_answer = f"📋 **Case Overview (ARAM-{complaint_id or 'N/A'}):**\n\n- **Category**: {category}\n- **Jurisdiction**: {user_district}, Tamil Nadu\n- **Case Facts**: {case_summary or 'Case details undergoing assessment.'}\n- **Status**: Under Volunteer / Legal Guide Review."
            suggested_actions = ["Review Timeline", "Formulate Action Plan"]

        elif any(k in q_lower for k in ["authority", "department", "office", "அதிகாரி", "துறை"]):
            dept_name = "District Legal Services Authority (DLSA)"
            if mongo_ctx and mongo_ctx.get("department", {}).get("label"):
                dept_name = mongo_ctx.get("department", {}).get("label")
            elif "LABOUR" in category:
                dept_name = "Labour Commissioner Office / Labour Court"
            elif "CONSUMER" in category:
                dept_name = "District Consumer Disputes Redressal Commission (DCDRC)"
            elif "CYBER" in category:
                dept_name = "Cyber Crime Cell (1930 / cybercrime.gov.in)"
            elif "PROPERTY" in category or "TENANT" in category:
                dept_name = "Tahsildar / RDO / Rent Tribunal"

            if is_ta:
                copilot_answer = f"🏛️ **பரிந்துரைக்கப்படும் அதிகாரம் / துறை:**\n\n**{dept_name}**\n\nஇந்த மனுவின் தன்மைக்கு ஏற்ப முதன்மை மனுவை இந்த அதிகார வரம்பில் சமர்ப்பிக்கலாம்."
            else:
                copilot_answer = f"🏛️ **Competent Authority / Redressal Body:**\n\n**{dept_name}**\n\nBased on statutory jurisdiction, the citizen's grievance lies within the competence of this authority."
            suggested_actions = [f"Refer Case to {dept_name}", "Generate Formal Representation"]

        elif any(k in q_lower for k in ["next step", "procedural step", "what to do", "அடுத்த கட்ட நடவடிக்கை"]):
            if is_ta:
                copilot_answer = f"🎯 **அடுத்த கட்ட நடைமுறை வழிகாட்டல்:**\n1. சமர்ப்பிக்கப்படாத ஆவணங்களை மனுதாரரிடம் கோருங்கள்.\n2. ஆவணங்கள் சரிபார்க்கப்பட்ட பின் முறைப்படியான மனு வரைவை தயார் செய்யுங்கள்.\n3. உரிய அதிகார அமைப்பிற்கு (Authority) மனுவை சமர்ப்பிக்க வழிகாட்டவும்."
            else:
                copilot_answer = f"🎯 **Recommended Next Procedural Steps:**\n1. Review pending evidence checklists and request any missing proof.\n2. Verify the timeline and statutory limitation periods from the cited acts.\n3. Assist the citizen with drafting a formal representation to the recommended authority.\n4. Update the case status to `ACTION_RECOMMENDED` or `REFERRED_TO_AUTHORITY`."
            suggested_actions = ["Update Case Status", "Send Citizen Next Steps via Chat"]

        else:
            # Generate grounded legal explanation using the LLM Router
            try:
                llm_output = llm_router.route_and_generate(
                    query=query_msg,
                    retrieval_result=retrieval_res,
                    language="ta" if is_ta else "en",
                    category_name=category,
                    recommended_authority="District Legal Services Authority",
                    required_documents=required_docs,
                    case_summary=case_summary
                )
                copilot_answer = llm_output.get("plainExplanation") or llm_output.get("understanding") or str(llm_output)
                provider_used = llm_output.get("provider", "llm_router")
                suggested_actions = ["Discuss Grounded Legal Rights with Citizen", "Document Legal Advice in Case Notes"]
            except Exception as e:
                copilot_answer = f"Verified Statutory Provisions for {category}:\n" + retrieval_res.grounded_context[:400]
                provider_used = "deterministic_fallback"

        # Citations from RAG chunks
        citations = [
            {
                "documentTitle": c.act_name,
                "section": c.section,
                "sourceChunkId": c.chunk_id,
                "relevanceScore": retrieval_res.scores[i] if i < len(retrieval_res.scores) else 0.85
            }
            for i, c in enumerate(retrieval_res.top_k_chunks)
        ]

        response_payload = {
            "complaintId": complaint_id,
            "question": query_msg,
            "answer": copilot_answer,
            "citations": citations,
            "suggestedActions": suggested_actions,
            "missingDocuments": missing_docs,
            "category": category,
            "provider": provider_used,
            "grounded": True,
            "disclaimer": DISCLAIMER
        }

        # Log action to MongoDB
        log_ai_action("case_assistant_logs", response_payload)

        return response_payload

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
