import os
import sys
import json
from fastapi.testclient import TestClient

# Force UTF-8 encoding
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app

client = TestClient(app)

def run_verification():
    print("==================================================")
    print("ARAM V2 - ML TRAINING & API INTEGRATION VERIFICATION")
    print("==================================================")

    # 1. Check metadata and provenance
    meta_path = "models/model_metadata.json"
    if not os.path.exists(meta_path):
        print(f"[FAIL] Metadata file not found at {meta_path}")
        return False
        
    print("\n--- 1. Metadata and Provenance Check ---")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
        
    print(f"Model Version: {meta.get('model_version')}")
    print(f"Dataset Sources:")
    for ds, status in meta.get("dataset_sources", {}).items():
        print(f"  - {ds}: {status}")
    print(f"Licenses:")
    for ds, lic in meta.get("licenses", {}).items():
        print(f"  - {ds}: {lic}")
    print(f"Genuinely trained categories: {meta.get('categories_genuinely_trained')}")
    print(f"Categories marked DATA_REQUIRED: {len(meta.get('categories_marked_DATA_REQUIRED', []))} categories")
    print(f"Split Counts: {meta.get('split_counts')}")
    print(f"Test Accuracy: {meta.get('metrics', {}).get('accuracy')}")
    print(f"Test Macro F1: {meta.get('metrics', {}).get('macro_f1')}")

    # 2. Check ONNX artifacts
    print("\n--- 2. ONNX Artifacts Existence Check ---")
    onnx_files = [
        "models/category_model.onnx",
        "models/priority_model.onnx",
        "models/authority_model.onnx",
        "models/volunteer_ranking_model.onnx"
    ]
    for path in onnx_files:
        if os.path.exists(path):
            print(f"[PASS] Found {path} ({os.path.getsize(path)} bytes)")
        else:
            print(f"[FAIL] Missing {path}")
            return False

    # 3. FastAPI Endpoint Integration Verification
    print("\n--- 3. FastAPI /complaint/analyze Integration Tests ---")
    
    # Test case A: Real ML Model matching (Consumer Loan complaint)
    payload_a = {
        "title": "Unfair Interest Charged",
        "description": "The bank charged me a high interest rate on my home loan without prior notice.",
        "languageHint": "en",
        "district": "Coimbatore",
        "complaintId": "comp-101",
        "citizenId": 12345,
        "regionId": "region-9"
    }
    
    print("\nSending Consumer dispute query (Expected Real ML Model)...")
    res_a = client.post("/complaint/analyze", json=payload_a, headers={"X-Internal-Token": "aram-secret-token-2026"})
    if res_a.status_code != 200:
        print(f"[FAIL] Endpoint returned status {res_a.status_code}: {res_a.text}")
        return False
        
    data_a = res_a.json()
    print(f"[PASS] Response status: 200")
    print(f"  Predicted Category: {data_a.get('category')}")
    print(f"  Category Source: {data_a.get('categoryPredictionSource')}")
    print(f"  Priority: {data_a.get('priority')} (Source: {data_a.get('priorityPredictionSource')})")
    print(f"  Complexity: {data_a.get('complexity')} (Source: {data_a.get('complexityPredictionSource')})")
    print(f"  Authority: {data_a.get('recommendedAuthority')} (Source: {data_a.get('authorityPredictionSource')})")
    
    # Assertions
    assert data_a.get("categoryPredictionSource") == "REAL_ML_MODEL"
    assert data_a.get("priority") == "DATA_REQUIRED"
    assert data_a.get("complexity") == "DATA_REQUIRED"
    assert data_a.get("recommendedAuthority") == "DATA_REQUIRED"
    assert "trainingFeedbackSchema" in data_a
    assert data_a["complaintId"] == "comp-101"
    
    print("[PASS] Schema validation and key checks passed.")

    # Test case B: Fallback Keyword Model matching (Women Safety / Domestic Violence)
    payload_b = {
        "title": "Domestic violence",
        "description": "My husband beats me and threatens my safety at home.",
        "languageHint": "en",
        "district": "Chennai",
        "complaintId": "comp-102",
        "citizenId": 67890,
        "regionId": "region-1"
    }
    
    print("\nSending domestic violence query (Expected Fallback/Non-ML)...")
    res_b = client.post("/complaint/analyze", json=payload_b, headers={"X-Internal-Token": "aram-secret-token-2026"})
    if res_b.status_code != 200:
        print(f"[FAIL] Endpoint returned status {res_b.status_code}: {res_b.text}")
        return False
        
    data_b = res_b.json()
    print(f"[PASS] Response status: 200")
    print(f"  Predicted Category: {data_b.get('category')}")
    print(f"  Category Source: {data_b.get('categoryPredictionSource')}")
    print(f"  Priority: {data_b.get('priority')}")
    print(f"  Feedback Loop Schema Example:")
    print(json.dumps(data_b.get("trainingFeedbackSchema"), indent=4))
    
    # Assertions
    assert data_b.get("categoryPredictionSource") == "FALLBACK / NON-ML"
    assert data_b.get("category") in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY_DOMESTIC_VIOLENCE"]
    
    print("[PASS] Fallback/Non-ML logic works perfectly.")
    
    print("\n==================================================")
    print("VERIFICATION RUN SUCCESSFUL. PHASE 2 COMPLETED.")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
