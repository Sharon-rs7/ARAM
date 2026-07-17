def classify_document(filename: str = "", extracted_text: str = "") -> dict:
    text = f"{filename} {extracted_text}".lower()
    if "salary" in text or "wage" in text:
        document_type = "SALARY_SLIP"
    elif "bank" in text or "account" in text:
        document_type = "BANK_STATEMENT"
    elif "aadhaar" in text or "identity" in text or "id" in text:
        document_type = "IDENTITY_PROOF"
    else:
        document_type = "UNKNOWN"
    return {"documentType": document_type, "confidence": 0.65 if document_type != "UNKNOWN" else 0.25}
