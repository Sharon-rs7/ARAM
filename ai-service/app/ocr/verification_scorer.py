def calculate_verification_score(
    ocr_confidence: float,
    image_quality: dict,
    doc_type_confidence: float,
    extracted_fields: dict,
    expected_type: str,
    predicted_type: str
) -> dict:
    reasons = []
    errors = []
    warnings = []
    
    # Check image quality validity first
    if not image_quality.get("isValid", False):
        return {
            "verificationScore": 0.0,
            "status": "REUPLOAD_REQUIRED",
            "reasons": [image_quality.get("message", "Poor image quality.")],
            "errors": ["IMAGE_QUALITY_FAIL"],
            "warnings": []
        }

    # 1. OCR Confidence score
    score_ocr = ocr_confidence
    
    # 2. Image Quality score (Normalized blur/contrast)
    blur = image_quality.get("blurScore", 100.0)
    contrast = image_quality.get("contrast", 50.0)
    score_quality = min(1.0, (blur / 200.0) + (contrast / 100.0))
    
    # 3. Document Type Match score
    type_match = expected_type.lower() == predicted_type.lower()
    score_type = doc_type_confidence if type_match else 0.0
    if not type_match:
        warnings.append(f"Expected document type '{expected_type}' but AI predicted '{predicted_type}'.")
        reasons.append("Document type mismatch.")
    else:
        reasons.append("Document type matches expectation.")
        
    # 4. Field completion score
    field_count = len(extracted_fields)
    score_fields = min(1.0, field_count / 3.0) if field_count > 0 else 0.0
    if field_count == 0:
        warnings.append("No critical key fields could be extracted from the document.")
        
    # Final weighted score
    final_score = (score_ocr * 0.3) + (score_quality * 0.3) + (score_type * 0.3) + (score_fields * 0.1)
    final_score = round(max(0.0, min(1.0, final_score)), 2)
    
    # Status rules
    status = "MANUAL_REVIEW_REQUIRED"
    if final_score >= 0.80 and type_match and field_count >= 1:
        status = "VERIFIED"
        reasons.append("Verification parameters satisfy all automated checks.")
    elif final_score < 0.60:
        status = "REUPLOAD_REQUIRED"
        reasons.append("Automation score is extremely low. Image needs re-capture.")
        errors.append("LOW_VERIFICATION_SCORE")
    else:
        reasons.append("Triage flags require human verification checks.")
        
    return {
        "verificationScore": final_score,
        "status": status,
        "reasons": reasons,
        "errors": errors,
        "warnings": warnings
    }
