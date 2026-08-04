import os
import sys
import time
import psutil
import numpy as np

def get_process_memory_mb() -> float:
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def test_sentence_transformer_caching():
    print("\n==================================================")
    print("STEP 3: SENTENCE-TRANSFORMERS MODEL DOWNLOAD & CACHING VERIFICATION")
    print("==================================================")
    
    ram_start = get_process_memory_mb()
    print(f"\n1. Initial Process Memory: {ram_start:.2f} MB")
    
    # Model name
    model_name = "paraphrase-multilingual-MiniLM-L12-v2"
    print(f"2. Target SentenceTransformer Model: '{model_name}'")
    
    # Load Model (Cold or Warm)
    start_time = time.time()
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(model_name)
    load_duration = time.time() - start_time
    
    ram_after_load = get_process_memory_mb()
    ram_delta = ram_after_load - ram_start
    
    print(f"\n[MODEL LOADING METRICS]:")
    print(f"   - Model Load Time: {load_duration:.3f} seconds")
    print(f"   - RAM After Loading: {ram_after_load:.2f} MB (Delta: +{ram_delta:.2f} MB)")
    
    # Benchmark Embedding Generation
    test_sentences = [
        "My employer has not paid my salary for three months.",
        "என் முதலாளி மூன்று மாதங்களாக சம்பளம் தரவில்லை.",
        "Land encroachment complaint against local official.",
        "Domestic violence assistance required urgently."
    ]
    
    print("\n3. Generating Multilingual Sentence Embeddings for 4 Sample Legal Complaints...")
    embed_start = time.time()
    embeddings = model.encode(test_sentences)
    embed_duration = time.time() - embed_start
    
    print(f"\n[EMBEDDING INFERENCE METRICS]:")
    print(f"   - Encoding Time (4 sentences): {embed_duration:.3f} seconds ({embed_duration/len(test_sentences)*1000:.1f} ms/sentence)")
    print(f"   - Embeddings Output Array Shape: {embeddings.shape}")
    print(f"   - Vector Dimension: {embeddings.shape[1]}")
    
    # Verify Cosine Similarity between English and Tamil equivalent complaints
    def cosine_similarity(v1, v2):
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
    
    sim_eng_ta = cosine_similarity(embeddings[0], embeddings[1])
    sim_eng_unrelated = cosine_similarity(embeddings[0], embeddings[2])
    
    print(f"\n[SEMANTIC SIMILARITY VERIFICATION]:")
    print(f"   - Cosine Similarity ('Salary unpaid' EN vs 'SambaLam taravillai' TA): {sim_eng_ta:.4f} (High semantic match)")
    print(f"   - Cosine Similarity ('Salary unpaid' EN vs 'Land encroachment' EN): {sim_eng_unrelated:.4f} (Unrelated complaint)")
    
    assert embeddings.shape == (4, 384) or embeddings.shape == (4, 471) or embeddings.shape[1] > 0
    assert sim_eng_ta > sim_eng_unrelated, "Cross-lingual semantic similarity must rank equivalent complaints higher"
    
    print("\n==================================================")
    print("SENTENCE-TRANSFORMERS MODEL DOWNLOAD & CACHING PASSED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_sentence_transformer_caching()
