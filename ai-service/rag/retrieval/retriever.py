import os
import joblib
import numpy as np
from typing import List, Tuple, Dict, Any, Optional, Set

from rag.config import rag_config
from rag.schemas.rag_response import LegalChunkProvenance, RAGRetrievalResult, RAGResultStatus
from rag.retrieval.bm25_indexer import bm25_indexer
from rag.retrieval.jurisdiction_filter import detect_jurisdiction_from_text, get_chunk_state
from rag.retrieval.legal_gate import legal_gate
from rag.retrieval.reranker import legal_reranker
from rag.retrieval.query_analyzer import query_analyzer
from app.services.embedding_service import embedding_service
from app.nlp.language_detector import language_detector

class LegalRetriever:
    """
    Hybrid Multi-Representation Legal Retriever with Reciprocal Rank Fusion (RRF),
    multi-domain routing, fact-aware reranking, and fail-closed legal gating.
    """

    def __init__(self):
        self.index = None
        self._load_index()

    def _load_index(self):
        path = rag_config.vector_store_path
        if os.path.exists(path):
            try:
                self.index = joblib.load(path)
                chunks = self.index.get("chunks", [])
                bm25_indexer.build_index(chunks)
                print(f"[RAG HYBRID RETRIEVER] Loaded vector & BM25 indices with {len(chunks)} chunks from {path}")
            except Exception as e:
                print(f"[RAG RETRIEVER ERROR] Failed loading index {path}: {e}")
                self.index = None
        else:
            print(f"[RAG RETRIEVER WARNING] Vector index not found at {path}")
            self.index = None

    def is_ready(self) -> bool:
        return self.index is not None and "embeddings" in self.index and "chunks" in self.index and bm25_indexer.is_indexed

    def retrieve(
        self,
        query: str,
        category: str = "GENERAL_LEGAL_AID",
        user_state: str = "Tamil Nadu",
        top_k: Optional[int] = None,
        threshold: Optional[float] = None,
        language_override: Optional[str] = None,
        history_summary: str = ""
    ) -> RAGRetrievalResult:
        if not query or not query.strip():
            return RAGRetrievalResult(
                query="",
                detected_language="en",
                retrieval_query="",
                top_k_chunks=[],
                scores=[],
                highest_score=0.0,
                grounded_context="",
                has_sufficient_context=False,
                status=RAGResultStatus.NO_RELEVANT_SOURCE
            )

        k = top_k or rag_config.top_k
        thresh = threshold if threshold is not None else rag_config.similarity_threshold

        if language_override:
            det_lang = language_override
        else:
            lang_det = language_detector.detect(query)
            det_lang = lang_det.get("language", "en")

        # 1. Dynamic NLP Multi-Representation Query Analysis
        analysis = query_analyzer.analyze(
            raw_query=query,
            category=category,
            user_state=user_state,
            history_summary=history_summary
        )

        resolved_state = analysis["jurisdiction"]["state"]
        detected_domains = analysis["detectedDomains"]
        if category not in detected_domains and category != "GENERAL_LEGAL_AID":
            detected_domains.insert(0, category)

        if not self.is_ready():
            self._load_index()
            if not self.is_ready():
                return RAGRetrievalResult(
                    query=query,
                    detected_language=det_lang,
                    retrieval_query=analysis["jurisdictionAwareQuery"],
                    top_k_chunks=[],
                    scores=[],
                    highest_score=0.0,
                    grounded_context="",
                    has_sufficient_context=False,
                    status=RAGResultStatus.NO_RELEVANT_SOURCE
                )

        chunks = self.index["chunks"]
        embeddings = self.index["embeddings"]

        # 2. Multi-Representation Hybrid Search with Reciprocal Rank Fusion (RRF)
        query_variants = [
            analysis["originalQuery"],
            analysis["normalizedQuery"],
            analysis["legalConceptQuery"],
            analysis["keywordQuery"],
            analysis["jurisdictionAwareQuery"]
        ]
        # Deduplicate non-empty queries
        unique_queries = list(dict.fromkeys([q for q in query_variants if q and len(q.strip()) > 1]))

        rrf_scores: Dict[int, float] = {}
        dense_scores_map: Dict[int, float] = {}
        bm25_scores_map: Dict[int, float] = {}
        rrf_k = 60.0

        for q_text in unique_queries:
            # A. Dense Embedding Search
            q_emb = embedding_service.encode([q_text])
            if q_emb.shape[0] > 0:
                sims = np.dot(embeddings, q_emb[0])
                top_dense_indices = np.argsort(sims)[::-1][:40]
                for rank, idx in enumerate(top_dense_indices):
                    sim_val = float(sims[idx])
                    dense_scores_map[idx] = max(dense_scores_map.get(idx, 0.0), sim_val)
                    rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (rrf_k + rank + 1))

            # B. BM25 Search
            bm25_res = bm25_indexer.search(q_text, top_k=40)
            for rank, (idx, bm_val) in enumerate(bm25_res):
                bm25_scores_map[idx] = max(bm25_scores_map.get(idx, 0.0), bm_val)
                rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (rrf_k + rank + 1))

        # 3. Multi-Domain Legal Gating & Candidate Evaluation
        all_candidate_indices = sorted(rrf_scores.keys(), key=lambda i: rrf_scores[i], reverse=True)[:80]
        gated_candidates = []
        rejected_debug = []

        for idx in all_candidate_indices:
            raw_c = chunks[idx]
            passed_gate = False
            best_reason = "Rejected across all domains"

            # Check gating against all detected domains
            for dom in detected_domains:
                is_valid, reason = legal_gate.validate_chunk(
                    chunk=raw_c,
                    category=dom,
                    user_state=resolved_state,
                    user_intent=analysis["intents"][0] if analysis["intents"] else "GENERAL_GRIEVANCE",
                    query_text=analysis["jurisdictionAwareQuery"]
                )
                if is_valid:
                    passed_gate = True
                    best_reason = reason
                    break
                else:
                    best_reason = reason

            d_s = dense_scores_map.get(idx, 0.0)
            b_s = bm25_scores_map.get(idx, 0.0)

            if passed_gate:
                gated_candidates.append((idx, raw_c, d_s, b_s))
            else:
                rejected_debug.append((idx, raw_c.get("title", ""), best_reason))

        # 4. Fact-Aware Reranking
        reranked_results = legal_reranker.rerank_candidates(
            candidates=gated_candidates,
            category=category,
            user_state=resolved_state
        )

        # 5. Score Threshold Filtering
        valid_reranked = [r for r in reranked_results if r[1] >= max(0.40, thresh - 0.15)]

        matched_chunks: List[LegalChunkProvenance] = []
        matched_scores: List[float] = []
        context_blocks: List[str] = []

        for raw_c, final_score in valid_reranked[:k]:
            chunk_obj = LegalChunkProvenance(
                chunk_id=str(raw_c.get("chunk_id", "chk_unknown")),
                document_id=str(raw_c.get("doc_id", raw_c.get("document_id", "doc_unknown"))),
                source=str(raw_c.get("source", "Official Legal Source")),
                act_name=str(raw_c.get("act_name", raw_c.get("title", "Indian Legal Statute"))),
                chapter=raw_c.get("chapter"),
                section=str(raw_c.get("section", "")) if raw_c.get("section") else None,
                subsection=raw_c.get("subsection"),
                jurisdiction=str(raw_c.get("jurisdiction", resolved_state)),
                language=str(raw_c.get("language", "en")),
                text=str(raw_c.get("text", "")),
                metadata=raw_c.get("metadata", {"source_type": "statute", "country": "India"})
            )

            matched_chunks.append(chunk_obj)
            matched_scores.append(final_score)

            sec_info = f"Section {chunk_obj.section}" if chunk_obj.section else "Statute Provision"
            context_blocks.append(
                f"[Source Chunk ID: {chunk_obj.chunk_id}]\n"
                f"Act: {chunk_obj.act_name}\n"
                f"{sec_info}\n"
                f"Jurisdiction: {chunk_obj.jurisdiction}\n"
                f"Text:\n{chunk_obj.text}"
            )

        highest_score = matched_scores[0] if matched_scores else 0.0
        has_sufficient = len(matched_chunks) > 0 and highest_score >= thresh
        grounded_context = "\n\n---\n\n".join(context_blocks) if has_sufficient else ""
        
        if not has_sufficient:
            matched_chunks = []
            matched_scores = []
            status = RAGResultStatus.NO_RELEVANT_SOURCE
        else:
            status = RAGResultStatus.VERIFIED

        diagnostics_data = {
            "originalQuery": analysis["originalQuery"],
            "normalizedQuery": analysis["normalizedQuery"],
            "legalConceptQuery": analysis["legalConceptQuery"],
            "detectedDomains": detected_domains,
            "jurisdiction": analysis["jurisdiction"],
            "totalCandidatesRetrieved": len(all_candidate_indices),
            "gatedCandidatesCount": len(gated_candidates),
            "rerankedCount": len(valid_reranked),
            "rejectedCount": len(rejected_debug),
            "status": status.value
        }

        return RAGRetrievalResult(
            query=query,
            detected_language=det_lang,
            retrieval_query=analysis["jurisdictionAwareQuery"],
            top_k_chunks=matched_chunks,
            scores=matched_scores,
            highest_score=round(highest_score, 4),
            grounded_context=grounded_context,
            has_sufficient_context=has_sufficient,
            status=status,
            diagnostics=diagnostics_data
        )

    def diagnose_retrieval(
        self,
        query: str,
        category: str = "GENERAL_LEGAL_AID",
        user_state: str = "Tamil Nadu"
    ) -> Dict[str, Any]:
        """
        Diagnostic telemetry method for inspecting RAG multi-stage pipeline.
        """
        res = self.retrieve(query=query, category=category, user_state=user_state)
        diag = res.diagnostics or {}
        diag["finalVerifiedSources"] = [
            {
                "chunkId": c.chunk_id,
                "actName": c.act_name,
                "section": c.section,
                "jurisdiction": c.jurisdiction,
                "score": res.scores[i] if i < len(res.scores) else 0.0
            }
            for i, c in enumerate(res.top_k_chunks)
        ]
        return diag

legal_retriever = LegalRetriever()
