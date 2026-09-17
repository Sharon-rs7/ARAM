# ARAM AI — Production RAG Deployment & Infrastructure Guide

---

## 1. System Requirements & Container Specs

- **Python Runtime**: Python 3.11 with PyTorch (CPU quantized) & FastAPI.
- **RAM Allocation**: Minimum 2.5GB RAM for Faster-Whisper base and MiniLM embeddings in memory.
- **Storage**: Persistent mount for pre-built vector indices (`models/chatbot_retriever.pkl`) and parquet legal dataset (`indian_legal_documents.parquet`).

---

## 2. Environment Variables Configuration

```properties
# AI & RAG Inference Service Configuration
AI_SERVICE_PORT=8000
INTERNAL_API_TOKEN=aram-secret-token-2026
MODEL_DIR=./models
DATASET_DIR=./datasets

# Whisper Speech Recognition
WHISPER_MODE=local
WHISPER_MODEL_SIZE=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
WHISPER_PRELOAD=True

# RAG & Semantic Retrieval Settings
RAG_TOP_K=3
RAG_SIMILARITY_THRESHOLD=0.45
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

# MongoDB Logs & Redis Cache
MONGO_URI=mongodb://localhost:27017/aram_logs
REDIS_HOST=localhost
REDIS_PORT=6379
```
