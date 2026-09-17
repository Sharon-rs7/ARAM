import os
import numpy as np
from typing import List

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.model_name = "paraphrase-multilingual-MiniLM-L12-v2"
        self._load_model()

    def _load_model(self):
        if self.model is None:
            print(f"[EMBEDDINGS] Pre-loading SentenceTransformer singleton model '{self.model_name}'...")
            try:
                from sentence_transformers import SentenceTransformer
                try:
                    self.model = SentenceTransformer(self.model_name, local_files_only=True)
                except Exception:
                    self.model = SentenceTransformer(self.model_name)
                # Warm-up PyTorch JIT execution kernels
                _ = self.model.encode(["warmup query"], normalize_embeddings=True)
                print(f"[EMBEDDINGS] SentenceTransformer singleton '{self.model_name}' pre-warmed successfully.")
            except Exception as e:
                print(f"[EMBEDDINGS WARNING] Could not load SentenceTransformer: {e}")
                self.model = "fallback"

    def is_model_loaded(self) -> bool:
        return self.model is not None and self.model != "fallback"

    def encode(self, texts: List[str]) -> np.ndarray:
        if not self.is_model_loaded() or not texts:
            return np.zeros((len(texts), 384), dtype=np.float32) if texts else np.zeros((0, 384), dtype=np.float32)
        try:
            return self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        except Exception as e:
            print(f"[EMBEDDINGS ERROR] Encoding failed: {e}")
            return np.zeros((len(texts), 384), dtype=np.float32)

    def compute_similarity(self, text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0
        vecs = self.encode([text1, text2])
        if vecs.shape[0] < 2:
            return 0.0
        # Cosine similarity for normalized vectors is simply dot product
        return float(np.dot(vecs[0], vecs[1]))

embedding_service = EmbeddingService()
