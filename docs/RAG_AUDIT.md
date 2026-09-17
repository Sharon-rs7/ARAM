# ARAM AI — Forensic RAG System Audit Report

**Audit Date**: September 16, 2026  
**Module**: AI & RAG Inference Service (`ai-service/`)  
**Status**: Verified & Operational  

---

## 1. Existing RAG & AI Pipeline Overview

The RAG subsystem in ARAM AI operates as a hybrid statutory semantic search and deterministic triage engine designed for high precision, low latency, and zero hallucination.

```
Complainant Voice / Text Input (Tamil / Hindi / English)
    │
    ├── 1. Audio Transcription via Faster-Whisper (INT8 CPU)
    │
    ├── 2. Multilingual Normalization & PII Redaction
    │
    ├── 3. ONNX 6-Category Legal Classifier & Priority Engine
    │
    ├── 4. RAG Retrieval via SentenceTransformers MiniLM-L12-v2 (384-dim)
    │         └── Cosine Similarity Match against Statutory Index (Threshold >= 0.45)
    │
    └── 5. Grounded Legal Response Assembler
              ├── Simple Plain-Language Explanation
              ├── Relevant Statutory Act & Section Citation
              ├── Required Document Evidence Checklist
              ├── Immediate Safe Next Steps
              └── Mandatory Legal Aid Information Disclaimer
```

---

## 2. Component Inventory & Audit Findings

| Component | Implementation File | Verified Status | Audit Notes |
| :--- | :--- | :--- | :--- |
| **Embedding Engine** | `app/services/embedding_service.py` | **WORKING** | Pre-loads `paraphrase-multilingual-MiniLM-L12-v2` singleton model; generates normalized 384-dim vectors. |
| **Vector Retriever** | `app/chatbot_engine.py` | **WORKING** | Performs dot-product cosine similarity over pre-indexed statutory vectors with source metadata. |
| **Legal Knowledge Base** | `indian_legal_documents.parquet` | **VERIFIED (995MB)** | Contains Indian legal corpus covering central and Tamil Nadu state revenue statutes. |
| **Legal Taxonomy Registry**| `app/ml/category_model.py` | **WORKING** | 6 Closed categories (`PROPERTY_CIVIL_DISPUTE`, `LABOUR_DISPUTE`, `CONSUMER_DISPUTE`, `DOMESTIC_VIOLENCE`, `CYBERCRIME`, `GENERAL_LEGAL_AID`). |
| **Document Checklist** | `app/document_recommender.py` | **WORKING** | Maps legal categories to evidence checklists (e.g. Patta/Chitta, Pay Slips, FIR copies). |
| **Authority Router** | `app/authority_recommender.py` | **WORKING** | Maps legal categories to governing legal aid bodies (DLSA, TLSC, Labour Commissioner, Police). |
| **PII & Safety Filter** | `app/safety_filter.py` | **WORKING** | Appends mandatory legal aid triage disclaimer to all citizen responses. |
| **Telemetry Logger** | `app/mongo_logger.py` | **WORKING** | Captures latency, query strings, and confidence distributions to MongoDB `aram_logs`. |

---

## 3. Grounding & Hallucination Guardrails

1. **Structured Authority Mapping**: Authorities are not dynamically invented by the model; they are mapped deterministically from verified institutional registries.
2. **Document Checklists**: Checklists are retrieved from structured category metadata rather than free-form generation.
3. **Multilingual Consistency**: If a query is submitted in Tamil, the generated guidance, document requirements, and next steps remain strictly localized in Tamil (`ta-IN`).
4. **Mandatory Disclaimer**: Every response enforces:
   *"This information is for general guidance and is not legal advice. Please consult the suggested authority or a qualified legal-aid professional for your specific situation."*
