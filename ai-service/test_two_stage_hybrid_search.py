import os
import sys
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.embedding_service import embedding_service
from app.ml.similar_complaint_model import find_similar_complaints

def run_hybrid_search_verification():
    print("=" * 75)
    print("TWO-STAGE HYBRID DEDUPLICATION VERIFICATION: TF-IDF FILTER + EMBEDDING RE-RANK")
    print("=" * 75)
    
    # 1. Singleton Pre-load Verification
    print(f"\n[1/4] SINGLETON MODEL PRE-LOAD VERIFICATION:")
    print(f"      - Embedding Model Name: '{embedding_service.model_name}'")
    print(f"      - Singleton Pre-loaded at Startup: {embedding_service.is_model_loaded()}")
    assert embedding_service.is_model_loaded() is True, "Embedding model singleton is not loaded!"
    
    # 2. Setup Mock Existing Complaints Database Pool (20 records)
    existing_db_complaints = [
        {"id": "CMP-101", "title": "Labour Dispute", "description": "Employer withholding wages for 90 days without explanation."},
        {"id": "CMP-102", "title": "Cyber Fraud", "description": "Bank account drained after fake call asking for OTP."},
        {"id": "CMP-103", "title": "Domestic Violence", "description": "Spouse physical abuse and harassment in household."},
        {"id": "CMP-104", "title": "Property Encroachment", "description": "Neighbour illegally built fence over private property boundary."},
        {"id": "CMP-105", "title": "Government Scheme", "description": "Delay in receiving widow pension scheme funds."},
        {"id": "CMP-106", "title": "Consumer Protection", "description": "Defective electronics product delivered seller refused refund."},
        {"id": "CMP-107", "title": "Labour Issue", "description": "Company terminated contract without notice or severance payout."},
        {"id": "CMP-108", "title": "Stalking", "description": "Unidentified person following citizen near market every evening."},
        {"id": "CMP-109", "title": "Family Land Dispute", "description": "Ancestral land division dispute between brothers."},
        {"id": "CMP-110", "title": "Ration Card Issue", "description": "Local fair price shop owner denying subsidised rice quota."}
    ]
    
    # 3. Test Case A: Paraphrase Query (Labour Dispute - Salary Withheld)
    query_text_a = "My company manager is not paying my salary for three months."
    print(f"\n[2/4] TEST CASE A: Paraphrase Query (Salary Dispute)")
    print(f"      Query Text: '{query_text_a}'")
    
    t0 = time.time()
    res_a = find_similar_complaints(query_text_a, existing_db_complaints, top_k_tfidf=5)
    t_latency_a = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_latency_a:.2f} ms")
    print(f"      - Search Mode: {res_a.get('searchMode')}")
    print(f"      - Similar Found: {res_a.get('similarComplaintFound')}")
    print(f"      - Highest Dense Similarity Score: {res_a.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_a.get('similarComplaintIds')}")
    
    assert res_a.get("similarComplaintFound") is True
    assert "CMP-101" in res_a.get("similarComplaintIds")
    assert res_a.get("searchMode") == "adaptive_multilingual_dense_hybrid"
    assert t_latency_a < 1000.0, f"Latency should be sub-1000ms, got {t_latency_a:.2f}ms"
    
    # 4. Test Case B: Cross-lingual / Tanglish Query vs English DB
    query_text_b = "En company-la salary tharala, 3 months aaga vasool panna mudiyala."
    print(f"\n[3/4] TEST CASE B: Tanglish Paraphrase Query vs English DB")
    print(f"      Query Text: '{query_text_b}'")
    
    t0 = time.time()
    res_b = find_similar_complaints(query_text_b, existing_db_complaints, top_k_tfidf=5)
    t_latency_b = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_latency_b:.2f} ms")
    print(f"      - Search Mode: {res_b.get('searchMode')}")
    print(f"      - Stage 1 Recall Candidates Count: {len(res_b.get('stage1Candidates', []))}")
    print(f"      - Stage 1 First-Pass Candidates: {res_b.get('stage1Candidates')}")
    print(f"      - Stage 2 Dense Rankings: {res_b.get('stage2Rankings')}")
    print(f"      - Similar Found: {res_b.get('similarComplaintFound')}")
    print(f"      - Highest Dense Similarity Score: {res_b.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_b.get('similarComplaintIds')}")
    
    assert res_b.get("similarComplaintFound") is True, f"Failed to match Tanglish query to English candidate CMP-101! Score={res_b.get('similarityScore')}"
    assert "CMP-101" in res_b.get("similarComplaintIds")
    
    # 5. Test Case C: Unrelated Query (No duplicate should match)
    query_text_c = "Traffic signal light not working at busy main road junction."
    print(f"\n[4/4] TEST CASE C: Unrelated Query (Traffic Signal)")
    print(f"      Query Text: '{query_text_c}'")
    
    t0 = time.time()
    res_c = find_similar_complaints(query_text_c, existing_db_complaints, top_k_tfidf=5)
    t_latency_c = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_latency_c:.2f} ms")
    print(f"      - Similar Found: {res_c.get('similarComplaintFound')}")
    print(f"      - Highest Dense Similarity Score: {res_c.get('similarityScore')}")
    
    assert res_c.get("similarComplaintFound") is False
    assert len(res_c.get("similarComplaintIds")) == 0
    
    print("\n" + "=" * 75)
    print("VERIFICATION COMPLETE: MULTI-TIER HYBRID DEDUPLICATION PASSED CLEANLY!")
    print("Cross-lingual Tanglish -> English duplicate detection verified.")
    print("=" * 75)

if __name__ == "__main__":
    run_hybrid_search_verification()
