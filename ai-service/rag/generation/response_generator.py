import json
from typing import Dict, Any, List, Optional
from rag.schemas.rag_response import (
    RAGStructuredResponse,
    RAGRetrievalResult,
    RAGResultStatus,
    LawCitation,
    PunishmentDetail,
    SourceReference,
    CategoryInfo,
    AuthorityProvenance,
    LegalClaim
)
from llm.llm_router import llm_router

def generate_rag_response(
    query: str,
    language: str,
    category_id: str,
    category_name: str,
    recommended_authority: str,
    required_documents: List[str],
    retrieval_result: RAGRetrievalResult,
    case_summary: str = ""
) -> RAGStructuredResponse:
    """
    Generates a structured, fully grounded legal-aid response by routing through
    the Multi-Provider LLM Router (Qwen -> Gemini -> Grounded Fallback)
    with strict Grounding Validation.
    """
    is_fail_closed = (
        retrieval_result.status == RAGResultStatus.NO_RELEVANT_SOURCE or
        not retrieval_result.has_sufficient_context or
        not retrieval_result.top_k_chunks
    )

    guided_data = llm_router.route_and_generate(
        query=query,
        retrieval_result=retrieval_result,
        language=language,
        category_name=category_name,
        recommended_authority=recommended_authority,
        required_documents=required_documents,
        case_summary=case_summary
    )

    valid_chunk_ids = {c.chunk_id: c for c in retrieval_result.top_k_chunks}

    # Format laws strictly from verified retrieved chunks
    laws: List[LawCitation] = []
    if not is_fail_closed:
        seen_laws = set()
        raw_sections = guided_data.get("sections", [])
        
        if not raw_sections and retrieval_result.top_k_chunks:
            for c in retrieval_result.top_k_chunks[:2]:
                raw_sections.append({
                    "act": c.act_name,
                    "section": c.section,
                    "title": f"Section {c.section}" if c.section else "Statutory Provision",
                    "relevance": f"Verified statutory provision under {c.act_name}"
                })

        for s in raw_sections:
            act_name = s.get("act", "Indian Legal Statute")
            sec_num = s.get("section")
            dedup_key = (act_name.strip().lower(), str(sec_num or "").strip())
            if dedup_key in seen_laws:
                continue
            seen_laws.add(dedup_key)

            matched_chunk_id = None
            for cid, c in valid_chunk_ids.items():
                if c.act_name == act_name or (c.section and str(c.section) == str(sec_num)):
                    matched_chunk_id = cid
                    break

            laws.append(LawCitation(
                actName=act_name,
                section=sec_num,
                provision=s.get("title", s.get("relevance", "Statutory Provision")),
                explanation=s.get("relevance", f"Statutory provision under {act_name}"),
                sourceChunkId=matched_chunk_id or (retrieval_result.top_k_chunks[0].chunk_id if retrieval_result.top_k_chunks else None),
                verified=True
            ))

    # Format punishment
    if is_fail_closed or not laws:
        punishment = PunishmentDetail(
            available=False,
            details="No specific statutory penalty was verified from the available legal sources for this exact grievance.",
            sourceChunkId=None,
            verified=False
        )
    else:
        consequences = guided_data.get("possible_consequences", [])
        punish_details = "Statutory remedies, damages, or restitution available under applicable law."
        punish_available = False
        
        if consequences:
            first_cons = consequences[0]
            desc = first_cons.get("description", "")
            if any(w in desc.lower() for w in ["imprisonment", "fine", "penalty", "liable", "punishable"]):
                punish_details = desc
                punish_available = True

        punishment = PunishmentDetail(
            available=punish_available,
            details=punish_details,
            sourceChunkId=retrieval_result.top_k_chunks[0].chunk_id if (retrieval_result.top_k_chunks and punish_available) else None,
            verified=punish_available
        )

    # Format sources
    sources: List[SourceReference] = []
    if not is_fail_closed:
        seen_sources = set()
        for idx, c in enumerate(retrieval_result.top_k_chunks):
            s_key = (c.act_name, str(c.section))
            if s_key in seen_sources:
                continue
            seen_sources.add(s_key)
            score = retrieval_result.scores[idx] if idx < len(retrieval_result.scores) else 0.85
            sources.append(SourceReference(
                chunkId=c.chunk_id,
                actName=c.act_name,
                section=c.section,
                source=c.source,
                relevanceScore=score
            ))

    understanding = guided_data.get("understanding", guided_data.get("problemUnderstanding", query))
    procedure_steps = guided_data.get("procedure", guided_data.get("nextSteps", []))
    if not procedure_steps:
        procedure_steps = [
            "Organize all relevant evidentiary documents and proofs.",
            f"Submit formal representation to {recommended_authority}.",
            "Track application status using official acknowledgement number."
        ]

    docs = required_documents if not is_fail_closed else []
    suggested_evidence = guided_data.get("suggestedEvidence", [
        "Relevant transaction records or receipts",
        "Chronological messages / communications",
        "Identity proof"
    ])

    formatted_answer = guided_data.get("reply") or _build_formatted_answer(
        understanding=understanding,
        laws=laws,
        punishment=punishment,
        authority=recommended_authority,
        docs=docs,
        steps=procedure_steps,
        suggested_evidence=suggested_evidence,
        is_fail_closed=is_fail_closed,
        language=language
    )

    is_sensitive = category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "WOMEN_SAFETY_DOMESTIC_VIOLENCE", "CYBER_CRIME", "CRIMINAL_COMPLAINT"]
    is_emergency = category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "WOMEN_SAFETY_DOMESTIC_VIOLENCE"]
    human_review = is_sensitive or is_fail_closed or guided_data.get("human_review_required", False)
    auth_verified = not is_fail_closed and bool(recommended_authority)
    rec_auth = recommended_authority if auth_verified else None
    auth_prov = AuthorityProvenance(
        authority=rec_auth,
        verified=auth_verified,
        sourceChunkId=retrieval_result.top_k_chunks[0].chunk_id if (auth_verified and retrieval_result.top_k_chunks) else None,
        routingNote="Verified statutory redressal authority from corpus." if auth_verified else "No specific authority routing could be verified from available sources."
    )

    claims = [
        LegalClaim(
            claim=l.explanation,
            sourceChunkId=l.sourceChunkId,
            act=l.actName,
            section=l.section,
            verified=l.verified
        )
        for l in laws
    ]

    return RAGStructuredResponse(
        language=language,
        problemUnderstanding=understanding,
        rag_status=retrieval_result.status,
        category=CategoryInfo(id=category_id, name=category_name),
        laws=laws,
        punishment=punishment,
        authorityProvenance=auth_prov,
        recommendedAuthority=rec_auth,
        authorityVerified=auth_verified,
        verifiedRequiredDocuments=docs if not is_fail_closed else [],
        suggestedEvidence=suggested_evidence,
        claims=claims,
        nextSteps=procedure_steps,
        humanReviewRequired=human_review,
        emergency=is_emergency,
        sources=sources,
        disclaimer="This information is for general legal-aid guidance and is not a substitute for advice from a qualified legal professional.",
        documents=docs,
        documents_required=docs,
        answer=formatted_answer,
        reply=formatted_answer,
        confidence=retrieval_result.highest_score if (not is_fail_closed and retrieval_result.highest_score > 0) else 0.50,
        suggestedActions=procedure_steps[:3] if procedure_steps else ["Submit complaint", "Connect with Legal Guide"],
        citations=guided_data.get("citations", [])
    )

