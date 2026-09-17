import os
import sys
import time
import json

if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.retrieval.retriever import legal_retriever
from app.chatbot_engine import ask_chatbot_engine
from app.nlp.language_detector import language_detector

def run_evaluation():
    print("================================================================================")
    print("      ARAM AI - PRODUCTION RAG TRACE, EVALUATION & CLAIM-TO-SOURCE REPORT       ")
    print("================================================================================")
    
    test_cases = [
        {
            "id": 1,
            "query": "My employer has not paid my salary for three months.",
            "expected_cat": "LABOUR_DISPUTE",
            "lang": "en"
        },
        {
            "id": 2,
            "query": "I bought a defective mobile phone and the seller refuses to refund me.",
            "expected_cat": "CONSUMER_COMPLAINT",
            "lang": "en"
        },
        {
            "id": 3,
            "query": "My husband is threatening and physically abusing me.",
            "expected_cat": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
            "lang": "en"
        },
        {
            "id": 4,
            "query": "Someone transferred money from my bank account through an online scam.",
            "expected_cat": "CYBER_CRIME",
            "lang": "en"
        },
        {
            "id": 5,
            "query": "My landlord refuses to return my deposit.",
            "expected_cat": "PROPERTY_CIVIL_DISPUTE",
            "lang": "en"
        },
        {
            "id": 6,
            "query": "Do I qualify for free legal aid?",
            "expected_cat": "GENERAL_LEGAL_AID",
            "lang": "en"
        },
        {
            "id": 7,
            "query": "I want to buy some fruits and ice cream",
            "expected_cat": "GENERAL_LEGAL_AID",
            "lang": "en"
        },
        {
            "id": 8,
            "query": "asdkjhqw98ey1298y312",
            "expected_cat": "GENERAL_LEGAL_AID",
            "lang": "en"
        },
        {
            "id": 9,
            "query": "எனது நிலத்தை பக்கத்து வீட்டுக்காரர் ஆக்கிரமிப்பு செய்துள்ளார்",
            "expected_cat": "PROPERTY_CIVIL_DISPUTE",
            "lang": "ta"
        },
        {
            "id": 10,
            "query": "Enoda salary 3 months ah tharala employer",
            "expected_cat": "LABOUR_DISPUTE",
            "lang": "ta-en"
        },
        {
            "id": 11,
            "query": "मकान मालिक मेरी सुरक्षा राशि वापस नहीं कर रहा है",
            "expected_cat": "PROPERTY_CIVIL_DISPUTE",
            "lang": "hi"
        }
    ]

    claim_validations = []
    latencies = []

    for tc in test_cases:
        print(f"\n" + "-"*80)
        print(f"TEST CASE #{tc['id']}: \"{tc['query']}\"")
        print(f"-"*80)
        
        t0 = time.time()
        
        # 1. Language Detection
        det = language_detector.detect(tc["query"])
        detected_lang = det.get("language", "en")
        print(f"• Detected Language: {detected_lang} (Confidence: {det.get('confidence', 1.0)})")
        
        # 2. Retrieval Trace
        ret_res = legal_retriever.retrieve(tc["query"], language_override=tc.get("lang"))
        print(f"• Top-K Chunks Retrieved: {len(ret_res.top_k_chunks)}")
        print(f"• Highest Similarity Score: {ret_res.highest_score}")
        
        for idx, chunk in enumerate(ret_res.top_k_chunks[:3]):
            score = ret_res.scores[idx] if idx < len(ret_res.scores) else 0.0
            print(f"    [{idx+1}] Chunk ID: {chunk.chunk_id} | Score: {score}")
            print(f"        Act: {chunk.act_name} | Section: {chunk.section}")
            print(f"        Source: {chunk.source}")
            print(f"        Snippet: {chunk.text[:120].replace('\n', ' ')}...")
            
        # 3. Full Chatbot RAG Output
        response = ask_chatbot_engine(tc["query"], language=tc.get("lang"))
        elapsed = time.time() - t0
        latencies.append(elapsed)
        
        cat_info = response.get("category", {})
        cat_name = cat_info.get("name") if isinstance(cat_info, dict) else str(cat_info)
        print(f"• Category: {cat_name}")
        print(f"• Recommended Authority: {response.get('recommendedAuthority')}")
        print(f"• Required Documents: {response.get('documents', [])[:3]}")
        print(f"• Human Review Required: {response.get('humanReviewRequired')}")
        print(f"• Punishment Safety Details: {response.get('punishment', {}).get('details')}")
        print(f"• Latency: {elapsed*1000:.2f} ms")
        
        # Claim-to-source validation for top cases
        if tc["id"] <= 5 and response.get("laws"):
            first_law = response["laws"][0]
            claim_text = f"{first_law.get('actName')} - {first_law.get('explanation')}"
            supported = bool(first_law.get("sourceChunkId"))
            claim_validations.append({
                "queryId": tc["id"],
                "query": tc["query"],
                "claim": claim_text,
                "sourceChunkId": first_law.get("sourceChunkId"),
                "supported": "YES" if supported else "NO"
            })

    print("\n" + "="*80)
    print("                     CLAIM-TO-SOURCE GROUNDING MATRIX                       ")
    print("="*80)
    for cv in claim_validations:
        print(f"Query [{cv['queryId']}]: {cv['query']}")
        print(f"  -> Extracted Claim: {cv['claim']}")
        print(f"  -> Linked Source Chunk ID: {cv['sourceChunkId']}")
        print(f"  -> Grounded in Verified Source: {cv['supported']}")
        print()

    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    print(f"Average RAG Retrieval & Generation Latency: {avg_latency*1000:.2f} ms")
    print("================================================================================")

if __name__ == "__main__":
    run_evaluation()
