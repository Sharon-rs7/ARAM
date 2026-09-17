import os
import sys
import json

if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.nlp.multilingual_normalizer import normalize_text
from app.nlp.language_detector import language_detector
from app.complaint_classifier import keyword_category
from training.test_language_regression import TEST_CASES

print("--- REGRESSION DEBUGGER ---")
for i, case in enumerate(TEST_CASES):
    text = case["text"]
    lang_res = language_detector.detect(text)
    
    # Simulate analyze.py logic
    if lang_res.get("method") in ["unicode_script", "lexical_latin"] or lang_res.get("confidence", 0.0) >= 0.70:
        raw_lang = lang_res["language"]
    else:
        raw_lang = "en"  # languageHint="en" default
        
    raw_lang_lower = raw_lang.lower()
    if raw_lang_lower in ["tamil", "ta"]:
        if lang_res["language"] == "ta" and (lang_res.get("mixed") or lang_res.get("script") == "Latin"):
            detected_lang = "ta-en"
        else:
            detected_lang = "ta"
    elif raw_lang_lower in ["hindi", "hi"]:
        if lang_res["language"] == "hi" and (lang_res.get("mixed") or lang_res.get("script") == "Latin"):
            detected_lang = "hi-en"
        else:
            detected_lang = "hi"
    else:
        detected_lang = "en"
        
    norm_res = normalize_text(text, resolved_lang=detected_lang)
    norm_text = norm_res["normalizedText"]
    
    matched_cat, highest_matches = keyword_category(norm_text)
    
    # We only care about cases where matched_cat != expected_cat or detected_lang != expected_lang
    if matched_cat != case["expected_cat"] or detected_lang != case["expected_lang"]:
        print(f"\nCase {i}: '{text}'")
        print(f"  Expected Lang: {case['expected_lang']} -> Got: {detected_lang} (Detector: {lang_res['language']}, Method: {lang_res['method']}, Confidence: {lang_res['confidence']})")
        print(f"  Expected Cat: {case['expected_cat']} -> Got: {matched_cat} (Matches: {highest_matches})")
        print(f"  Normalized Text: '{norm_text}'")
