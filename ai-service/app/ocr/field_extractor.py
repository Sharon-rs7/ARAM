import re
from typing import Dict, Any, List

def extract_document_fields(ocr_text: str, doc_type: str = "General Supporting Document") -> Dict[str, Any]:
    if not ocr_text:
        return {
            "legibilityScore": 0,
            "legibilityGrade": "Unreadable",
            "extractedFields": {},
            "detectedParties": [],
            "detectedDates": [],
            "detectedReferenceNumbers": [],
            "sealOrSignatureDetected": False,
            "caseRelevance": "Unknown",
            "verificationStatus": "NEEDS_HUMAN_CONFIRMATION",
            "disclaimer": "OCR extracted data is for administrative triage only and does not constitute statutory legal proof."
        }

    # 1. Date Detection
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{2,4}\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}[\s,]+\d{2,4}\b'
    ]
    detected_dates = []
    for pat in date_patterns:
        matches = re.findall(pat, ocr_text, re.IGNORECASE)
        for m in matches:
            clean_d = m.strip()
            if clean_d not in detected_dates:
                detected_dates.append(clean_d)

    # 2. Reference / Registration Numbers
    ref_patterns = [
        r'\b(?:FIR|F\.I\.R|Crime|Cr)\s*(?:No\.?|Number)?\s*[:#-]?\s*([A-Za-z0-9/_-]+)',
        r'\b(?:Doc|Deed|Sale Deed)\s*(?:No\.?|Number)?\s*[:#-]?\s*([A-Za-z0-9/_-]+)',
        r'\b(?:Survey|Sy|S\.No)\s*(?:No\.?|Number)?\s*[:#-]?\s*([A-Za-z0-9/_-]+)',
        r'\b(?:Patta|Chitta)\s*(?:No\.?|Number)?\s*[:#-]?\s*([A-Za-z0-9/_-]+)',
        r'\b(?:Bill|Invoice|Receipt)\s*(?:No\.?|Number)?\s*[:#-]?\s*([A-Za-z0-9/_-]+)',
        r'\b(?:A/C|Account|Acc)\s*(?:No\.?|Number)?\s*[:#-]?\s*([0-9]{4,16})',
        r'\b(?:GSTIN|GST)\s*[:#-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})'
    ]
    detected_refs = []
    for pat in ref_patterns:
        matches = re.findall(pat, ocr_text, re.IGNORECASE)
        for m in matches:
            clean_ref = m.strip()
            if len(clean_ref) >= 3 and clean_ref not in detected_refs:
                detected_refs.append(clean_ref)

    # 3. Party / Individual Names
    party_patterns = [
        r'\b(?:S/o|D/o|W/o|Mr\.|Mrs\.|Ms\.|Shri|Smt\.|Thiru|Tmt\.)\s+([A-Za-z\s]{3,30})',
        r'\b(?:Petitioner|Complainant|Applicant|Accused|Respondent)\s*[:#-]?\s*([A-Za-z\s]{3,30})',
        r'\b(?:Tenant|Landlord|Purchaser|Vendor)\s*[:#-]?\s*([A-Za-z\s]{3,30})'
    ]
    detected_parties = []
    for pat in party_patterns:
        matches = re.findall(pat, ocr_text, re.IGNORECASE)
        for m in matches:
            clean_name = m.strip().title()
            if len(clean_name) >= 3 and clean_name not in detected_parties:
                detected_parties.append(clean_name)

    # 4. Seal / Signature Detection Indicators
    seal_keywords = ["seal", "signature", "signed", "sub-registrar", "station officer", "authorized signatory", "stamped"]
    seal_detected = any(kw in ocr_text.lower() for kw in seal_keywords)

    # 5. Legibility Score Calculation (0-100)
    # Based on character count, alphanumeric ratio, word length sanity
    words = ocr_text.split()
    total_words = len(words)
    alphanumeric_chars = sum(1 for c in ocr_text if c.isalnum())
    total_chars = max(1, len(ocr_text))
    alpha_ratio = alphanumeric_chars / total_chars
    
    score = 50
    if total_words > 10:
        score += 20
    if total_words > 30:
        score += 10
    if alpha_ratio > 0.65:
        score += 10
    if detected_dates:
        score += 5
    if detected_refs:
        score += 5
    score = min(98, max(20, score))

    if score >= 75:
        grade = "High Quality / Clear"
    elif score >= 50:
        grade = "Acceptable / Legible"
    else:
        grade = "Low / Faint Scan"

    # 6. Case Relevance Status
    relevant_doc_types = [
        "Police Complaint / FIR Copy", "Rent Agreement", "Property Document", 
        "Salary Slip", "Bank Statement", "Consumer Bill / Invoice", "Medical Report"
    ]
    if doc_type in relevant_doc_types or detected_refs:
        case_relevance = "Relevant Evidence"
    else:
        case_relevance = "Supporting Context"

    return {
        "legibilityScore": score,
        "legibilityGrade": grade,
        "documentType": doc_type,
        "extractedFields": {
            "dates": detected_dates[:3],
            "referenceNumbers": detected_refs[:3],
            "parties": detected_parties[:3],
            "sealOrSignatureIndicator": seal_detected
        },
        "detectedParties": detected_parties[:3],
        "detectedDates": detected_dates[:3],
        "detectedReferenceNumbers": detected_refs[:3],
        "sealOrSignatureDetected": seal_detected,
        "caseRelevance": case_relevance,
        "verificationStatus": "NEEDS_HUMAN_CONFIRMATION",
        "statutoryDisclaimer": "Administrative OCR inspection only. Legal authenticity must be confirmed by the assigned Legal Guide."
    }

def extract_fields(ocr_text: str, doc_type: str = "General Supporting Document") -> Dict[str, Any]:
    res = extract_document_fields(ocr_text, doc_type)
    return {
        "dates": res.get("detectedDates", []),
        "referenceNumbers": res.get("detectedReferenceNumbers", []),
        "parties": res.get("detectedParties", []),
        "sealDetected": res.get("sealOrSignatureDetected", False),
        "legibilityScore": res.get("legibilityScore", 70)
    }

