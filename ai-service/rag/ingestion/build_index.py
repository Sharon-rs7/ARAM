import os
import sys
import json
import datetime
import joblib
import numpy as np

# Ensure parent directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.config import rag_config
from rag.ingestion.load_dataset import load_legal_dataset
from rag.ingestion.clean_documents import clean_legal_text
from rag.ingestion.chunk_documents import chunk_document_structure_aware
from rag.ingestion.generate_embeddings import generate_chunk_embeddings

def build_rag_index():
    print("==================================================")
    print("ARAM AI - REPRODUCIBLE RAG INDEX BUILD PIPELINE")
    print("==================================================")
    start_time = datetime.datetime.now()
    
    # 1. Load documents
    docs = load_legal_dataset()
    print(f"Total documents loaded: {len(docs)}")
    
    if not docs:
        print("[ERROR] No documents loaded for RAG indexing.")
        return False
        
    # 2. Clean documents
    cleaned_docs = []
    for d in docs:
        c_text = clean_legal_text(d.get("text", ""))
        if c_text:
            d_copy = dict(d)
            d_copy["text"] = c_text
            cleaned_docs.append(d_copy)
    print(f"Cleaned documents available: {len(cleaned_docs)}")
    
    # 3. Structure-aware chunking
    all_chunks = []
    for d in cleaned_docs:
        chunks = chunk_document_structure_aware(d)
        all_chunks.extend(chunks)
    print(f"Structure-aware chunks generated: {len(all_chunks)}")
    
    if not all_chunks:
        print("[ERROR] 0 chunks generated.")
        return False
        
    # 4. Generate dense embeddings
    print("Generating dense multilingual embeddings (MiniLM-L12-v2, 384-dim)...")
    texts = [c["text"] for c in all_chunks]
    embeddings = generate_chunk_embeddings(texts)
    print(f"Embeddings matrix generated: {embeddings.shape}")
    
    # 5. Build retriever index structure
    retriever_data = {
        "embeddings": embeddings,
        "chunks": all_chunks,
        "indexed_at": datetime.datetime.now().isoformat(),
        "total_chunks": len(all_chunks),
        "embedding_dim": embeddings.shape[1] if embeddings.ndim > 1 else 384
    }
    
    # 6. Save persistent index & metadata
    os.makedirs(os.path.dirname(rag_config.vector_store_path), exist_ok=True)
    joblib.dump(retriever_data, rag_config.vector_store_path, compress=3)
    print(f"[SUCCESS] Saved persistent vector index to: {rag_config.vector_store_path}")
    
    meta = {
        "embedding_model_name": rag_config.embedding_model,
        "dataset_name": "KanoonGPT/indian-legal-documents",
        "dataset_document_count": len(cleaned_docs),
        "chunk_count": len(all_chunks),
        "embedding_dimension": int(embeddings.shape[1]),
        "creation_timestamp": datetime.datetime.now().isoformat(),
        "pipeline_version": "RAG_v2.0.0_PRODUCTION"
    }
    with open(rag_config.metadata_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"[SUCCESS] Saved RAG metadata to: {rag_config.metadata_path}")
    
    elapsed = (datetime.datetime.now() - start_time).total_seconds()
    print(f"Pipeline finished successfully in {elapsed:.2f}s.")
    return True

if __name__ == "__main__":
    build_rag_index()
