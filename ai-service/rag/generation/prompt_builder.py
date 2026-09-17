import json
from typing import Dict, Any, List
from rag.schemas.rag_response import RAGRetrievalResult

SYSTEM_INSTRUCTION = """You are ARAM's legal-aid information assistant.
You MUST respond based strictly on the supplied verified legal context (retrievedLegalChunks) and structured ARAM taxonomy.

CRITICAL RULES:
1. Use ONLY the facts and provisions present in the retrievedLegalChunks.
2. DO NOT invent statutes, act names, section numbers, punishments, fines, or prison terms.
3. For every law cited in 'laws', specify the exact 'sourceChunkId' matching one of the retrieved chunks.
4. If retrievedLegalChunks is empty or contains no relevant statutes for the citizen's query, leave 'laws' empty, set 'humanReviewRequired' to true, and explain that verified legal sources are insufficient for this case in the citizen's language.
5. In 'punishment', only state penalty/punishment information if it is explicitly written in the retrieved statutory text. Otherwise, set details to 'Punishment/penalty information was not found in the verified sources retrieved for this case.' and available to false.
6. The problemUnderstanding, explanations in laws, and nextSteps MUST be written in the citizen's language (Tamil if language is 'ta', Hindi if 'hi', English if 'en'). Official Act names may remain in official English title.
7. Return valid JSON matching the exact required schema."""

def build_rag_prompt(
    query: str,
    language: str,
    category_id: str,
    category_name: str,
    recommended_authority: str,
    required_documents: List[str],
    retrieval_result: RAGRetrievalResult,
    case_summary: str = ""
) -> str:
    """
    Constructs the prompt containing citizen query, structured taxonomy parameters,
    and verified statutory chunks.
    """
    sources_summary = []
    for idx, c in enumerate(retrieval_result.top_k_chunks):
        score = retrieval_result.scores[idx] if idx < len(retrieval_result.scores) else 0.0
        sources_summary.append({
            "chunkId": c.chunk_id,
            "actName": c.act_name,
            "section": c.section,
            "relevanceScore": score,
            "statuteText": c.text.strip()
        })

    prompt_data = {
        "citizenQuery": query,
        "citizenLanguage": language,
        "caseSummary": case_summary,
        "structuredTaxonomy": {
            "categoryId": category_id,
            "categoryName": category_name,
            "authority": recommended_authority,
            "requiredDocuments": required_documents
        },
        "retrievedLegalChunks": sources_summary,
        "hasVerifiedContext": len(sources_summary) > 0 and retrieval_result.has_sufficient_context,
        "requiredJsonSchema": {
            "language": language,
            "problemUnderstanding": f"Accurate summary of the citizen's legal problem in {language}",
            "category": {"id": category_id, "name": category_name},
            "laws": [
                {
                    "actName": "Act name strictly from retrievedLegalChunks",
                    "section": "Section number from retrievedLegalChunks or null",
                    "provision": "Provision topic/title from retrievedLegalChunks",
                    "explanation": f"Clear explanation of this provision applied to citizen query in {language}",
                    "sourceChunkId": "Matching chunkId from retrievedLegalChunks"
                }
            ],
            "punishment": {
                "available": False,
                "details": "Punishment details ONLY if explicitly present in retrieved statuteText, otherwise 'Punishment/penalty information was not found in the verified sources retrieved for this case.'",
                "sourceChunkId": None
            },
            "recommendedAuthority": recommended_authority,
            "documents": required_documents,
            "nextSteps": [f"Actionable step 1 in {language}", f"Actionable step 2 in {language}"],
            "humanReviewRequired": len(sources_summary) == 0 or not retrieval_result.has_sufficient_context,
            "sources": [
                {"chunkId": "...", "actName": "...", "section": "...", "source": "Verified Statute"}
            ],
            "disclaimer": "This information is for general legal-aid guidance and is not a substitute for advice from a qualified legal professional."
        }
    }
    
    return json.dumps(prompt_data, indent=2, ensure_ascii=False)
