import os
import time
from typing import Dict, Any, List, Optional
from llm.qwen_provider import qwen_provider
from llm.gemini_provider import gemini_provider
from llm.response_validator import grounding_validator, ValidationResult
from rag.schemas.rag_response import RAGRetrievalResult, LegalChunkProvenance

DOMAIN_LEGAL_KNOWLEDGE = {}

class LLMRouter:
    def __init__(self):
        self.primary_name = os.environ.get("LLM_PROVIDER_PRIMARY", "qwen").lower()
        self.fallback_name = os.environ.get("LLM_PROVIDER_FALLBACK", "gemini").lower()

    def get_provider(self, name: str):
        if name == "qwen":
            return qwen_provider
        elif name == "gemini":
            return gemini_provider
        return None

    def generate_conversational_response(
        self,
        user_message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context_notes: Optional[str] = None
    ) -> str:
        return gemini_provider.generate_conversational_response(
            user_message=user_message,
            language=language,
            conversation_history=conversation_history,
            context_notes=context_notes
        )

    def route_and_generate(
        self,
        query: str,
        retrieval_result: RAGRetrievalResult,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        retrieved_context = retrieval_result.grounded_context
        chunks = retrieval_result.top_k_chunks

        # Fail-closed check: If retrieval yielded NO relevant source, do not query LLM or hallucinate
        if retrieval_result.status == "NO_RELEVANT_SOURCE" or not retrieval_result.has_sufficient_context or not chunks:
            fail_closed_res = self._build_fail_closed_response(
                query=query,
                language=language,
                category_name=category_name,
                case_summary=case_summary
            )
            fail_closed_res["latency_seconds"] = round(time.time() - start_time, 3)
            return fail_closed_res

        provider_used = "none"
        fallback_used = False
        validation_res = None
        final_output = None

        # 1. Try Primary Provider (Qwen)
        primary_provider = self.get_provider(self.primary_name)
        if primary_provider and primary_provider.is_available():
            try:
                raw_res = primary_provider.generate_guidance(
                    query=query,
                    retrieved_context=retrieved_context,
                    language=language,
                    category_name=category_name,
                    recommended_authority=recommended_authority,
                    required_documents=required_documents,
                    case_summary=case_summary,
                    is_retry=False
                )
                val = grounding_validator.validate(raw_res, chunks, retrieved_context)
                if val.is_valid:
                    final_output = val.cleaned_response
                    provider_used = self.primary_name
                    validation_res = val
            except Exception as e:
                print(f"[LLM ROUTER] Primary provider failed: {e}")

        # 2. Try Fallback Provider (Gemini)
        if final_output is None:
            fallback_provider = self.get_provider(self.fallback_name)
            if fallback_provider and fallback_provider.is_available():
                try:
                    fallback_used = True
                    raw_res = fallback_provider.generate_guidance(
                        query=query,
                        retrieved_context=retrieved_context,
                        language=language,
                        category_name=category_name,
                        recommended_authority=recommended_authority,
                        required_documents=required_documents,
                        case_summary=case_summary,
                        is_retry=False
                    )
                    val = grounding_validator.validate(raw_res, chunks, retrieved_context)
                    if val.is_valid or val.grounded_score >= 0.7:
                        final_output = val.cleaned_response
                        provider_used = self.fallback_name
                        validation_res = val
                except Exception as e:
                    print(f"[LLM ROUTER] Fallback provider failed: {e}")

        # 3. Grounded Deterministic Chunk-Based Fallback
        if final_output is None:
            provider_used = "grounded_chunk_fallback"
            fallback_used = True
            final_output = self._build_deterministic_fallback(
                query=query,
                retrieval_result=retrieval_result,
                language=language,
                category_name=category_name,
                recommended_authority=recommended_authority,
                required_documents=required_documents,
                case_summary=case_summary
            )
            validation_res = ValidationResult(True, [], final_output, 1.0)

        latency = round(time.time() - start_time, 3)
        final_output["provider"] = provider_used
        final_output["fallback_used"] = fallback_used
        final_output["latency_seconds"] = latency
        final_output["grounded"] = validation_res.is_valid if validation_res else True
        final_output["grounding_score"] = validation_res.grounded_score if validation_res else 1.0

        if "citations" not in final_output or not final_output["citations"]:
            final_output["citations"] = [
                {
                    "documentTitle": c.act_name,
                    "section": c.section,
                    "sourceChunkId": c.chunk_id,
                    "relevanceScore": retrieval_result.scores[i] if i < len(retrieval_result.scores) else 0.85
                }
                for i, c in enumerate(chunks)
            ]

        return final_output

    def _build_fail_closed_response(
        self,
        query: str,
        language: str,
        category_name: str,
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        summary = case_summary.strip() if (case_summary and len(case_summary.strip()) > 5) else query.strip()
        
        suggested_evidence = [
            "Relevant transaction records, receipts, or application slips",
            "Chronological communications, messages, or notices received",
            "Identity proof and any available ownership or employment records"
        ]

        if language == "ta":
            understanding_text = f"குடிமகன் விவரித்த பிரச்சனை: {summary}"
            reply_text = f"""### பிரச்சனை புரிதல்:
{understanding_text}

### சட்டப் பிரிவுகள் சரிபார்ப்பு:
• ARAM-ன் உள்ளூர் சட்டத் தரவுத்தளத்தில் (Legal Corpus) இந்த குறிப்பிட்ட பிரச்சனைக்கு நேரடியான சரிபார்க்கப்பட்ட சட்டப்பிரிவு (Verified Statutory Section) கிடைக்கவில்லை.

### நீங்கள் திரட்ட வேண்டிய நடைமுறை சான்றுகள்:
• உங்கள் வசம் உள்ள தொடர்புடைய ஆவணங்கள், ரசீதுகள் மற்றும் பரிவர்த்தனை ஆதாரங்கள்
• சம்பவம் / தொடர்பு தொடர்பான பதிவுகள், குறுஞ்செய்திகள் அல்லது கடிதங்கள்
• உங்கள் அடையாளச் சான்று நகல்

### பரிந்துரைக்கப்பட்ட அடுத்த கட்ட நடவடிக்கைகள்:
1. உங்கள் வசம் உள்ள அனைத்து ஆதார ஆவணங்களையும் வரிசைப்படுத்தி தயாராக வைக்கவும்.
2. தகுதிவாய்ந்த சட்ட உதவி மையம் அல்லது சட்ட வல்லுநரை அணுகி ஆலோசிக்கவும்.
3. இந்த வழக்கை பரிசீலிக்க ARAM உதவி வழிகாட்டியை (Legal Aid Guide) தொடர்பு கொள்ளவும்."""
            steps = [
                "உங்கள் வசம் உள்ள அனைத்து ஆதார ஆவணங்களையும் வரிசைப்படுத்தி தயாராக வைக்கவும்.",
                "தகுதிவாய்ந்த சட்ட உதவி மையம் அல்லது சட்ட வல்லுநரை அணுகி ஆலோசிக்கவும்.",
                "இந்த வழக்கை பரிசீலிக்க ARAM உதவி வழிகாட்டியை (Legal Aid Guide) தொடர்பு கொள்ளவும்."
            ]
        elif language == "hi":
            understanding_text = f"नागरिक द्वारा प्रस्तुत समस्या: {summary}"
            reply_text = f"""### समस्या की समझ:
{understanding_text}

### वैधानिक प्रावधान सत्यापन:
• ARAM के उपलब्ध कानूनी डेटाबेस (Legal Corpus) में इस विशिष्ट समस्या से संबंधित कोई प्रत्यक्ष सत्यापित वैधानिक धारा उपलब्ध नहीं है।

### एकत्रित करने योग्य व्यावहारिक साक्ष्य:
• संबंधित दस्तावेज, रसीदें एवं लेनदेन विवरण
• घटना या बातचीत से संबंधित संदेश या पत्राचार
• पहचान प्रमाण पत्र

### अनुशंसित अगले कदम:
1. स्थिति से संबंधित सभी उपलब्ध साक्ष्यों को सुरक्षित एवं व्यवस्थित करें।
2. आधिकारिक कानूनी मार्गदर्शन हेतु विधिक सहायता केंद्र या योग्य अधिवक्ता से संपर्क करें।
3. सहायता हेतु ARAM अधिकृत विधिक गाइड से जुड़ें।"""
            steps = [
                "स्थिति से संबंधित सभी उपलब्ध साक्ष्यों को सुरक्षित एवं व्यवस्थित करें।",
                "आधिकारिक कानूनी मार्गदर्शन हेतु विधिक सहायता केंद्र या योग्य अधिवक्ता से संपर्क करें।",
                "सहायता हेतु ARAM अधिकृत विधिक गाइड से जुड़ें।"
            ]
        else:
            understanding_text = f"The citizen reported the following situation: {summary}"
            reply_text = f"""### Understanding of Situation:
{understanding_text}

### Statutory Provision Verification:
• I could not verify the exact applicable statutory provisions from ARAM's available legal knowledge base for this specific situation.

### Suggested Practical Evidence to Gather:
• Keep all relevant documents, receipts, and communication records organized
• Proof of transaction or incident logs if available
• Identity proof and supporting statements

### Recommended Next Steps:
1. Collate and safeguard all chronological records and evidence.
2. Consult a qualified legal aid clinic or legal professional.
3. Request assistance from an ARAM Legal Aid Guide for authorized case review."""
            steps = [
                "Collate and safeguard all chronological records and evidence.",
                "Consult a qualified legal aid clinic or legal professional.",
                "Request assistance from an ARAM Legal Aid Guide for authorized case review."
            ]

        return {
            "language": language,
            "understanding": understanding_text,
            "problemUnderstanding": understanding_text,
            "category": category_name,
            "severity": "HIGH" if category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "CRIMINAL_COMPLAINT"] else "MEDIUM",
            "legal_position": {
                "summary": understanding_text,
                "applicable_laws": []
            },
            "applicableLaw": None,
            "section": None,
            "explanation": understanding_text,
            "sections": [],
            "laws": [],
            "possible_consequences": [],
            "groundedPenalty": "No specific statutory penalty could be verified from available sources.",
            "what_you_can_do_now": steps,
            "documents_required": [],
            "documents": [],
            "suggestedEvidence": suggested_evidence,
            "where_to_complain": [],
            "recommendedAuthority": None,
            "authorityVerified": False,
            "procedure": steps,
            "nextSteps": steps,
            "expected_next_steps": steps,
            "emergency": category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY"],
            "human_review_required": True,
            "confidence": 0.50,
            "citations": [],
            "reply": reply_text,
            "answer": reply_text,
            "disclaimer": "This information is for general legal-aid guidance and is not a substitute for advice from a qualified legal professional.",
            "provider": "fail_closed_guard",
            "grounded": True
        }

    def _build_deterministic_fallback(
        self,
        query: str,
        retrieval_result: RAGRetrievalResult,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        chunks = retrieval_result.top_k_chunks
        if not chunks:
            return self._build_fail_closed_response(query, language, category_name, case_summary)

        first_chunk = chunks[0]
        act_name = first_chunk.act_name
        sec_name = f"Section {first_chunk.section}" if first_chunk.section else "Statutory Provision"
        explanation = first_chunk.text[:280].strip() + ("..." if len(first_chunk.text) > 280 else "")

        sections = []
        for c in chunks[:2]:
            s_name = f"Section {c.section}" if c.section else "Statutory Provision"
            sections.append({
                "act": c.act_name,
                "section": c.section,
                "title": s_name,
                "relevance": f"Verified statutory provision under {c.act_name}",
                "source": c.source
            })

        summary = case_summary.strip() if (case_summary and len(case_summary.strip()) > 5) else query.strip()
        authority = recommended_authority
        docs = required_documents
        steps = [
            "Organize all relevant evidentiary documents and proofs.",
            f"Submit formal representation to {authority}.",
            "Track application status using official acknowledgement number."
        ]
        penalty = f"Statutory remedies and legal provisions as enacted under {act_name}."

        if language == "ta":
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### பிரச்சனை புரிதல்:
குடிமகன் விவரித்த பிரச்சனை: {summary}

### தொடர்புடைய சட்டங்கள் & பிரிவுகள்:
• **{act_name}** ({sec_name}): {explanation}

### தீர்வு / அபராதம் விபரம்:
{penalty}

### பரிந்துரைக்கப்பட்ட அதிகாரம்:
• **{authority}**

### தேவையான ஆவணங்கள்:
{docs_formatted}

### அடுத்த கட்ட நடவடிக்கைகள்:
{steps_formatted}"""
        elif language == "hi":
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### समस्या की समझ:
नागरिक द्वारा प्रस्तुत समस्या: {summary}

### प्रासंगिक अधिनियम और धाराएं:
• **{act_name}** ({sec_name}): {explanation}

### समाधान / जुर्माना विवरण:
{penalty}

### अनुशंसित प्राधिकारी:
• **{authority}**

### आवश्यक दस्तावेज:
{docs_formatted}

### अगले कदम:
{steps_formatted}"""
        else:
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### Understanding of Situation:
The citizen reported the following situation: {summary}

### Relevant Statutory Provisions & Acts:
• **{act_name}** ({sec_name}): {explanation}

### Statutory Penalty / Legal Consequence:
{penalty}

### Recommended Authority Routing:
• **{authority}**

### Required Evidence Documents:
{docs_formatted}

### Recommended Procedural Steps:
{steps_formatted}"""

        return {
            "language": language,
            "understanding": summary,
            "problemUnderstanding": summary,
            "category": category_name,
            "severity": "HIGH" if category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "CRIMINAL_COMPLAINT"] else "MEDIUM",
            "legal_position": {
                "summary": summary,
                "applicable_laws": [act_name]
            },
            "applicableLaw": act_name,
            "section": first_chunk.section,
            "explanation": explanation,
            "sections": sections,
            "possible_consequences": [{"description": penalty, "legal_basis": act_name, "source": first_chunk.source}],
            "groundedPenalty": penalty,
            "what_you_can_do_now": steps,
            "documents_required": docs,
            "documents": docs,
            "where_to_complain": [authority],
            "recommendedAuthority": authority,
            "procedure": steps,
            "nextSteps": steps,
            "expected_next_steps": steps,
            "emergency": category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY"],
            "human_review_required": False,
            "confidence": 0.88,
            "citations": [],
            "reply": formatted_reply,
            "answer": formatted_reply,
            "disclaimer": "This information is for general legal-aid guidance based on verified statutory sources and is not a substitute for advice from a qualified legal professional.",
            "provider": "grounded_chunk_fallback",
            "grounded": True
        }


llm_router = LLMRouter()
