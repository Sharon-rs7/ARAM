from typing import List, Dict, Any, Tuple
from rag.retrieval.jurisdiction_filter import get_chunk_state, get_act_domain

class LegalRelevanceReranker:
    @staticmethod
    def calculate_rerank_score(
        chunk: Dict[str, Any],
        dense_score: float,
        bm25_score: float,
        category: str,
        user_state: str = "Tamil Nadu"
    ) -> float:
        title = str(chunk.get("title", chunk.get("act_name", "")))
        jurisdiction = str(chunk.get("jurisdiction", ""))
        
        chunk_state = get_chunk_state(jurisdiction, title)
        act_domain = get_act_domain(title)

        norm_dense = max(0.0, min(1.0, dense_score))
        norm_bm25 = max(0.0, min(1.0, bm25_score / 15.0))
        base_score = (norm_dense * 0.60) + (norm_bm25 * 0.40)

        jur_bonus = 0.0
        if chunk_state.lower() == user_state.lower():
            jur_bonus = 0.25
        elif chunk_state == "Central":
            jur_bonus = 0.15
        else:
            jur_bonus = -0.30

        domain_bonus = 0.0
        if category in ["PROPERTY_DISPUTE", "PROPERTY_CIVIL_DISPUTE"] and act_domain in ["PROPERTY_DISPUTE", "TENANCY_DISPUTE", "PROPERTY_MUNICIPAL"]:
            domain_bonus = 0.20
        elif category in ["TENANCY_DISPUTE", "RENT_TENANT_DISPUTE"] and act_domain in ["TENANCY_DISPUTE", "PROPERTY_DISPUTE"]:
            domain_bonus = 0.20
        elif category == "LABOUR_DISPUTE" and act_domain in ["LABOUR_DISPUTE", "PENSION_BENEFITS", "MARITIME_SHIPPING"]:
            domain_bonus = 0.20
        elif category == "CONSUMER_COMPLAINT" and act_domain in ["CONSUMER_COMPLAINT", "CIVIC_MUNICIPAL", "PUBLIC_HEALTH"]:
            domain_bonus = 0.20
        elif category in ["TAX_DISPUTE", "TAX_GST", "TAX_CESS"] and act_domain in ["TAX_GST", "TAX_CESS", "AGRICULTURE_TAX"]:
            domain_bonus = 0.25
        elif category in ["COOPERATIVE", "COOPERATIVE_DISPUTE"] and act_domain in ["COOPERATIVE", "ADMINISTRATIVE"]:
            domain_bonus = 0.25
        elif category in ["ADMINISTRATIVE", "ADMINISTRATIVE_DISPUTE", "CORRUPTION_BRIBERY"] and act_domain in ["ADMINISTRATIVE", "CORRUPTION_LOKAYUKTA"]:
            domain_bonus = 0.25
        elif category in ["STATE_SECURITY", "CRIMINAL_COMPLAINT"] and act_domain in ["STATE_SECURITY", "CRIMINAL_COMPLAINT"]:
            domain_bonus = 0.20
        elif category in ["PROPERTY_MUNICIPAL", "CIVIC_MUNICIPAL", "CIVIC_INFRASTRUCTURE"] and act_domain in ["PROPERTY_MUNICIPAL", "CIVIC_MUNICIPAL"]:
            domain_bonus = 0.20
        elif category in ["WOMEN_SAFETY_DOMESTIC_VIOLENCE", "DOMESTIC_VIOLENCE"] and act_domain in ["WOMEN_SAFETY_DOMESTIC_VIOLENCE", "GENERAL_LEGAL_AID"]:
            domain_bonus = 0.20
        elif category == "EDUCATION_DISPUTE" and act_domain in ["EDUCATION", "ADMINISTRATIVE"]:
            domain_bonus = 0.25
        elif category in ["MARITIME_DISPUTE", "SPORTS_DISPUTE", "AGRICULTURE_DISPUTE"] and act_domain in ["MARITIME_SHIPPING", "SPORTS_ANTI_DOPING", "AGRICULTURE", "AGRICULTURE_TAX"]:
            domain_bonus = 0.20
        elif category == "GENERAL_LEGAL_AID" and act_domain != "GENERAL_STATUTE":
            domain_bonus = 0.15
        elif act_domain == "GENERAL_LEGAL_AID":
            domain_bonus = 0.10

        auth_text = (str(chunk.get("authority", "")) + " " + str(chunk.get("source", ""))).lower()
        auth_bonus = 0.0
        if any(w in auth_text for w in ["gazette", "legislation", "parliament", "assembly", "high court", "supreme court"]):
            auth_bonus = 0.08
        elif any(w in auth_text for w in ["dlsa", "nalsa", "tlsc"]):
            auth_bonus = 0.06

        final_score = base_score + jur_bonus + domain_bonus + auth_bonus
        return round(max(0.0, min(1.0, final_score)), 4)

    @classmethod
    def rerank_candidates(
        cls,
        candidates: List[Tuple[int, Dict[str, Any], float, float]],
        category: str,
        user_state: str = "Tamil Nadu"
    ) -> List[Tuple[Dict[str, Any], float]]:
        scored = []
        for idx, chunk, d_score, b_score in candidates:
            r_score = cls.calculate_rerank_score(chunk, d_score, b_score, category, user_state)
            scored.append((chunk, r_score))
            
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

legal_reranker = LegalRelevanceReranker()
