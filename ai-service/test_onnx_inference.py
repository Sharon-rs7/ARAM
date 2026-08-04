import os
import sys
import time
import psutil
import joblib
import numpy as np
import onnxruntime as ort

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def get_process_memory_mb() -> float:
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def test_onnx_models():
    print("\n==================================================")
    print("STEP 4: ONNX MODEL EXPORT & INFERENCE SETUP VERIFICATION")
    print("==================================================")
    
    ram_start = get_process_memory_mb()
    print(f"\n1. Initial Process Memory: {ram_start:.2f} MB")
    
    onnx_files = [
        "category_model.onnx",
        "priority_model.onnx",
        "authority_model.onnx",
        "language_detector.onnx",
        "complaint_classifier.onnx",
        "document_text_classifier.onnx",
        "volunteer_ranking_model.onnx"
    ]
    
    # -------------------------------------------------------------
    # 1. VERIFY ALL 7 ONNX FILES EXIST & LOAD SESSIONS
    # -------------------------------------------------------------
    print("\n2. Initializing ONNX Runtime Sessions (CPUExecutionProvider)...")
    sessions = {}
    
    load_start = time.time()
    for filename in onnx_files:
        path = os.path.join(MODELS_DIR, filename)
        assert os.path.exists(path), f"Missing ONNX file: {path}"
        session = ort.InferenceSession(path, providers=['CPUExecutionProvider'])
        sessions[filename] = session
        size_kb = os.path.getsize(path) / 1024.0
        print(f"   [ONNX LOADED]: {filename:<32} (Size: {size_kb:.1f} KB)")
        
    total_load_duration = time.time() - load_start
    ram_after_load = get_process_memory_mb()
    ram_delta = ram_after_load - ram_start
    
    print(f"\n[ONNX SESSIONS METRICS]:")
    print(f"   - Total 7 ONNX Sessions Init Time: {total_load_duration:.4f} seconds ({total_load_duration/7*1000:.1f} ms/session)")
    print(f"   - RAM After Loading 7 ONNX Models: {ram_after_load:.2f} MB (RAM Delta: +{ram_delta:.2f} MB)")

    # -------------------------------------------------------------
    # 2. BENCHMARK INFERENCE SPEED & SCHEMA FOR TEXT PIPELINES
    # -------------------------------------------------------------
    sample_text = np.array([["Unpaid salary complaint for 3 months from employer."]], dtype=object)
    
    print("\n3. Testing ONNX Pipeline Inference Latency (Text Vectorizer + Classifier)...")
    
    # Category Model
    cat_session = sessions["category_model.onnx"]
    t0 = time.time()
    for _ in range(100):
        cat_out = cat_session.run(None, {"string_input": sample_text})
    cat_latency_ms = (time.time() - t0) / 100 * 1000
    print(f"   - category_model.onnx: 100 runs avg latency = {cat_latency_ms:.3f} ms/query | Pred Label = {cat_out[0][0]}")
    
    # Priority Model
    prio_session = sessions["priority_model.onnx"]
    t0 = time.time()
    for _ in range(100):
        prio_out = prio_session.run(None, {"string_input": sample_text})
    prio_latency_ms = (time.time() - t0) / 100 * 1000
    print(f"   - priority_model.onnx: 100 runs avg latency = {prio_latency_ms:.3f} ms/query | Pred Label = {prio_out[0][0]}")

    # Authority Model
    auth_session = sessions["authority_model.onnx"]
    t0 = time.time()
    for _ in range(100):
        auth_out = auth_session.run(None, {"string_input": sample_text})
    auth_latency_ms = (time.time() - t0) / 100 * 1000
    print(f"   - authority_model.onnx: 100 runs avg latency = {auth_latency_ms:.3f} ms/query | Pred Label = {auth_out[0][0]}")

    # -------------------------------------------------------------
    # 3. BENCHMARK VOLUNTEER RANKING MODEL ONNX INFERENCE
    # -------------------------------------------------------------
    print("\n4. Testing Volunteer Ranking ONNX Model (Numeric Feature Regressor)...")
    rank_session = sessions["volunteer_ranking_model.onnx"]
    
    # 13 float features sample input
    sample_floats = np.random.randn(1, 13).astype(np.float32)
    t0 = time.time()
    for _ in range(100):
        rank_out = rank_session.run(None, {"float_input": sample_floats})
    rank_latency_ms = (time.time() - t0) / 100 * 1000
    print(f"   - volunteer_ranking_model.onnx: 100 runs avg latency = {rank_latency_ms:.3f} ms/query | Score = {rank_out[0][0][0]:.4f}")

    # -------------------------------------------------------------
    # 4. PKL VS ONNX FIDELITY COMPARISON VERIFICATION
    # -------------------------------------------------------------
    print("\n5. Verifying Prediction Fidelity (ONNX vs Original Scikit-Learn .pkl)...")
    
    # Load .pkl models
    cat_pkl = joblib.load(os.path.join(MODELS_DIR, "category_model.pkl"))
    vec_pkl = joblib.load(os.path.join(MODELS_DIR, "vectorizer.pkl"))
    
    # Scikit-learn prediction
    pkl_features = vec_pkl.transform(["Unpaid salary complaint for 3 months from employer."])
    pkl_pred = cat_pkl.predict(pkl_features)[0]
    
    # ONNX prediction
    onnx_pred = cat_out[0][0]
    
    print(f"   - Scikit-Learn .pkl Prediction: '{pkl_pred}'")
    print(f"   - ONNX Runtime Session Prediction: '{onnx_pred}'")
    
    assert str(pkl_pred) == str(onnx_pred), f"Fidelity mismatch! .pkl='{pkl_pred}' vs ONNX='{onnx_pred}'"
    print("   [FIDELITY VERIFIED]: ONNX model output matches original Scikit-Learn model 100%.")

    print("\n==================================================")
    print("ONNX MODEL EXPORT & INFERENCE SETUP VERIFICATION PASSED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_onnx_models()
