# ARAM AI — Pipeline Specification
**Location**: `docs/ai/AI_PIPELINE.md`

## 1. End-to-End Pipeline Steps
1. **Input Intake**: Accepts text, Faster-Whisper audio transcript, or OCR document text.
2. **Language Identification**: Script detection + phonetic Tanglish marker detection.
3. **Intent & Category Prediction**: Intent classification (Authority Discovery, Statute Inquiry, Procedure Inquiry).
4. **Completeness Check**: Verifies if essential facts (issue type, district) are present.
5. **RAG Retrieval**: Hybrid dense MiniLM (384-dim) + BM25 keyword matching with RRF fusion.
6. **Legal Relevance Gate**: Rejects cross-state and domain mismatches.
7. **Two-Stage Reranking**: Scores chunks on semantic similarity, jurisdiction bonus, and authority credibility.
8. **LLM Synthesis**: Gemini or Deterministic fallback strictly constrained by retrieved context.
9. **Grounding Validator**: Validates citations against retrieved chunks.
10. **UI Delivery**: Renders conversational response or structured 11-part assessment card.
