# ARAM AI — Jurisdiction-Aware RAG Retrieval
**Location**: `docs/rag/RAG_RETRIEVAL.md`

## 1. Jurisdiction Matrix
- **Tamil Nadu Queries**: Prioritizes `State (Tamil Nadu)`, `State (Puducherry)`, and `Central` statutory chunks.
- **Cross-State Suppression**: Rejects chunks from Maharashtra, Goa, Uttar Pradesh, Punjab, Bihar, etc. unless explicitly queried.
