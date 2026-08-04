import os
import sys
import time
import psutil
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_process_ram_mb() -> float:
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)

def compute_cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    dot_product = float(np.dot(v1, v2))
    norm_v1 = float(np.linalg.norm(v1))
    norm_v2 = float(np.linalg.norm(v2))
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

def run_step3_embeddings_benchmark():
    print("=" * 70)
    print("STEP 3: SENTENCE-TRANSFORMERS EMBEDDINGS MODEL BENCHMARK & SIMILARITY TEST")
    print("=" * 70)
    
    # 1. Model Details
    model_name = "paraphrase-multilingual-MiniLM-L12-v2"
    print(f"\n[1] MODEL IDENTIFICATION & TECHNICAL SPECIFICATION:")
    print(f"    - Model Name: '{model_name}'")
    print(f"    - Architecture: Multilingual MiniLM Transformer (12 layers)")
    print(f"    - Vector Output Dimension: 384 dimensions (dense float32 array)")
    print(f"    - Multilingual Support: 50+ languages (English, Tamil, Hindi, Code-switched Tanglish/Hinglish)")
    
    # 2. RAM & Load Performance Benchmark
    ram_before = get_process_ram_mb()
    print(f"\n[2] COLD/WARM CACHE LOAD & RAM IMPACT BENCHMARK:")
    print(f"    - Process RAM Before Loading Model: {ram_before:.2f} MB")
    
    t0 = time.time()
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(model_name)
    load_time_sec = round(time.time() - t0, 3)
    
    ram_after = get_process_ram_mb()
    ram_delta = round(ram_after - ram_before, 2)
    
    print(f"    - Cold/Warm Model Load Duration: {load_time_sec:.3f} seconds")
    print(f"    - Process RAM After Model Load: {ram_after:.2f} MB")
    print(f"    - Model RAM Weight Impact: +{ram_delta:.2f} MB")
    
    # Warm Cache Re-instantiation check
    t_warm_0 = time.time()
    _ = SentenceTransformer(model_name)
    warm_instantiation_sec = round(time.time() - t_warm_0, 4)
    print(f"    - Warm In-Memory Re-instantiation: {warm_instantiation_sec:.4f} seconds")
    
    # 3. Real Semantic Similarity Test
    test_texts = [
        # Sentence 0: Original Complaint (English)
        "My employer has not paid my salary for three months.",
        # Sentence 1: Paraphrase (English)
        "The company manager is withholding my monthly wages.",
        # Sentence 2: Paraphrase (Tamil)
        "என் முதலாளி மூன்று மாதங்களாக சம்பளம் தரவில்லை.",
        # Sentence 3: Unrelated Complaint A (Property Dispute)
        "Land boundary wall encroachment by neighbour building a gate.",
        # Sentence 4: Unrelated Complaint B (Cyber Fraud)
        "Online banking OTP scam stole money from my savings account."
    ]
    
    print(f"\n[3] EMBEDDING GENERATION & SEMANTIC SIMILARITY TEST:")
    t_enc_start = time.time()
    embeddings = model.encode(test_texts)
    enc_duration_sec = round(time.time() - t_enc_start, 3)
    ms_per_sentence = round((enc_duration_sec / len(test_texts)) * 1000, 2)
    
    print(f"    - Sentence Batch Count: {len(test_texts)}")
    print(f"    - Total Encoding Execution Time: {enc_duration_sec:.3f} seconds ({ms_per_sentence} ms/sentence)")
    print(f"    - Generated Embeddings Matrix Shape: {embeddings.shape}")
    
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    # Cosine Similarity Calculations
    sim_paraphrase_en = compute_cosine_similarity(embeddings[0], embeddings[1])
    sim_paraphrase_ta = compute_cosine_similarity(embeddings[0], embeddings[2])
    sim_unrelated_prop = compute_cosine_similarity(embeddings[0], embeddings[3])
    sim_unrelated_cyber = compute_cosine_similarity(embeddings[0], embeddings[4])
    
    print(f"\n    [COSINE SIMILARITY PAIRWISE RESULTS]:")
    print(f"    a) Original ('My employer has not paid salary') vs Paraphrase ('Manager withholding wages'):")
    print(f"       -> Cosine Similarity = {sim_paraphrase_en:.4f} [HIGH CLUSTER MATCH]")
    
    print(f"    b) Original ('My employer has not paid salary' EN) vs Tamil ('En mudhalali sambalam tharavillai' TA):")
    print(f"       -> Cosine Similarity = {sim_paraphrase_ta:.4f} [HIGH CROSS-LINGUAL MATCH]")
    
    print(f"    c) Original ('My employer has not paid salary') vs Unrelated ('Land boundary wall encroachment'):")
    print(f"       -> Cosine Similarity = {sim_unrelated_prop:.4f} [LOW UNRELATED SCORE]")
    
    print(f"    d) Original ('My employer has not paid salary') vs Unrelated ('Online banking OTP scam'):")
    print(f"       -> Cosine Similarity = {sim_unrelated_cyber:.4f} [LOW UNRELATED SCORE]")
    
    # Assertions
    assert embeddings.shape == (5, 384), f"Expected shape (5, 384), got {embeddings.shape}"
    assert sim_paraphrase_en > 0.60, f"English paraphrase similarity should be > 0.60, got {sim_paraphrase_en}"
    assert sim_paraphrase_ta > 0.30, f"Tamil cross-lingual similarity should be > 0.30, got {sim_paraphrase_ta}"
    assert sim_paraphrase_ta > sim_unrelated_cyber, f"Cross-lingual Tamil similarity ({sim_paraphrase_ta:.4f}) must be higher than unrelated cyber fraud ({sim_unrelated_cyber:.4f})"
    assert sim_unrelated_prop < 0.35, f"Unrelated complaint similarity should be < 0.35, got {sim_unrelated_prop}"
    assert sim_unrelated_cyber < 0.35, f"Unrelated cyber similarity should be < 0.35, got {sim_unrelated_cyber}"
    
    out_str = "\n".join([
        "=" * 70,
        "STEP 3: SENTENCE-TRANSFORMERS EMBEDDINGS MODEL BENCHMARK & SIMILARITY TEST",
        "=" * 70,
        f"\n[1] MODEL IDENTIFICATION & TECHNICAL SPECIFICATION:",
        f"    - Model Name: '{model_name}'",
        f"    - Architecture: Multilingual MiniLM Transformer (12 layers)",
        f"    - Vector Output Dimension: {embeddings.shape[1]} dimensions (dense float32 array)",
        f"    - Multilingual Support: 50+ languages (English, Tamil, Hindi, Code-switched Tanglish/Hinglish)",
        f"\n[2] COLD/WARM CACHE LOAD & RAM IMPACT BENCHMARK:",
        f"    - Process RAM Before Loading Model: {ram_before:.2f} MB",
        f"    - Cold/Warm Model Load Duration: {load_time_sec:.3f} seconds",
        f"    - Process RAM After Model Load: {ram_after:.2f} MB",
        f"    - Model RAM Weight Impact: +{ram_delta:.2f} MB",
        f"    - Warm In-Memory Re-instantiation: {warm_instantiation_sec:.4f} seconds",
        f"\n[3] EMBEDDING GENERATION & SEMANTIC SIMILARITY TEST:",
        f"    - Sentence Batch Count: {len(test_texts)}",
        f"    - Total Encoding Execution Time: {enc_duration_sec:.3f} seconds ({ms_per_sentence} ms/sentence)",
        f"    - Generated Embeddings Matrix Shape: {embeddings.shape}",
        f"\n    [COSINE SIMILARITY PAIRWISE RESULTS]:",
        f"    a) Original ('My employer has not paid salary') vs Paraphrase ('Manager withholding wages'):",
        f"       -> Cosine Similarity = {sim_paraphrase_en:.4f} [HIGH CLUSTER MATCH]",
        f"    b) Original ('My employer has not paid salary' EN) vs Tamil ('என் முதலாளி சம்பளம் தரவில்லை' TA):",
        f"       -> Cosine Similarity = {sim_paraphrase_ta:.4f} [HIGH CROSS-LINGUAL MATCH]",
        f"    c) Original ('My employer has not paid salary') vs Unrelated ('Land boundary wall encroachment'):",
        f"       -> Cosine Similarity = {sim_unrelated_prop:.4f} [LOW UNRELATED SCORE]",
        f"    d) Original ('My employer has not paid salary') vs Unrelated ('Online banking OTP scam'):",
        f"       -> Cosine Similarity = {sim_unrelated_cyber:.4f} [LOW UNRELATED SCORE]",
        "\n" + "=" * 70,
        "STEP 3 BENCHMARK & SIMILARITY TEST COMPLETED SUCCESSFULLY!",
        "=" * 70
    ])
    
    print(out_str, flush=True)
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "step3_result.txt"), "w", encoding="utf-8") as f:
        f.write(out_str)

if __name__ == "__main__":
    run_step3_embeddings_benchmark()
