import os
import json
from app.ocr_engine import extract_ocr_text, mask_sensitive_data

KEYWORDS_PATH = "datasets/document_keywords.json"

def verify_document_service(file_path: str, expected_type: str, category: str) -> dict:
    # 1. OCR Text Extraction
    ocr_res = extract_ocr_text(file_path)
    extracted_text = ocr_res["extractedText"]
    ocr_conf = ocr_res["ocrConfidence"]
    
    ocr_masked = mask_sensitive_data(extracted_text)

    # 2. DL predicted type (Simulated or TF loading)
    # Check if expected matches filename keywords to set high CNN confidence for demo
    filename = os.path.basename(file_path).lower()
    predicted_type = expected_type
    cnn_conf = 0.90 if (expected_type.lower() in filename or "slip" in filename or "invoice" in filename) else 0.50
    
    # 3. Keyword scoring
    keywords = []
    if os.path.exists(KEYWORDS_PATH):
        try:
            with open(KEYWORDS_PATH, "r") as f:
                keyword_data = json.load(f)
                keywords = keyword_data.get(expected_type, [])
        except Exception:
            pass
            
    # Default keywords if JSON not loaded
    if not keywords:
        keywords = ["salary", "invoice", "patta", "fir", "id", "employee", "bank", "statement"]

    matched = []
    missing = []
    for kw in keywords:
        if kw.lower() in extracted_text.lower():
            matched.append(kw)
        else:
            missing.append(kw)

    keyword_score = len(matched) / len(keywords) if keywords else 0.0

    # 4. Final verification score formula
    file_quality = 0.90  # mock quality score
    final_score = (cnn_conf * 0.5) + (keyword_score * 0.4) + (file_quality * 0.1)

    status = "REJECTED"
    if final_score >= 0.75:
        status = "VERIFIED"
    elif final_score >= 0.50:
        status = "NEEDS_MANUAL_REVIEW"

    return {
        "documentType": predicted_type,
        "ocrTextMasked": ocr_masked,
        "ocrConfidence": ocr_conf,
        "cnnConfidence": cnn_conf,
        "keywordScore": keyword_score,
        "finalScore": round(final_score, 2),
        "status": status,
        "matchedKeywords": matched,
        "missingKeywords": missing
    }
