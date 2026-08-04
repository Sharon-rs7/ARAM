import os
import sys
import time
import psutil
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_process_memory_mb() -> float:
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def benchmark_full_multi_model_stack():
    print("\n==================================================")
    print("STEP 5: MULTI-MODEL INFERENCE COLD START & PRELOADING BENCHMARK")
    print("==================================================")
    
    stage_benchmarks = []
    
    # -------------------------------------------------------------
    # STAGE 0: BASE PYTHON PROCESS MEMORY
    # -------------------------------------------------------------
    t_start = time.time()
    ram_base = get_process_memory_mb()
    print(f"\n[STAGE 0 - BASE PROCESS]:")
    print(f"   - Initial Base Process RAM: {ram_base:.2f} MB")
    stage_benchmarks.append(("Stage 0: Base Python Process", 0.0, ram_base, 0.0))

    # -------------------------------------------------------------
    # STAGE 1: PRELOAD ALL 7 ONNX MODELS
    # -------------------------------------------------------------
    print("\n[STAGE 1 - PRELOADING 7 ONNX MODELS]:")
    t1_start = time.time()
    import onnxruntime as ort
    
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    onnx_files = [
        "category_model.onnx",
        "priority_model.onnx",
        "authority_model.onnx",
        "language_detector.onnx",
        "complaint_classifier.onnx",
        "document_text_classifier.onnx",
        "volunteer_ranking_model.onnx"
    ]
    
    onnx_sessions = {}
    for filename in onnx_files:
        path = os.path.join(models_dir, filename)
        if os.path.exists(path):
            onnx_sessions[filename] = ort.InferenceSession(path, providers=['CPUExecutionProvider'])
            
    t1_duration = time.time() - t1_start
    ram_stage1 = get_process_memory_mb()
    delta1 = ram_stage1 - ram_base
    print(f"   - Loaded 7 ONNX Sessions in: {t1_duration:.4f} seconds")
    print(f"   - Process RAM: {ram_stage1:.2f} MB (Stage Delta: +{delta1:.2f} MB)")
    stage_benchmarks.append(("Stage 1: 7 ONNX Classifiers", t1_duration, ram_stage1, delta1))

    # -------------------------------------------------------------
    # STAGE 2: PRELOAD PYTORCH EASYOCR READER SINGLETON
    # -------------------------------------------------------------
    print("\n[STAGE 2 - PRELOADING PYTORCH EASYOCR SINGLETON]:")
    t2_start = time.time()
    import easyocr
    ocr_reader = easyocr.Reader(['en'], gpu=False)
    t2_duration = time.time() - t2_start
    ram_stage2 = get_process_memory_mb()
    delta2 = ram_stage2 - ram_stage1
    print(f"   - Loaded PyTorch EasyOCR Reader in: {t2_duration:.4f} seconds")
    print(f"   - Process RAM: {ram_stage2:.2f} MB (Stage Delta: +{delta2:.2f} MB)")
    stage_benchmarks.append(("Stage 2: PyTorch EasyOCR Reader", t2_duration, ram_stage2, delta2))

    # -------------------------------------------------------------
    # STAGE 3: PRELOAD FASTER-WHISPER SPEECH-TO-TEXT MODEL
    # -------------------------------------------------------------
    print("\n[STAGE 3 - PRELOADING FASTER-WHISPER CTRANSLATE2 MODEL]:")
    t3_start = time.time()
    from faster_whisper import WhisperModel
    whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    t3_duration = time.time() - t3_start
    ram_stage3 = get_process_memory_mb()
    delta3 = ram_stage3 - ram_stage2
    print(f"   - Loaded Faster-Whisper 'base' int8 in: {t3_duration:.4f} seconds")
    print(f"   - Process RAM: {ram_stage3:.2f} MB (Stage Delta: +{delta3:.2f} MB)")
    stage_benchmarks.append(("Stage 3: Faster-Whisper Base Model", t3_duration, ram_stage3, delta3))

    # -------------------------------------------------------------
    # STAGE 4: PRELOAD SENTENCE-TRANSFORMERS EMBEDDINGS MODEL
    # -------------------------------------------------------------
    print("\n[STAGE 4 - PRELOADING SENTENCE-TRANSFORMERS EMBEDDINGS MODEL]:")
    t4_start = time.time()
    from sentence_transformers import SentenceTransformer
    embed_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    
    # Pre-warm PyTorch execution engine for sentence transformers once
    embed_model.encode(["warmup query"])
    
    t4_duration = time.time() - t4_start
    ram_stage4 = get_process_memory_mb()
    delta4 = ram_stage4 - ram_stage3
    print(f"   - Loaded & Pre-warmed SentenceTransformer in: {t4_duration:.4f} seconds")
    print(f"   - Process RAM: {ram_stage4:.2f} MB (Stage Delta: +{delta4:.2f} MB)")
    stage_benchmarks.append(("Stage 4: SentenceTransformer Model", t4_duration, ram_stage4, delta4))

    total_preload_duration = time.time() - t_start
    total_ram_allocated = ram_stage4 - ram_base

    # -------------------------------------------------------------
    # SUMMARY TABLE & METRICS
    # -------------------------------------------------------------
    print("\n==================================================")
    print("FULL MULTI-MODEL PRELOADING SUMMARY BENCHMARK TABLE")
    print("==================================================")
    print(f"{'Stage Name':<38} | {'Load Time (s)':<14} | {'Process RAM':<12} | {'RAM Delta':<10}")
    print("-" * 82)
    for name, duration, ram, delta in stage_benchmarks:
        print(f"{name:<38} | {duration:<14.4f} | {ram:<9.2f} MB | +{delta:<8.2f} MB")
    print("-" * 82)
    print(f"{'TOTAL FULL STACK PRELOAD':<38} | {total_preload_duration:<14.4f} | {ram_stage4:<9.2f} MB | +{total_ram_allocated:<8.2f} MB")

    # -------------------------------------------------------------
    # END-TO-END PIPELINE SIMULATION LATENCY BENCHMARK
    # -------------------------------------------------------------
    print("\n==================================================")
    print("END-TO-END MULTI-MODEL INFERENCE PIPELINE SIMULATION")
    print("==================================================")
    
    pipeline_start = time.time()
    
    # Step A: Multilingual Text Classification (ONNX Category Model)
    cat_out = onnx_sessions["category_model.onnx"].run(None, {"string_input": np.array([["Unpaid salary complaint for 3 months"]], dtype=object)})
    category = cat_out[0][0]
    
    # Step B: Priority Prediction (ONNX Priority Model)
    prio_out = onnx_sessions["priority_model.onnx"].run(None, {"string_input": np.array([["Unpaid salary complaint for 3 months"]], dtype=object)})
    priority = prio_out[0][0]
    
    # Step C: Authority Recommendation (ONNX Authority Model)
    auth_out = onnx_sessions["authority_model.onnx"].run(None, {"string_input": np.array([["Unpaid salary complaint for 3 months"]], dtype=object)})
    authority = auth_out[0][0]
    
    # Step D: Vector Embedding Generation (SentenceTransformer)
    vector = embed_model.encode(["Unpaid salary complaint for 3 months"])
    
    # Step E: Volunteer Match Scoring (ONNX Ranking Model)
    sample_features = np.random.randn(1, 13).astype(np.float32)
    rank_out = onnx_sessions["volunteer_ranking_model.onnx"].run(None, {"float_input": sample_features})
    match_score = float(rank_out[0][0][0])
    
    pipeline_duration = time.time() - pipeline_start
    
    print(f"\n[END-TO-END PIPELINE EXECUTION RESULTS]:")
    print(f"   1. Category Classification: '{category}'")
    print(f"   2. Priority Rating: '{priority}'")
    print(f"   3. Authority Recommendation: '{authority}'")
    print(f"   4. Multilingual Vector Embedding Shape: {vector.shape}")
    print(f"   5. Volunteer Match Score: {match_score:.2f}%")
    print(f"   - Total Pipeline Execution Latency: {pipeline_duration*1000:.2f} ms")
    
    assert pipeline_duration < 1.0, f"End-to-end multi-model inference pipeline must complete in under 1 second (took {pipeline_duration:.3f}s)"
    
    print("\n==================================================")
    print("MULTI-MODEL COLD START & PRELOADING BENCHMARK PASSED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    benchmark_full_multi_model_stack()
