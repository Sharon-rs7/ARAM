# ARAM AI — RAG Architecture Specification
**Location**: `docs/rag/RAG_ARCHITECTURE.md`

## 1. Storage & Embeddings
- Model: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions).
- Corpus: 1,306 statutory chunks in `models/chatbot_retriever.pkl`.
- Hybrid Search: Dense Vector Dot Product + BM25 keyword index.
- Fusion: Reciprocal Rank Fusion (RRF, k=60).
