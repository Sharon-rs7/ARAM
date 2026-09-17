# ARAM AI — RETRIEVAL-AUGMENTED GENERATION (RAG) SPECIFICATION

## 1. Statutory Knowledge Corpus & Embeddings

- **Source Dataset**: `data/legal/indian_legal_documents.parquet`
- **Embedding Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 Dimensions)
- **Vector Index Size**: 1,306 statutory chunks with metadata
- **Chunk Metadata Schema**:
  ```json
  {
    "chunk_id": "e1f5a8f2caa65828fd75592666b6dff93fe0b82ed2c602e115dd4ed76d85f00c_chunk_41",
    "act_name": "The Industrial Disputes Act, 1947 / Shops & Establishments Act",
    "section_number": "Section 33C",
    "source": "KanoonGPT/indian-legal-documents",
    "jurisdiction": "India / State Gazettes",
    "text": "Wages must be paid before the expiry of three working days..."
  }
  ```

## 2. Retrieval & Grounding Rules

1. **Cosine Similarity Threshold**: `0.55` (configurable via `RAG_MIN_SCORE`).
2. **Top-K Retrieval**: `k=3` chunks per query.
3. **Strict Non-Fabrication Guard**: If no chunk exceeds the similarity threshold or if Gemini rate-limits (429), the system returns:
   `"Punishment/penalty information was not found in the verified sources retrieved for this case."`
4. **Mandatory Disclaimer**: Every response contains localized statutory legal-aid triage disclaimers.
