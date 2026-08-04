import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.model_loader import ml_model_loader
from app.ml.text_preprocessor import clean_text
from app.services.embedding_service import embedding_service

def find_similar_complaints(current_text: str, existing_complaints: list, top_k_tfidf: int = 15, current_category: str = None) -> dict:
    if not current_text or not current_text.strip() or not existing_complaints:
        return {
            "similarComplaintFound": False,
            "similarityScore": 0.0,
            "similarComplaintIds": [],
            "searchMode": "none",
            "stage1Candidates": []
        }

    try:
        current_cleaned = clean_text(current_text)
        total_pool_size = len(existing_complaints)
        
        # -------------------------------------------------------------
        # STAGE 1: Adaptive Candidate Recall (TF-IDF + Metadata Union)
        # -------------------------------------------------------------
        # If pool size <= 100, pass ALL complaints to dense embedding model
        # so zero cross-lingual complaints are dropped by keyword TF-IDF truncation.
        vec = ml_model_loader.get_model("vectorizer")
        candidates = []
        candidate_stage1_info = []
        
        if total_pool_size <= 100 or not vec or not hasattr(vec, "transform"):
            # Dense direct search across all pool candidates
            for comp in existing_complaints:
                comp_text = (comp.get("title", "") + " " + comp.get("description", "")).strip()
                if comp_text:
                    candidates.append((comp, comp_text, 1.0)) # 1.0 = retained in recall pool
                    candidate_stage1_info.append({"id": comp.get("id"), "tfidfScore": 0.0, "reason": "full_pool_recall"})
        else:
            # For large pools (> 100), combine TF-IDF top_k AND category/district matches
            current_tfidf = vec.transform([current_cleaned])
            scored_candidates = []
            
            for comp in existing_complaints:
                comp_text = (comp.get("title", "") + " " + comp.get("description", "")).strip()
                if not comp_text:
                    continue
                comp_cleaned = clean_text(comp_text)
                comp_tfidf = vec.transform([comp_cleaned])
                tfidf_score = float(cosine_similarity(current_tfidf, comp_tfidf)[0][0])
                
                # Category match boost for cross-lingual recall
                cat_match = current_category and comp.get("category") == current_category
                scored_candidates.append((comp, comp_text, tfidf_score, cat_match))
                
            # Sort primarily by TF-IDF score, keeping category matches in recall
            scored_candidates.sort(key=lambda x: (x[2], x[3]), reverse=True)
            top_candidates = scored_candidates[:top_k_tfidf]
            
            for item in top_candidates:
                candidates.append((item[0], item[1], item[2]))
                candidate_stage1_info.append({"id": item[0].get("id"), "tfidfScore": round(item[2], 4), "reason": "tfidf_top_k"})

        if not candidates:
            return {
                "similarComplaintFound": False,
                "similarityScore": 0.0,
                "similarComplaintIds": [],
                "searchMode": "empty",
                "stage1Candidates": []
            }

        # -------------------------------------------------------------
        # STAGE 2: Multilingual Dense Embedding Similarity Scoring
        # -------------------------------------------------------------
        if embedding_service.is_model_loaded():
            from app.nlp.multilingual_normalizer import normalize_text
            norm_res = normalize_text(current_text)
            normalized_text = norm_res.get("normalizedText", "").strip()
            
            # Prepare queries to encode: original + normalized (if distinct)
            query_variants = [current_text]
            if normalized_text and normalized_text.lower() != current_text.lower():
                query_variants.append(normalized_text)
                
            candidate_texts = [c[1] for c in candidates]
            # Batch encode query variant(s) + candidate texts using pre-loaded singleton
            all_texts = query_variants + candidate_texts
            all_vectors = embedding_service.encode(all_texts)
            
            num_queries = len(query_variants)
            query_vectors = all_vectors[:num_queries]
            candidate_vectors = all_vectors[num_queries:]
            
            sim_ids = []
            max_dense_score = 0.0
            stage2_results = []
            
            for idx, (comp, c_text, tfidf_score) in enumerate(candidates):
                c_vec = candidate_vectors[idx]
                # Max cosine similarity across original and normalized query variants
                dense_sims = [float(np.dot(q_vec, c_vec)) for q_vec in query_vectors]
                dense_sim = max(dense_sims)
                
                stage2_results.append({
                    "id": comp.get("id"),
                    "title": comp.get("title"),
                    "denseSimilarity": round(dense_sim, 4)
                })
                
                if dense_sim > max_dense_score:
                    max_dense_score = dense_sim
                    
                # Threshold for semantic duplicate match (>= 0.55 to prevent intra-category false positives)
                if dense_sim >= 0.55:
                    sim_ids.append(comp.get("id"))
                    
            return {
                "similarComplaintFound": len(sim_ids) > 0,
                "similarityScore": round(max_dense_score, 4),
                "similarComplaintIds": sim_ids,
                "searchMode": "adaptive_multilingual_dense_hybrid",
                "stage1Candidates": candidate_stage1_info,
                "stage2Rankings": stage2_results
            }
        else:
            # Fallback to Stage 1 TF-IDF if embedding model disabled
            sim_ids = [c[0].get("id") for c in candidates if c[2] >= 0.80]
            max_tfidf = candidates[0][2] if candidates else 0.0
            return {
                "similarComplaintFound": len(sim_ids) > 0,
                "similarityScore": round(max_tfidf, 4),
                "similarComplaintIds": sim_ids,
                "searchMode": "tfidf_only_fallback",
                "stage1Candidates": candidate_stage1_info
            }
    except Exception as e:
        print(f"Error in multi-tier hybrid similarity search: {e}")
        return {
            "similarComplaintFound": False,
            "similarityScore": 0.0,
            "similarComplaintIds": [],
            "searchMode": "error",
            "stage1Candidates": []
        }