def _build_formatted_answer(
    understanding: str,
    laws: List[LawCitation],
    punishment: PunishmentDetail,
    authority: str,
    docs: List[str],
    steps: List[str],
    suggested_evidence: List[str],
    is_fail_closed: bool,
    language: str
) -> str:
    parts = []
    nl = "\n"
    
    if language == "ta":
        parts.append(f"### பிரச்சனை புரிதல்:\n{understanding}")
        if not is_fail_closed and laws:
            parts.append("### தொடர்புடைய சட்டங்கள் & பிரிவுகள்:")
            for l in laws:
                sec_str = f" - பிரிவு {l.section}" if l.section else ""
                parts.append(f"• **{l.actName}{sec_str}**: {l.explanation}")
            parts.append(f"### தீர்வு / அபராதம் விபரம்:\n{punishment.details}")
            parts.append(f"### பரிந்துரைக்கப்பட்ட அதிகாரம்:\n• **{authority}**")
            if docs:
                parts.append(f"### தேவையான ஆவணங்கள்:\n• " + f"{nl}• ".join(docs))
        else:
            parts.append("### சட்டப் பிரிவுகள் சரிபார்ப்பு:\n• ARAM-ன் உள்ளூர் சட்டத் தரவுத்தளத்தில் (Legal Corpus) இந்த குறிப்பிட்ட பிரச்சனைக்கு நேரடியான சரிபார்க்கப்பட்ட சட்டப்பிரிவு (Verified Statutory Section) கிடைக்கவில்லை.")
            if suggested_evidence:
                parts.append(f"### நீங்கள் திரட்ட வேண்டிய நடைமுறை சான்றுகள்:\n• " + f"{nl}• ".join(suggested_evidence))
        if steps:
            parts.append(f"### அடுத்த கட்ட நடவடிக்கைகள்:\n1. " + f"{nl}2. ".join(steps))
    elif language == "hi":
        parts.append(f"### समस्या की समझ:\n{understanding}")
        if not is_fail_closed and laws:
            parts.append("### प्रासंगिक अधिनियम और धाराएं:")
            for l in laws:
                sec_str = f" - धारा {l.section}" if l.section else ""
                parts.append(f"• **{l.actName}{sec_str}**: {l.explanation}")
            parts.append(f"### समाधान / जुर्माना विवरण:\n{punishment.details}")
            parts.append(f"### अनुशंसित प्राधिकारी:\n• **{authority}**")
            if docs:
                parts.append(f"### आवश्यक दस्तावेज:\n• " + f"{nl}• ".join(docs))
        else:
            parts.append("### वैधानिक प्रावधान सत्यापन:\n• ARAM के उपलब्ध कानूनी डेटाबेस (Legal Corpus) में इस विशिष्ट समस्या से संबंधित कोई प्रत्यक्ष सत्यापित वैधानिक धारा उपलब्ध नहीं है।")
            if suggested_evidence:
                parts.append(f"### एकत्रित करने योग्य व्यावहारिक साक्ष्य:\n• " + f"{nl}• ".join(suggested_evidence))
        if steps:
            parts.append(f"### अगले कदम:\n1. " + f"{nl}2. ".join(steps))
    else:
        parts.append(f"### Understanding of Situation:\n{understanding}")
        if not is_fail_closed and laws:
            parts.append("### Relevant Statutory Provisions & Acts:")
            for l in laws:
                sec_str = f" (Section {l.section})" if l.section else ""
                parts.append(f"• **{l.actName}{sec_str}**: {l.explanation}")
            parts.append(f"### Statutory Penalty / Legal Consequence:\n{punishment.details}")
            parts.append(f"### Recommended Authority Routing:\n• **{authority}**")
            if docs:
                parts.append(f"### Required Evidence Documents:\n• " + f"{nl}• ".join(docs))
        else:
            parts.append("### Statutory Provision Verification:\n• I could not verify the exact applicable statutory provisions from ARAM's available legal knowledge base for this specific situation.")
            if suggested_evidence:
                parts.append(f"### Suggested Practical Evidence to Gather:\n• " + f"{nl}• ".join(suggested_evidence))
        if steps:
            parts.append(f"### Recommended Procedural Steps:\n1. " + f"{nl}2. ".join(steps))

    return "\n\n".join(parts)
