# ARAM AI — Forensic System & Architecture Audit
**Document**: `docs/ai/FINAL_AI_FORENSIC_AUDIT.md`  
**Date**: September 2026  
**Status**: Completed Forensic Analysis

---

## 1. Executive Summary

This forensic audit evaluates the end-to-end implementation of the ARAM AI system across microservices:
1. **AI Service** (`ai-service` on port `8000`, FastAPI / Python)
2. **Core Legal Aid Backend** (`aram-backend` on port `8082`, Spring Boot / Java)
3. **Authentication Service** (`auth-service` on port `8081`, Spring Boot / Java)
4. **Citizen & Admin Frontend** (`frontend` on port `5173`, Vite / React)

The primary goal is to diagnose the root causes of **retrieval contamination** (such as property dispute queries in Tamil Nadu retrieving *Maharashtra Lokayukta Act* or *Merchant Shipping Act*) and identify architectural disconnects between the conversational chatbot, complaint analyzer, and document verification subsystems.

---

## 2. Component-by-Component Forensic Audit

### 2.1 AI Service & RAG Pipeline (`ai-service`)
- **Embedding Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions). Pre-warmed as a singleton in `app/services/embedding_service.py`.
- **Vector Store**: `models/chatbot_retriever.pkl` containing 1,306 chunks.
- **Retriever Flow** (`rag/retrieval/retriever.py`):
  - Computes dense vector dot product on the 1,306 embeddings.
  - Computes BM25 keyword match using `bm25_indexer.py`.
  - Merges using Reciprocal Rank Fusion (RRF, k=60).
- **The Core Flaw in Current Retrieval**:
  - **No Jurisdiction Filtering**: The 1,306 chunks include acts from 15+ states (*Goa, Maharashtra, Uttar Pradesh, Punjab, Karnataka, Assam, Bihar, Odisha, etc.*) and Central statutes. When a citizen in Tamil Nadu queries about a boundary dispute, the retriever previously did not filter by `jurisdiction == 'State (Tamil Nadu)'` or `jurisdiction == 'Central'`.
  - **No Legal Relevance Gate**: High cosine similarity between generic words (e.g., *"complaint"*, *"inquiry"*, *"penalty"*) and non-property statutes caused irrelevant acts (*Maharashtra Lokayukta Act*, *Merchant Shipping Act*) to rank high.
  - **Single-Shot Dumping**: The chatbot previously generated an 11-part static legal assessment on the very first turn even when user input was a casual greeting or vague grievance.

### 2.2 LLM Layer (`ai-service/llm`)
- **LLM Router** (`llm/llm_router.py`):
  - Primary: Gemini (`gemini-1.5-flash` / `gemini-pro`).
  - Fallback: Deterministic domain-grounded response.
- **Grounding Vulnerability**: When Gemini hit quota limits (`429 Quota Exceeded`), the router fell back to deterministic knowledge. However, if ungrounded chunks were passed to Gemini, it could attempt to synthesize from irrelevant statutes.

### 2.3 Audio & Voice Pipeline (`ai-service/app/speech_to_text.py`)
- **Engine**: Faster-Whisper (`base` model on CPU).
- **Execution**: Pre-warmed on startup; accepts `.wav` / `.mp3` / `.m4a` and returns transcribed text and detected language probability.
- **Disconnect**: Voice input was treated as a one-shot transcription instead of feeding into a persistent `ConversationState`.

### 2.4 OCR & Evidence Verification (`ai-service/app/ocr`)
- **Engine**: EasyOCR (PyTorch backend).
- **Quality Analysis**: Laplacian variance blur scoring and contrast analysis in `image_quality.py`.
- **Data Protection**: PII masking in `mask_sensitive_data` masks Aadhaar and PAN numbers.
- **Disconnect**: Evidence verification ran independently of the complaint triage session, causing duplicate analysis loops.

---

## 3. Discovered Vulnerabilities & Disconnects

| Issue ID | Component | Description | Root Cause |
| :--- | :--- | :--- | :--- |
| **BUG-01** | `retriever.py` | Retrieval Contamination (cross-state / cross-domain acts returned) | Lack of pre-retrieval jurisdiction filtering and post-retrieval legal relevance gating. |
| **BUG-02** | `chatbot_engine.py` | Over-eager one-shot legal dumps on vague queries | Absence of a multi-turn conversation manager that clarifies missing facts before running RAG. |
| **BUG-03** | Full-Stack Handoff | Chat intake disconnected from Complaint Submission | Chatbot findings were not serialized into a shareable case session that pre-fills the complaint form. |
| **BUG-04** | `health.py` | Incomplete diagnostic metrics | Diagnostic endpoint returned boolean flags rather than granular vector count, embedding dimensions, and provider readiness. |

---

## 4. Target Unified Architecture

```
                    CITIZEN (Text / Voice / Image)
                                 │
                                 ▼
                     ARAM Unified AI Engine
                   (Conversation State in Redis)
                                 │
                     Language & Intent Analyzer
                                 │
                   Information Completeness Check
                   /                            \
        [Missing / Broad Info]            [Sufficient Context]
                 │                                  │
                 ▼                                  ▼
      Follow-up Question /                Jurisdiction-Aware RAG
      Clarification Chips                 ├── Metadata Filter
                                          ├── Dense + BM25 Fusion
                                          ├── Legal Relevance Gate
                                          └── Verified Legal Chunks
                                                    │
                                                    ▼
                                           LLM Provider Router
                                          (Gemini -> Local -> Fallback)
                                                    │
                                                    ▼
                                           Grounding Validator
                                                    │
                                                    ▼
                                         Adaptive Response Types
                                        (GREETING, CLARIFICATION,
                                         FULL_ASSESSMENT, EMERGENCY)
                                                    │
                                                    ▼
                                        Complaint Submission Handoff
                                        (Evidence OCR + Verification)
```

---

## 5. Audit Conclusion

The underlying foundational models (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, Faster-Whisper, EasyOCR) and vector store (`chatbot_retriever.pkl`) are sound and functional. The critical missing components are:
1. **Jurisdiction-Aware Filtering** & **Legal Relevance Gate** in RAG retrieval.
2. **Multi-Turn Conversation Manager** with progressive clarification before RAG execution.
3. **Unified Case Session State** connecting Chatbot Intake to Complaint Submission and Evidence Verification.
