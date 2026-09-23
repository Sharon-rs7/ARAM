import sys
import types

def test_no_synthetic_mock_modules_injected():
    import app.main
    
    suspicious_modules = [
        'numpy', 'joblib', 'easyocr', 'cv2', 'pandas', 'sklearn', 
        'sentence_transformers', 'tensorflow', 'keras', 'scipy', 
        'pytesseract', 'faster_whisper'
    ]
    
    for name in suspicious_modules:
        if name in sys.modules:
            mod = sys.modules[name]
            # A genuine installed library has __file__ attribute or __spec__
            assert getattr(mod, '__file__', None) is not None or getattr(mod, '__spec__', None) is not None, (
                f"Module '{name}' in sys.modules is a synthetic mock without __file__ or __spec__!"
            )
            # Must not contain mock placeholder classes
            assert not hasattr(mod, 'MockDataFrame'), f"Synthetic class 'MockDataFrame' found in {name}!"
            assert not hasattr(mod, 'MockWhisperModel'), f"Synthetic class 'MockWhisperModel' found in {name}!"

def test_source_code_has_no_sys_modules_mock_injection():
    # Enforce at the AST/source level that main.py does NOT inject mock modules into sys.modules
    import app.main
    main_file = app.main.__file__
    with open(main_file, "r", encoding="utf-8") as f:
        content = f.read()
    assert "sys.modules[mod_name] = mock_mod" not in content, (
        "Found 'sys.modules[mod_name] = mock_mod' in app/main.py! Synthetic mocks must be eliminated."
    )
