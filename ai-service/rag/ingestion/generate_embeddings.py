import numpy as np
from typing import List
from app.services.embedding_service import embedding_service

def generate_chunk_embeddings(texts: List[str], batch_size: int = 64) -> np.ndarray:
    """
    Generates 384-dimensional normalized embeddings for a list of text chunks.
    """
    if not texts:
        return np.zeros((0, 384), dtype=np.float32)
    
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        emb = embedding_service.encode(batch)
        all_embeddings.append(emb)
        
    return np.vstack(all_embeddings) if all_embeddings else np.zeros((0, 384), dtype=np.float32)
