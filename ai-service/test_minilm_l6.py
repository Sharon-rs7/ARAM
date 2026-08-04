import os
import sys
import time
import psutil
import numpy as np
from sentence_transformers import SentenceTransformer

def get_process_memory_mb() -> float:
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def test_l6_model():
    print("\n==================================================")
    print("BENCHMARKING 'all-MiniLM-L6-v2' (LIGHTWEIGHT 80MB EMBEDDING MODEL)")
    print("==================================================")
    
    ram_start = get_process_memory_mb()
    print(f"\n1. Initial Process Memory: {ram_start:.2f} MB")
    
    start_time = time.time()
    model = SentenceTransformer("all-MiniLM-L6-v2")
    load_duration = time.time() - start_time
    
    ram_after_load = get_process_memory_mb()
    ram_delta = ram_after_load - ram_start
    
    print(f"\n[MODEL LOADING METRICS - all-MiniLM-L6-v2]:")
    print(f"   - Model Load Time: {load_duration:.3f} seconds")
    print(f"   - RAM After Loading: {ram_after_load:.2f} MB (Delta: +{ram_delta:.2f} MB)")
    
    test_sentences = [
        "Unpaid salary claim against employer.",
        "Illegal eviction notice received from landlord.",
        "Request for free legal aid defense lawyer.",
        "Consumer fraud complaint against online merchant."
    ]
    
    embed_start = time.time()
    embeddings = model.encode(test_sentences)
    embed_duration = time.time() - embed_start
    
    print(f"\n[EMBEDDING INFERENCE METRICS]:")
    print(f"   - Encoding Time (4 sentences): {embed_duration:.3f} seconds ({embed_duration/4*1000:.1f} ms/sentence)")
    print(f"   - Embeddings Output Array Shape: {embeddings.shape}")
    print(f"   - Vector Dimension: {embeddings.shape[1]}")
    
    print("\n==================================================")

if __name__ == "__main__":
    test_l6_model()
