import os
import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType, StringTensorType

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

def convert_model_to_onnx(model_name, num_features=5000):
    pkl_path = os.path.join(MODELS_DIR, f"{model_name}.pkl")
    onnx_path = os.path.join(MODELS_DIR, f"{model_name}.onnx")
    
    if not os.path.exists(pkl_path):
        print(f"[SKIP] Model file {pkl_path} not found.")
        return
        
    try:
        model = joblib.load(pkl_path)
        print(f"Loaded {model_name}.pkl successfully. Converting to ONNX...")
        
        # Scikit-learn LogisticRegression or Classifier input schema
        initial_type = [('float_input', FloatTensorType([None, num_features]))]
        
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(onnx_path, "wb") as f:
            f.write(onnx_model.SerializeToString())
            
        print(f"[SUCCESS] Exported ONNX model to {onnx_path}")
    except Exception as e:
        print(f"[WARN] ONNX conversion for {model_name} skipped/failed: {e}")

def main():
    print("\n==================================================")
    print("CONVERTING PKL CLASSIFIERS TO SECURE ONNX FORMAT")
    print("==================================================")
    
    models_to_convert = [
        "category_model",
        "priority_model",
        "authority_model",
        "document_model",
        "complaint_classifier"
    ]
    
    for m in models_to_convert:
        convert_model_to_onnx(m)
        
    print("==================================================\n")

if __name__ == "__main__":
    main()
