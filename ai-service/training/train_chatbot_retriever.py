import os
import sys
import re
import json
import datetime
import joblib
import pandas as pd
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.embedding_service import embedding_service
from sklearn.feature_extraction.text import TfidfVectorizer

def clean_text_content(text):
    if not text:
        return ""
    # Clean obvious extraction artifacts
    text = re.sub(r'==>\s*picture\s*\[.*?\]\s*intentionally\s*omitted\s*<==', '', text, flags=re.IGNORECASE)
    return text.strip()

def chunk_document(doc, chunk_size=1200, overlap=150):
    text = doc["text"]
    if not text:
        return []
    
    chunks = []
    text_len = len(text)
    start = 0
    chunk_idx = 0
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk_text = text[start:end]
        
        chunk_data = {
            "doc_id": str(doc.get("doc_id", "")),
            "chunk_id": f"{doc.get('doc_id')}_chunk_{chunk_idx}",
            "title": str(doc.get("document_title", "")),
            "document_type": str(doc.get("document_type", "")),
            "jurisdiction": str(doc.get("document_jurisdiction", "")),
            "authority": str(doc.get("issuing_authority", "")),
            "issue_date": str(doc.get("issue_date", "")),
            "text": chunk_text
        }
        chunks.append(chunk_data)
        
        if end == text_len:
            break
        start += (chunk_size - overlap)
        chunk_idx += 1
        
    return chunks

def main():
    print("=== Starting Real Legal Data RAG Indexing Pipeline ===")
    os.makedirs("models", exist_ok=True)
    
    # 1. Load Parquet Dataset (with Fallback to HuggingFace)
    parquet_path = "indian_legal_documents.parquet"
    df = None
    
    if os.path.exists(parquet_path):
        try:
            print(f"Loading legal dataset from local parquet: {parquet_path}")
            df = pd.read_parquet(parquet_path)
            print(f"Loaded {len(df)} documents successfully from local storage.")
        except Exception as e:
            print(f"Local parquet reading failed: {e}. Attempting HuggingFace fallback...")
            
    if df is None:
        try:
            print("Fetching KanoonGPT/indian-legal-documents dataset from HuggingFace Hub...")
            from datasets import load_dataset
            dataset = load_dataset("KanoonGPT/indian-legal-documents", split="train")
            df = pd.DataFrame(dataset)
            print(f"Loaded {len(df)} documents successfully from HuggingFace.")
        except Exception as e:
            print(f"[FATAL] Failed to load dataset: {e}")
            sys.exit(1)
            
    # 2. Data Cleaning & Deduplication
    print("Cleaning and deduplicating legal documents...")
    # Drop rows with empty/null text
    df = df.dropna(subset=["text"])
    df = df[df["text"].str.strip() != ""]
    # Drop duplicates by doc_id
    df = df.drop_duplicates(subset=["doc_id"])
    print(f"Total cleaned and unique documents available: {len(df)}")
    
    # Apply development capping limit to run quickly in local environment
    max_docs = int(os.environ.get("RAG_MAX_DOCS", 1000))
    print(f"Applying development cap: keeping top {max_docs} documents for vector indexing.")
    df_limited = df.head(max_docs)
    
    # Clean legal text
    df_limited = df_limited.copy()
    df_limited["text"] = df_limited["text"].apply(clean_text_content)
    
    # 3. Text Chunking
    print("Chunking documents...")
    all_chunks = []
    for _, row in df_limited.iterrows():
        doc_chunks = chunk_document(row.to_dict())
        all_chunks.extend(doc_chunks)
        
    print(f"Generated {len(all_chunks)} semantic chunks from {len(df_limited)} documents.")
    
    # 4. Dense Embedding Generation (using pre-loaded SentenceTransformer)
    print("Generating dense multilingual embeddings for chunks...")
    chunk_texts = [c["text"] for c in all_chunks]
    
    # Ensure embedding model is active
    if not embedding_service.is_model_loaded():
        print("[WARNING] SentenceTransformer not loaded. Loading fallback model...")
        embedding_service._load_model()
        
    dense_embeddings = embedding_service.encode(chunk_texts)
    print(f"Embeddings generated successfully. Matrix shape: {dense_embeddings.shape}")
    
    # 5. Load base QA files for backward compatibility
    questions = []
    answers = []
    categories = []
    
    qa_path = "datasets/chatbot_qa_dataset.csv"
    kb_path = "datasets/next_steps_knowledge_base.csv"
    
    if os.path.exists(qa_path):
        df_qa = pd.read_csv(qa_path)
        questions.extend(df_qa["question"].fillna("").astype(str).tolist())
        for ans in df_qa["answer"].fillna("").tolist():
            answers.append({"reply": ans, "steps": []})
        categories.extend(df_qa["category"].fillna("").tolist())
        
    if os.path.exists(kb_path):
        df_kb = pd.read_csv(kb_path)
        questions.extend(df_kb["user_query"].fillna("").astype(str).tolist())
        for idx, row in df_kb.iterrows():
            answers.append({
                "reply": str(row["answer"]),
                "steps": [x.strip() for x in str(row["steps"]).split("|") if x.strip()]
            })
        categories.extend(df_kb["category"].fillna("").tolist())
        
    # Build backward-compatible TF-IDF vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    corpus_features = vectorizer.fit_transform(questions) if questions else None
    
    # 6. Save Unified Index
    retriever_data = {
        # Dense RAG index
        "embeddings": dense_embeddings,
        "chunks": all_chunks,
        
        # TF-IDF fallback index (backward compatibility)
        "vectorizer": vectorizer,
        "corpus_features": corpus_features,
        "questions": questions,
        "answers": answers,
        "categories": categories
    }
    
    index_output_path = "models/chatbot_retriever.pkl"
    joblib.dump(retriever_data, index_output_path)
    print(f"Semantic RAG retriever index saved successfully to {index_output_path}")
    
    # 7. Write Model Metadata JSON
    metadata = {
        "embedding_model_name": embedding_service.model_name,
        "dataset_name": "KanoonGPT/indian-legal-documents",
        "dataset_document_count": len(df),
        "chunk_count": len(all_chunks),
        "embedding_dimension": dense_embeddings.shape[1],
        "creation_timestamp": datetime.datetime.now().isoformat(),
        "pipeline_version": "RAG_v1.0.0"
    }
    
    metadata_path = "models/legal_rag_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f"RAG metadata saved successfully to {metadata_path}")
    print("=== Indexing Pipeline Completed Successfully ===")

if __name__ == "__main__":
    main()
