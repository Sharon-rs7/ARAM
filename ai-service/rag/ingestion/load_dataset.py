import os
import json
import pandas as pd
from typing import List, Dict, Any

def load_legal_dataset(parquet_path: str = "indian_legal_documents.parquet", max_docs: int = 2000) -> List[Dict[str, Any]]:
    """
    Loads raw legal documents from local storage, fallback parquet, or structured legal datasets.
    """
    docs = []
    
    # 1. Try local parquet
    if os.path.exists(parquet_path):
        try:
            print(f"[INGESTION] Reading local parquet: {parquet_path}")
            df = pd.read_parquet(parquet_path)
            for _, row in df.head(max_docs).iterrows():
                docs.append(row.to_dict())
            print(f"[INGESTION] Successfully loaded {len(docs)} documents from local parquet.")
            return docs
        except Exception as e:
            print(f"[INGESTION WARNING] Local parquet read failed: {e}. Checking secondary datasets...")
            
    # 2. Try HuggingFace dataset
    try:
        print("[INGESTION] Attempting to load KanoonGPT/indian-legal-documents from HuggingFace...")
        from datasets import load_dataset
        ds = load_dataset("KanoonGPT/indian-legal-documents", split="train")
        for i in range(min(max_docs, len(ds))):
            docs.append(ds[i])
        print(f"[INGESTION] Successfully loaded {len(docs)} documents from HuggingFace.")
        return docs
    except Exception as e:
        print(f"[INGESTION WARNING] HuggingFace dataset load failed: {e}. Using structured legal templates & existing knowledge base.")

    # 3. Structured fallback from local verified legal knowledge base files
    templates_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "datasets", "legal_problem_templates.json")
    if os.path.exists(templates_path):
        with open(templates_path, "r", encoding="utf-8") as f:
            templates_data = json.load(f)
            for cat, items in templates_data.items():
                if isinstance(items, list):
                    for idx, item in enumerate(items):
                        docs.append({
                            "doc_id": f"tmpl_{cat}_{idx}",
                            "document_title": item.get("title", f"Legal Statute for {cat}"),
                            "document_type": "Act",
                            "document_jurisdiction": "Central / State (India)",
                            "issuing_authority": "Ministry of Law and Justice",
                            "text": f"{item.get('title', '')}\n\n{item.get('description', '')}\n\nApplicable Provisions:\n{item.get('provisions', '')}\n\nProcedure:\n{item.get('procedure', '')}"
                        })

    return docs
