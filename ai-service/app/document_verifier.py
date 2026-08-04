import os
from app.ocr.image_quality import check_image_quality
from app.ocr.ocr_engine import extract_ocr_text, mask_sensitive_data
from app.ocr.document_classifier import document_classifier
from app.ocr.field_extractor import extract_fields
from app.ocr.verification_scorer import calculate_verification_score
from app.ml.model_loader import ml_model_loader

def verify_document_service(file_path: str, expected_type: str, category: str) -> dict:
    # 1. Image Quality Check
    quality_res = check_image_quality(file_path)
    if not quality_res.get("isValid", False):
        return {
            "documentType": expected_type,
            "ocrTextMasked": "",
            "ocrConfidence": 0.0,
            "imageQualityScore": 0.0,
            "verificationScore": 0.0,
            "status": "REUPLOAD_REQUIRED",
            "reasons": [quality_res.get("message", "Blurry or dark image.")],
            "errors": ["IMAGE_QUALITY_FAIL"],
            "warnings": [],
            "extractedFields": {},
            "engine": "none",
            "modelVersion": ml_model_loader.get_version()
        }

    # 2. OCR Text Extraction
    ocr_res = extract_ocr_text(file_path)
    raw_text = ocr_res["rawText"]
    ocr_conf = ocr_res["averageConfidence"]
    ocr_masked = mask_sensitive_data(raw_text)
    
    # 3. Document Type Classification
    class_res = document_classifier.classify(raw_text)
    predicted_type = class_res["documentType"]
    class_conf = class_res["confidence"]
    
    # 4. Field Extraction
    extracted_fields = extract_fields(raw_text, predicted_type)
    
    # 5. Verification Scoring
    score_res = calculate_verification_score(
        ocr_confidence=ocr_conf,
        image_quality=quality_res,
        doc_type_confidence=class_conf,
        extracted_fields=extracted_fields,
        expected_type=expected_type,
        predicted_type=predicted_type
    )
    
    # Standardize image quality score for the response
    blur = quality_res.get("blurScore", 100.0)
    contrast = quality_res.get("contrast", 50.0)
    quality_score = round(min(1.0, (blur / 200.0) + (contrast / 100.0)), 2)

    return {
        "documentType": predicted_type,
        "ocrTextMasked": ocr_masked,
        "ocrConfidence": ocr_conf,
        "imageQualityScore": quality_score,
        "verificationScore": score_res["verificationScore"],
        "status": score_res["status"],
        "reasons": score_res["reasons"],
        "errors": score_res["errors"],
        "warnings": score_res["warnings"],
        "extractedFields": extracted_fields,
        "engine": ocr_res["engine"],
        "modelVersion": ml_model_loader.get_version()
    }
