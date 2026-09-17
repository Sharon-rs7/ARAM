import re
from typing import List, Dict, Any

# Common legal section heading regex patterns
SECTION_REGEX = re.compile(
    r'(?:\n|\A)(?:Section\s+|Sec\.\s*|\b(?=\d+\.\s+[A-Z]))(\d+[A-Z]?)\.?\s*([^\n\.\—\-]+)?',
    re.IGNORECASE
)
CHAPTER_REGEX = re.compile(
    r'(?:\n|\A)(CHAPTER\s+[IVXLCDM\d]+[^\n]*)',
    re.IGNORECASE
)

def chunk_document_structure_aware(
    doc: Dict[str, Any],
    min_tokens: int = 100,
    max_tokens: int = 700,
    overlap_tokens: int = 50
) -> List[Dict[str, Any]]:
    """
    Splits legal documents using structural awareness (Act, Chapter, Section, Subsection),
    preserving legal provenance and ensuring sections are not fractured unnecessarily.
    """
    text = doc.get("text", "")
    if not text or len(text.strip()) == 0:
        return []

    doc_id = str(doc.get("doc_id", doc.get("id", "doc_unknown")))
    act_name = str(doc.get("document_title", doc.get("act_name", doc.get("title", "Indian Legal Statute"))))
    jurisdiction = str(doc.get("document_jurisdiction", doc.get("jurisdiction", "India (Central/State)")))
    authority = str(doc.get("issuing_authority", doc.get("authority", "Government of India / State Legislature")))
    language = str(doc.get("language", "en"))

    # Extract sections if present
    sections = re.split(r'(?=\n\s*\d+\.\s+[A-Z])', text)
    if len(sections) <= 1:
        sections = re.split(r'(?=\n\s*Section\s+\d+)', text, flags=re.IGNORECASE)
    
    # Fallback to paragraph or size-based chunking if no explicit section pattern
    if len(sections) <= 1:
        paragraphs = text.split('\n\n')
        curr_chunk = []
        curr_len = 0
        chunks = []
        chunk_idx = 0
        
        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                continue
            words = p_clean.split()
            p_len = len(words)
            
            if curr_len + p_len > max_tokens and curr_chunk:
                chunk_text = " ".join(curr_chunk)
                chunks.append({
                    "chunk_id": f"{doc_id}_chunk_{chunk_idx}",
                    "document_id": doc_id,
                    "source": "KanoonGPT/indian-legal-documents",
                    "act_name": act_name,
                    "chapter": None,
                    "section": None,
                    "subsection": None,
                    "jurisdiction": jurisdiction,
                    "language": language,
                    "text": chunk_text,
                    "metadata": {
                        "source_type": "statute",
                        "issuing_authority": authority,
                        "country": "India"
                    }
                })
                chunk_idx += 1
                curr_chunk = curr_chunk[-overlap_tokens:] if len(curr_chunk) > overlap_tokens else []
                curr_len = len(curr_chunk)
                
            curr_chunk.extend(words)
            curr_len += p_len
            
        if curr_chunk:
            chunks.append({
                "chunk_id": f"{doc_id}_chunk_{chunk_idx}",
                "document_id": doc_id,
                "source": "KanoonGPT/indian-legal-documents",
                "act_name": act_name,
                "chapter": None,
                "section": None,
                "subsection": None,
                "jurisdiction": jurisdiction,
                "language": language,
                "text": " ".join(curr_chunk),
                "metadata": {
                    "source_type": "statute",
                    "issuing_authority": authority,
                    "country": "India"
                }
            })
        return chunks

    # Structure-aware chunks based on detected sections
    chunks = []
    chunk_idx = 0
    current_chapter = None
    
    for sec in sections:
        sec_text = sec.strip()
        if not sec_text:
            continue
            
        # Detect Chapter header
        chap_match = CHAPTER_REGEX.search(sec_text)
        if chap_match:
            current_chapter = chap_match.group(1).strip()
            
        # Detect Section number
        sec_match = re.search(r'^(?:Section\s+)?(\d+[A-Z]?)\.?\s*([^\n\.\—\-]+)?', sec_text, re.IGNORECASE)
        sec_num = sec_match.group(1) if sec_match else None
        
        words = sec_text.split()
        if len(words) <= max_tokens:
            chunks.append({
                "chunk_id": f"{doc_id}_chunk_{chunk_idx}",
                "document_id": doc_id,
                "source": "KanoonGPT/indian-legal-documents",
                "act_name": act_name,
                "chapter": current_chapter,
                "section": sec_num,
                "subsection": None,
                "jurisdiction": jurisdiction,
                "language": language,
                "text": sec_text,
                "metadata": {
                    "source_type": "statute",
                    "issuing_authority": authority,
                    "country": "India"
                }
            })
            chunk_idx += 1
        else:
            # Long section: split by paragraphs while preserving section metadata
            sub_parts = sec_text.split('\n')
            curr_sub = []
            curr_len = 0
            for sp in sub_parts:
                sp_words = sp.strip().split()
                if not sp_words:
                    continue
                if curr_len + len(sp_words) > max_tokens and curr_sub:
                    chunks.append({
                        "chunk_id": f"{doc_id}_chunk_{chunk_idx}",
                        "document_id": doc_id,
                        "source": "KanoonGPT/indian-legal-documents",
                        "act_name": act_name,
                        "chapter": current_chapter,
                        "section": sec_num,
                        "subsection": None,
                        "jurisdiction": jurisdiction,
                        "language": language,
                        "text": "\n".join(curr_sub),
                        "metadata": {
                            "source_type": "statute",
                            "issuing_authority": authority,
                            "country": "India"
                        }
                    })
                    chunk_idx += 1
                    curr_sub = []
                    curr_len = 0
                curr_sub.append(sp)
                curr_len += len(sp_words)
            if curr_sub:
                chunks.append({
                    "chunk_id": f"{doc_id}_chunk_{chunk_idx}",
                    "document_id": doc_id,
                    "source": "KanoonGPT/indian-legal-documents",
                    "act_name": act_name,
                    "chapter": current_chapter,
                    "section": sec_num,
                    "subsection": None,
                    "jurisdiction": jurisdiction,
                    "language": language,
                    "text": "\n".join(curr_sub),
                    "metadata": {
                        "source_type": "statute",
                        "issuing_authority": authority,
                        "country": "India"
                    }
                })
                chunk_idx += 1
                
    return chunks
