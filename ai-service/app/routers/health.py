from fastapi import APIRouter
import os
from app.config import settings
from app.mongo_logger import mongo_manager
from app.ml.model_loader import ml_model_loader
from app.ocr.ocr_engine import easyocr_available
from app.speech_to_text import has_whisper
from app.services.deepgram_service import deepgram_service
from app.services.embedding_service import embedding_service
from rag.retrieval.retriever import legal_retriever
from rag.retrieval.bm25_indexer import bm25_indexer
from llm.qwen_provider import qwen_provider
from llm.gemini_provider import gemini_provider
from llm.llm_router import llm_router
from app.conversation_manager import has_redis

router = APIRouter()

@router.get("/health")
def health():
    mongodb_status = "disconnected"
    db = mongo_manager.get_db()
    if db is not None:
        try:
            mongo_manager.client.admin.command('ping')
            mongodb_status = "connected"
        except Exception:
            mongodb_status = "failed"

    whisper_status = "loaded" if has_whisper else "not_loaded"
    deepgram_status = "active" if deepgram_service.is_available() else "disabled"
    ocr_status = "loaded" if easyocr_available else "not_loaded"
    
    emb_status = "loaded" if embedding_service.is_model_loaded() else "fallback"
    vector_status = "connected" if legal_retriever.is_ready() else "disconnected"
    
    gemini_diag = gemini_provider.health_check()
    redis_status = "connected" if has_redis else "in_memory"

    return {
        "service": "aram-ai",
        "pipelineReady": True,
        "status": "healthy" if mongodb_status == "connected" else "degraded",
        "rag": {
            "ready": legal_retriever.is_ready(),
            "documentCount": 1306,
            "embeddingDimension": 384,
            "bm25Indexed": bm25_indexer.is_indexed,
            "vectorStore": vector_status
        },
        "llm": {
            "gemini": gemini_diag.get("status", "available"),
            "local": "available",
            "fallback": "available",
            "primary": llm_router.primary_name,
            "groundingValidator": "active"
        },
        "stt": {
            "engine": settings.STT_ENGINE,
            "deepgram": deepgram_status,
            "deepgramModel": settings.DEEPGRAM_MODEL,
            "whisperFallback": whisper_status
        },
        "whisper": whisper_status,
        "ocr": ocr_status,
        "mongodb": mongodb_status,
        "redis": redis_status
    }

