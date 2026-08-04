import os
import sys
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.embedding_service import embedding_service
from app.ml.similar_complaint_model import find_similar_complaints

def run_a1_verification():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    print("=" * 75)
    print("ITEM A1 VERIFICATION: CROSS-LINGUAL & CROSS-SCRIPT DEDUPLICATION FIX")
    print("=" * 75)
    
    # 1. Singleton Pre-load Verification
    print(f"\n[1/5] SINGLETON MODEL STATUS:")
    print(f"      - Model: '{embedding_service.model_name}'")
    print(f"      - Pre-loaded Singleton Active: {embedding_service.is_model_loaded()}")
    assert embedding_service.is_model_loaded() is True
    
    # 2. Existing Database Complaints Pool (English records)
    existing_db = [
        {"id": "CMP-101", "title": "Labour Dispute", "description": "Employer withholding wages for 90 days without explanation.", "category": "LABOUR_DISPUTE"},
        {"id": "CMP-102", "title": "Cyber Fraud", "description": "Bank account drained after fake call asking for OTP.", "category": "CYBER_CRIME"},
        {"id": "CMP-103", "title": "Domestic Violence", "description": "Spouse physical abuse and harassment in household.", "category": "DOMESTIC_VIOLENCE"},
        {"id": "CMP-104", "title": "Property Encroachment", "description": "Neighbour illegally built fence over private property boundary.", "category": "PROPERTY_DISPUTE"},
        {"id": "CMP-105", "title": "Government Scheme", "description": "Delay in receiving widow pension scheme funds.", "category": "GOVERNMENT_SCHEME"},
        {"id": "CMP-106", "title": "Consumer Protection", "description": "Defective electronics product delivered seller refused refund.", "category": "CONSUMER_COMPLAINT"},
        {"id": "CMP-107", "title": "Labour Issue", "description": "Company terminated contract without notice or severance payout.", "category": "LABOUR_DISPUTE"},
        {"id": "CMP-108", "title": "Stalking", "description": "Unidentified person following citizen near market every evening.", "category": "WOMEN_SAFETY"},
        {"id": "CMP-109", "title": "Family Land Dispute", "description": "Ancestral land division dispute between brothers.", "category": "FAMILY_DISPUTE"},
        {"id": "CMP-110", "title": "Ration Card Issue", "description": "Local fair price shop owner denying subsidised rice quota.", "category": "GOVERNMENT_SCHEME"}
    ]
    
    # -------------------------------------------------------------
    # TEST CASE A: English Paraphrase Query vs English DB
    # -------------------------------------------------------------
    query_a = "My company manager is not paying my salary for three months."
    print(f"\n[2/5] TEST CASE A: English Paraphrase")
    print(f"      Query: '{query_a}'")
    t0 = time.time()
    res_a = find_similar_complaints(query_a, existing_db, top_k_tfidf=5, current_category="LABOUR_DISPUTE")
    t_a = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_a:.2f} ms | SearchMode: {res_a.get('searchMode')}")
    print(f"      - Similar Found: {res_a.get('similarComplaintFound')}")
    print(f"      - Max Similarity Score: {res_a.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_a.get('similarComplaintIds')}")
    assert res_a.get("similarComplaintFound") is True
    assert "CMP-101" in res_a.get("similarComplaintIds")
    
    # -------------------------------------------------------------
    # TEST CASE B: Tanglish Cross-Script Query vs English DB
    # -------------------------------------------------------------
    query_b = "En company-la salary tharala, 3 months aaga vasool panna mudiyala."
    print(f"\n[3/5] TEST CASE B: Tanglish Paraphrase Query vs English DB")
    print(f"      Query: '{query_b}'")
    t0 = time.time()
    res_b = find_similar_complaints(query_b, existing_db, top_k_tfidf=5, current_category="LABOUR_DISPUTE")
    t_b = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_b:.2f} ms | SearchMode: {res_b.get('searchMode')}")
    print(f"      - Stage 1 Candidate Recall Count: {len(res_b.get('stage1Candidates', []))}")
    print(f"      - Stage 1 Candidates: {res_b.get('stage1Candidates')}")
    print(f"      - Stage 2 Dense Rankings: {res_b.get('stage2Rankings')}")
    print(f"      - Similar Found: {res_b.get('similarComplaintFound')}")
    print(f"      - Max Similarity Score: {res_b.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_b.get('similarComplaintIds')}")
    assert res_b.get("similarComplaintFound") is True
    assert "CMP-101" in res_b.get("similarComplaintIds")
    
    # -------------------------------------------------------------
    # TEST CASE C: Native Tamil Script Query vs English DB (NEW)
    # -------------------------------------------------------------
    query_c = "என் முதலாளி மூன்று மாதங்களாக சம்பளம் தரவில்லை."
    print(f"\n[4/5] TEST CASE C: Native Tamil Script Query vs English DB")
    print(f"      Query: '{query_c}'")
    t0 = time.time()
    res_c = find_similar_complaints(query_c, existing_db, top_k_tfidf=5, current_category="LABOUR_DISPUTE")
    t_c = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_c:.2f} ms | SearchMode: {res_c.get('searchMode')}")
    print(f"      - Stage 2 Dense Rankings: {res_c.get('stage2Rankings')}")
    print(f"      - Similar Found: {res_c.get('similarComplaintFound')}")
    print(f"      - Max Similarity Score: {res_c.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_c.get('similarComplaintIds')}")
    assert res_c.get("similarComplaintFound") is True
    assert "CMP-101" in res_c.get("similarComplaintIds")
    
    # -------------------------------------------------------------
    # TEST CASE D: Unrelated Query (Traffic Signal)
    # -------------------------------------------------------------
    query_d = "Traffic signal light not working at busy main road junction."
    print(f"\n[5/5] TEST CASE D: Unrelated Query (Traffic Signal)")
    print(f"      Query: '{query_d}'")
    t0 = time.time()
    res_d = find_similar_complaints(query_d, existing_db, top_k_tfidf=5)
    t_d = (time.time() - t0) * 1000
    
    print(f"      - Latency: {t_d:.2f} ms | SearchMode: {res_d.get('searchMode')}")
    print(f"      - Similar Found: {res_d.get('similarComplaintFound')}")
    print(f"      - Max Similarity Score: {res_d.get('similarityScore')}")
    print(f"      - Matched Complaint IDs: {res_d.get('similarComplaintIds')}")
    assert res_d.get("similarComplaintFound") is False
    assert len(res_d.get("similarComplaintIds")) == 0
    
    print("\n" + "=" * 75)
    print("ITEM A1 VERIFICATION COMPLETE: ALL 4 TEST CASES PASSED CLEANLY!")
    print("English, Tanglish, and Native Tamil Script deduplication verified.")
    print("=" * 75)

if __name__ == "__main__":
    run_a1_verification()
