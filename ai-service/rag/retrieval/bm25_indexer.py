import re
import math
from typing import List, Dict, Any, Tuple

def tokenize_legal_text(text: str) -> List[str]:
    """
    Tokenizes legal text supporting English legal terms, Tamil characters, Act names, and Sections.
    """
    if not text:
        return []
    clean = text.lower()
    # Normalize punctuation while keeping alphanumeric and unicode script words
    tokens = re.findall(r"[\w\u0B80-\u0BFF\u0900-\u097F]+", clean)
    return [t for t in tokens if len(t) > 1]

class BM25OkapiIndexer:
    """
    BM25Okapi indexer for fast, keyword-exact legal retrieval over verified chunks.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[Dict[str, Any]] = []
        self.doc_lengths: List[int] = []
        self.avg_doc_len: float = 0.0
        self.df: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_tokens: List[List[str]] = []
        self.is_indexed: bool = False

    def build_index(self, chunks: List[Dict[str, Any]]):
        """
        Builds in-memory BM25 index over provided chunks.
        """
        self.corpus = chunks
        self.doc_lengths = []
        self.doc_tokens = []
        self.df = {}
        n_docs = len(chunks)

        for chunk in chunks:
            text = f"{chunk.get('title', '')} {chunk.get('act_name', '')} Section {chunk.get('section', '')} {chunk.get('text', '')}"
            tokens = tokenize_legal_text(text)
            self.doc_tokens.append(tokens)
            self.doc_lengths.append(len(tokens))

            # Calculate document frequencies
            seen = set(tokens)
            for t in seen:
                self.df[t] = self.df.get(t, 0) + 1

        self.avg_doc_len = sum(self.doc_lengths) / max(1, n_docs)

        # Compute IDF for all terms
        self.idf = {}
        for term, freq in self.df.items():
            # Standard Lucene/BM25 IDF formula
            self.idf[term] = math.log(1 + (n_docs - freq + 0.5) / (freq + 0.5))

        self.is_indexed = True

    def search(self, query: str, top_k: int = 15) -> List[Tuple[int, float]]:
        """
        Calculates BM25 scores for query and returns list of (chunk_index, bm25_score).
        """
        if not self.is_indexed or not query.strip():
            return []

        q_tokens = tokenize_legal_text(query)
        if not q_tokens:
            return []

        scores = [0.0] * len(self.corpus)

        for q_term in q_tokens:
            if q_term not in self.idf:
                continue
            idf_val = self.idf[q_term]

            for idx, d_tokens in enumerate(self.doc_tokens):
                tf = d_tokens.count(q_term)
                if tf == 0:
                    continue
                d_len = self.doc_lengths[idx]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (d_len / self.avg_doc_len))
                scores[idx] += idf_val * (numerator / denominator)

        # Sort indices by descending BM25 score
        indexed_scores = [(i, round(score, 4)) for i, score in enumerate(scores) if score > 0.0]
        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        return indexed_scores[:top_k]

bm25_indexer = BM25OkapiIndexer()
