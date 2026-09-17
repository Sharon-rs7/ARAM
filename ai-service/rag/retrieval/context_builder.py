from typing import Dict, Any, List
from rag.schemas.rag_response import RAGRetrievalResult, LegalChunkProvenance

def build_grounded_context(
    retrieval_result: RAGRetrievalResult,
    case_summary: str = "",
    max_chunks: int = 5
) -> str:
    """
    Constructs an explicit, grounded context block for Gemini synthesis.
    """
    blocks = []
    
    if case_summary:
        blocks.append(f"### CITIZEN CASE CONTEXT ###\n{case_summary}")
        
    blocks.append("### VERIFIED INDIAN STATUTES & LEGAL SOURCES (SOURCE OF TRUTH) ###")
    
    if not retrieval_result.top_k_chunks:
        blocks.append("NO VERIFIED LEGAL CONTEXT FOUND FOR THIS QUERY.")
    else:
        for idx, chunk in enumerate(retrieval_result.top_k_chunks[:max_chunks]):
            score = retrieval_result.scores[idx] if idx < len(retrieval_result.scores) else 0.0
            sec_str = f"Section: {chunk.section}" if chunk.section else "Section: Not specified"
            blocks.append(
                f"[Source Chunk #{idx + 1}]\n"
                f"Chunk ID: {chunk.chunk_id}\n"
                f"Act Name: {chunk.act_name}\n"
                f"{sec_str}\n"
                f"Relevance Score: {score}\n"
                f"Statute Text:\n{chunk.text.strip()}"
            )
            
    return "\n\n".join(blocks)

build_rag_context_block = build_grounded_context


