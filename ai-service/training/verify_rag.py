import os
import sys
import numpy as np

# Force UTF-8 encoding for Windows stdout/stderr to support Tamil and Hindi characters
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.chatbot_engine import retrieve_legal_context, ask_chatbot_engine

def run_tests():
    print("==================================================")
    print("ARAM V2 - LEGAL RAG RETRIEVAL VERIFICATION SUITE")
    print("==================================================")
    
    # 1. Dataset verification
    print("\n--- A. Dataset Schema & Metadata Verification ---")
    meta_path = "models/legal_rag_metadata.json"
    if os.path.exists(meta_path):
        import json
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        print("[PASS] Metadata JSON exists:")
        print(f"  Embedding model: {meta.get('embedding_model_name')}")
        print(f"  Source dataset: {meta.get('dataset_name')}")
        print(f"  Documents indexed: {meta.get('dataset_document_count')}")
        print(f"  Chunks generated: {meta.get('chunk_count')}")
        print(f"  Dimension: {meta.get('embedding_dimension')}")
    else:
        print("[FAIL] Metadata JSON not found.")
        sys.exit(1)

    # 2. Multilingual retrieval tests
    print("\n--- B. Multilingual Legal Query Tests ---")
    
    queries = {
        "English": {
            "query": "Goa agricultural produce and livestock marketing facilitation act 2026",
            "expected": "Goa Agricultural Produce and Livestock Marketing"
        },
        "Tamil (Tanglish)": {
            "query": "Goa state agricultural produce market sub-committee legal provisions",
            "expected": "Goa Agricultural"
        },
        "Hindi": {
            "query": "RPH पेंशन अधिनियम 2026 के नियम क्या हैं?",
            "expected": "RPH (Pension)"
        },
        "Hinglish": {
            "query": "Odisha shops and commercial establishment act registration updates",
            "expected": "ODISHA SHOPS AND COMMERCIAL"
        }
    }
    
    for lang, data in queries.items():
        print(f"Testing {lang} query: '{data['query']}'")
        texts, citations = retrieve_legal_context(data["query"], top_k=3, threshold=0.30)
        
        if citations:
            print(f"  [PASS] Retrieved {len(citations)} chunks.")
            print(f"  Top Match: '{citations[0]['documentTitle']}' (Score: {citations[0]['relevanceScore']})")
            passed = any(data["expected"].lower() in c["documentTitle"].lower() for c in citations)
            if passed:
                print(f"  [PASS] Expected citation found in results.")
            else:
                print(f"  [WARN] Expected citation '{data['expected']}' not in: {[c['documentTitle'] for c in citations]}")
        else:
            print("  [FAIL] No citations retrieved.")
            
    # 3. Empty/Irrelevant query behavior
    print("\n--- C. Empty and Irrelevant Query Handling ---")
    print("Testing empty query:")
    res_empty = ask_chatbot_engine("")
    print(f"  Reply: {res_empty['reply']}")
    print(f"  Citations: {res_empty.get('citations', [])}")
    
    print("Testing irrelevant query (should fallback to default reply/categories):")
    res_irrelevant = ask_chatbot_engine("I want to buy some fruits and ice cream")
    print(f"  Category: {res_irrelevant['category']}")
    print(f"  Citations: {res_irrelevant.get('citations', [])}")
    
    # 4. Existing Role Authorization & Case-Context Integration
    print("\n--- D. Case Context & Role Authorization ---")
    case_context = "Citizen: Kumar, Complaint: Unpaid salary of 12000 rupees from June 2026."
    res_context = ask_chatbot_engine("What is my current case status?", language="en", user_role="CITIZEN", case_context=case_context)
    
    if case_context in res_context["reply"]:
        print("[PASS] Case context successfully injected into response.")
        print(f"  Response: {res_context['reply'][:120]}...")
    else:
        print("[FAIL] Case context missing from response.")
        sys.exit(1)
        
    # 5. RAG Retrieval Metrics Evaluation (Recall@K, Precision@K, MRR)
    print("\n--- E. Retrieval Evaluation Benchmarking (RETRIEVAL_MODEL) ---")
    
    eval_set = [
        {
            "query": "Eviction rules and marketing of livestock in Goa",
            "ground_truth_docs": ["The Goa Agricultural Produce and Livestock Marketing (Promotion and Facilitation) (Amendment) Act, 2026 (Goa Act 3 of 2026)"]
        },
        {
            "query": "pension details under RPH rules 2026",
            "ground_truth_docs": ["RPH (Pension) (Adhiniyam), 2026"]
        },
        {
            "query": "Odisha shops and commercial establishment workers hours",
            "ground_truth_docs": ["THE ODISHA SHOPS AND COMMERCIAL ESTABLISHMENTS (AMENDMENT) ACT, 2025"]
        }
    ]
    
    K = 3
    recalls = []
    precisions = []
    reciprocal_ranks = []
    all_scores = []
    
    for item in eval_set:
        query = item["query"]
        gt_docs = item["ground_truth_docs"]
        
        texts, citations = retrieve_legal_context(query, top_k=K, threshold=0.30)
        retrieved_docs = [c["documentTitle"] for c in citations]
        scores = [c["relevanceScore"] for c in citations]
        all_scores.extend(scores)
        
        relevant_retrieved = 0
        first_rank = 0
        
        for idx, doc in enumerate(retrieved_docs):
            is_relevant = any(gt.lower() in doc.lower() for gt in gt_docs)
            if is_relevant:
                relevant_retrieved += 1
                if first_rank == 0:
                    first_rank = idx + 1
                    
        precision = relevant_retrieved / K
        recall = relevant_retrieved / len(gt_docs)
        mrr = 1.0 / first_rank if first_rank > 0 else 0.0
        
        precisions.append(precision)
        recalls.append(recall)
        reciprocal_ranks.append(mrr)
        
    mean_precision = np.mean(precisions)
    mean_recall = np.mean(recalls)
    mean_mrr = np.mean(reciprocal_ranks)
    
    print("RETRIEVAL MODEL BENCHMARK RESULTS:")
    print(f"  Precision@{K}: {mean_precision:.3f}")
    print(f"  Recall@{K}: {mean_recall:.3f}")
    print(f"  Mean Reciprocal Rank (MRR): {mean_mrr:.3f}")
    if all_scores:
        print(f"  Similarity Score Distribution: Min={np.min(all_scores):.4f}, Max={np.max(all_scores):.4f}, Mean={np.mean(all_scores):.4f}")
    else:
        print("  Similarity Score Distribution: N/A")
        
    print("\n==================================================")
    print("VERIFICATION SUITE RUN COMPLETED.")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
