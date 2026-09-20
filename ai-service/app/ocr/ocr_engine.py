import os
import re
import time
import json
import mimetypes
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
load_dotenv()

from app.ocr.image_quality import check_image_quality
from app.ocr.field_extractor import extract_document_fields

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.6-flash"
]

easyocr_available = False

def mask_sensitive_data(text: str) -> str:
    if not text:
        return ""
    # Mask Aadhaar numbers (12 digits, optional spaces/hyphens)
    text = re.sub(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "XXXX-XXXX-XXXX", text)
    # Mask Mobile numbers (10 digits starting with 6-9)
    text = re.sub(r"\b[6-9]\d{9}\b", "XXXXXXXXXX", text)
    # Mask Email addresses
    text = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", "XXXX@XXXX.COM", text)
    # Mask UPI IDs
    text = re.sub(r"\b[\w\.-]+@(?:upi|ybl|paytm|okaxis|okhdfcbank)\b", "XXXX@UPI", text)
    # Mask long digit strings (likely bank account numbers)
    text = re.sub(r"\b\d{11,16}\b", "XXXXXXXXXXXX", text)
    return text

def extract_pdf_text_local(file_path: str) -> str:
    """Extract local text from digital PDF using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        extracted = []
        for i, page in enumerate(reader.pages):
            p_text = page.extract_text()
            if p_text and p_text.strip():
                extracted.append(f"--- Page {i+1} ---\n" + p_text.strip())
        return "\n\n".join(extracted).strip()
    except Exception as e:
        print(f"[PDF_EXTRACT_ERROR] {e}")
        return ""

def _detect_mime_type(file_path: str, filename: str = "") -> str:
    check_name = filename or file_path
    lower = check_name.lower()
    if lower.endswith(".pdf"):
        return "application/pdf"
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".jpg") or lower.endswith(".jpeg"):
        return "image/jpeg"
    if lower.endswith(".webp"):
        return "image/webp"
    
    # Check magic bytes if file exists
    if os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                header = f.read(8)
                if header.startswith(b"%PDF"):
                    return "application/pdf"
                if header.startswith(b"\x89PNG\r\n\x1a\n"):
                    return "image/png"
                if header.startswith(b"\xff\xd8\xff"):
                    return "image/jpeg"
                if header.startswith(b"RIFF") and b"WEBP" in header:
                    return "image/webp"
        except Exception:
            pass
            
    guessed, _ = mimetypes.guess_type(check_name)
    return guessed or "image/jpeg"

def analyze_with_gemini_vision(
    file_bytes: bytes,
    mime_type: str,
    complaint_context: str = "",
    pre_extracted_text: str = ""
) -> Optional[Dict[str, Any]]:
    """
    Invokes Gemini Vision with automatic model fallback to extract verbatim OCR text
    and generate evidence analysis explaining how the document relates to legal grievances.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    context_prompt = ""
    if complaint_context and complaint_context.strip():
        context_prompt = f"\nCitizen's Grievance / Case Context:\n\"\"\"{complaint_context.strip()}\"\"\"\n"

    pre_text_prompt = ""
    if pre_extracted_text and pre_extracted_text.strip():
        pre_text_prompt = f"\nPre-extracted digital document text:\n\"\"\"{pre_extracted_text[:4000]}\"\"\"\n"

    system_instruction = (
        "You are the ARAM AI Legal Evidence Analyzer and Vision OCR Engine for legal aid in Tamil Nadu and India.\n"
        "Your task is twofold:\n"
        "1. Extract the EXACT, COMPLETE, VERBATIM text content from this document or image (OCR). Do NOT summarize or omit lines. If the document is in Tamil, Hindi, or English, transcribe the exact words accurately.\n"
        "2. Thoroughly analyze the document as legal evidence:\n"
        "   - Classify the precise document type (e.g., Tenancy Agreement, Rent Receipt, Salary Slip, Termination Letter, Patta Passbook, Sale Deed, Court Notice, Police FIR / CSR Copy, Medical Certificate, Electricity Bill, Bank Statement, WhatsApp Communication, Identity Proof).\n"
        "   - Determine how this evidence directly relates to legal claims, disputes, or grievances.\n"
        "   - Extract all critical entities: dates, reference/challan/registration numbers, parties named (landlord, tenant, employee, company, police station), and whether an official seal or signature is present.\n"
        "   - Evaluate evidentiary strength (STRONG, MODERATE, or PRELIMINARY) and provide actionable legal guidance to the citizen.\n"
        "\n"
        "Return ONLY a valid JSON object with these exact keys:\n"
        "{\n"
        '  "exactText": "verbatim OCR text transcribed from the document",\n'
        '  "documentType": "string",\n'
        '  "legibilityScore": 90,\n'
        '  "legibilityGrade": "High Quality / Clear",\n'
        '  "detectedDates": ["date1", "date2"],\n'
        '  "detectedReferenceNumbers": ["ref1", "id2"],\n'
        '  "detectedParties": ["party1", "party2"],\n'
        '  "sealOrSignatureDetected": true,\n'
        '  "evidenceSummary": "concise synopsis of what this document proves",\n'
        '  "legalRelevance": "detailed explanation of how this evidence supports or relates to the grievance",\n'
        '  "evidentiaryStrength": "STRONG",\n'
        '  "actionableAdvice": "practical advice for the citizen regarding this evidence"\n'
        "}"
    )

    full_prompt = f"{system_instruction}{context_prompt}{pre_text_prompt}"

    # Try google.genai first
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        
        for model in CANDIDATE_MODELS:
            try:
                contents = [
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                    full_prompt
                ]
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )
                if response and response.text:
                    raw_json = response.text.strip()
                    if raw_json.startswith("```"):
                        raw_json = re.sub(r"^```(?:json)?\s*", "", raw_json)
                        raw_json = re.sub(r"\s*```$", "", raw_json)
                    parsed = json.loads(raw_json)
                    return parsed
            except Exception as model_err:
                err_str = str(model_err).lower()
                print(f"[GEMINI VISION OCR] Model {model} attempt failed: {model_err}")
                if any(k in err_str for k in ["429", "quota", "resourceexhausted", "404", "not found"]):
                    continue
                continue
    except Exception as outer_err:
        print(f"[GENAI CLIENT ERROR] {outer_err}")

    # Fallback: google.generativeai
    try:
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=api_key)
        for model in CANDIDATE_MODELS:
            try:
                m = legacy_genai.GenerativeModel(model)
                parts = [{"mime_type": mime_type, "data": file_bytes}, full_prompt]
                response = m.generate_content(
                    parts,
                    generation_config={"response_mime_type": "application/json", "temperature": 0.1}
                )
                if response and response.text:
                    raw_json = response.text.strip()
                    if raw_json.startswith("```"):
                        raw_json = re.sub(r"^```(?:json)?\s*", "", raw_json)
                        raw_json = re.sub(r"\s*```$", "", raw_json)
                    return json.loads(raw_json)
            except Exception as legacy_err:
                print(f"[LEGACY GENAI OCR] Model {model} attempt failed: {legacy_err}")
                continue
    except Exception as e:
        print(f"[LEGACY GENAI CLIENT ERROR] {e}")

    return None

def extract_ocr_and_analyze_evidence(
    file_path: str,
    filename: str = "",
    complaint_context: str = ""
) -> Dict[str, Any]:
    start_time = time.time()
    
    if not os.path.exists(file_path):
        return {
            "rawText": "",
            "exactText": "",
            "extractedText": "",
            "maskedText": "",
            "documentType": "Unknown",
            "legibilityScore": 0,
            "legibilityGrade": "Unreadable",
            "detectedDates": [],
            "detectedReferenceNumbers": [],
            "detectedParties": [],
            "sealOrSignatureDetected": False,
            "caseRelevance": "File not found.",
            "evidenceSummary": "No document provided.",
            "legalRelevance": "Document could not be verified.",
            "evidentiaryStrength": "PRELIMINARY",
            "actionableAdvice": "Please upload a valid document or image.",
            "evidenceAnalysis": {
                "summary": "No document provided.",
                "legalRelevance": "Document could not be verified.",
                "evidentiaryStrength": "PRELIMINARY",
                "actionableAdvice": "Please upload a valid document or image."
            },
            "engine": "none",
            "averageConfidence": 0.0,
            "processingTimeMs": 0
        }

    mime_type = _detect_mime_type(file_path, filename)
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # If PDF, attempt local text extraction first
    pdf_local_text = ""
    if mime_type == "application/pdf":
        pdf_local_text = extract_pdf_text_local(file_path)

    # Invoke Gemini Vision / Multimodal analysis
    gemini_result = analyze_with_gemini_vision(
        file_bytes=file_bytes,
        mime_type=mime_type,
        complaint_context=complaint_context,
        pre_extracted_text=pdf_local_text
    )

    elapsed_ms = int((time.time() - start_time) * 1000)

    if gemini_result:
        exact_text = gemini_result.get("exactText") or pdf_local_text or ""
        doc_type = gemini_result.get("documentType") or "Supporting Document"
        legibility = int(gemini_result.get("legibilityScore", 85))
        legibility_grade = gemini_result.get("legibilityGrade") or ("High Quality / Clear" if legibility >= 75 else "Acceptable")
        dates = gemini_result.get("detectedDates") or []
        refs = gemini_result.get("detectedReferenceNumbers") or []
        parties = gemini_result.get("detectedParties") or []
        seal = bool(gemini_result.get("sealOrSignatureDetected", False))
        summary = gemini_result.get("evidenceSummary") or f"{doc_type} verified and extracted successfully."
        relevance = gemini_result.get("legalRelevance") or f"This {doc_type} provides evidence supporting the citizen's grievance."
        strength = gemini_result.get("evidentiaryStrength") or "STRONG"
        advice = gemini_result.get("actionableAdvice") or "Retain the original document securely for legal consultation."

        # Supplement with regex field extractor if empty
        if not dates or not refs or not parties:
            fields_from_text = extract_document_fields(exact_text, doc_type)
            if not dates:
                dates = fields_from_text.get("detectedDates", [])
            if not refs:
                refs = fields_from_text.get("detectedReferenceNumbers", [])
            if not parties:
                parties = fields_from_text.get("detectedParties", [])

        return {
            "rawText": exact_text,
            "exactText": exact_text,
            "extractedText": exact_text,
            "maskedText": mask_sensitive_data(exact_text),
            "documentType": doc_type,
            "legibilityScore": legibility,
            "legibilityGrade": legibility_grade,
            "detectedDates": dates,
            "detectedReferenceNumbers": refs,
            "detectedParties": parties,
            "sealOrSignatureDetected": seal,
            "caseRelevance": relevance,
            "evidenceSummary": summary,
            "legalRelevance": relevance,
            "evidentiaryStrength": strength,
            "actionableAdvice": advice,
            "evidenceAnalysis": {
                "summary": summary,
                "legalRelevance": relevance,
                "evidentiaryStrength": strength,
                "actionableAdvice": advice,
                "documentType": doc_type
            },
            "engine": "gemini_vision_multimodal",
            "averageConfidence": round(legibility / 100.0, 2),
            "processingTimeMs": elapsed_ms
        }

    # Fallback if Gemini Vision is unavailable: use PDF local text or regex field extractor
    raw_text = pdf_local_text
    fields_res = extract_document_fields(raw_text) if raw_text else {}
    doc_type = "Supporting Evidence Document"
    if "rent" in raw_text.lower() or "landlord" in raw_text.lower():
        doc_type = "Rental Agreement / Tenancy Proof"
    elif "salary" in raw_text.lower() or "wages" in raw_text.lower():
        doc_type = "Salary Slip / Wage Record"
    elif "fir" in raw_text.lower() or "police" in raw_text.lower():
        doc_type = "Police FIR / CSR Copy"

    return {
        "rawText": raw_text,
        "exactText": raw_text,
        "extractedText": raw_text,
        "maskedText": mask_sensitive_data(raw_text),
        "documentType": doc_type,
        "legibilityScore": fields_res.get("legibilityScore", 75),
        "legibilityGrade": fields_res.get("legibilityGrade", "Acceptable"),
        "detectedDates": fields_res.get("detectedDates", []),
        "detectedReferenceNumbers": fields_res.get("detectedReferenceNumbers", []),
        "detectedParties": fields_res.get("detectedParties", []),
        "sealOrSignatureDetected": fields_res.get("sealOrSignatureDetected", False),
        "caseRelevance": f"{doc_type} formatted and recorded for legal verification.",
        "evidenceSummary": f"Uploaded {doc_type} parsed with local document extractor.",
        "legalRelevance": f"Provides documentary evidence for grievance verification under applicable statutory rules.",
        "evidentiaryStrength": "MODERATE",
        "actionableAdvice": "Present physical original during volunteer or Legal Services Authority consultation.",
        "evidenceAnalysis": {
            "summary": f"Uploaded {doc_type} recorded.",
            "legalRelevance": "Documentary proof for case triage.",
            "evidentiaryStrength": "MODERATE",
            "actionableAdvice": "Keep original document safe."
        },
        "engine": "local_document_extractor",
        "averageConfidence": 0.75,
        "processingTimeMs": elapsed_ms
    }

def extract_ocr_text(file_path: str) -> Dict[str, Any]:
    """Compatibility wrapper that delegates to extract_ocr_and_analyze_evidence."""
    return extract_ocr_and_analyze_evidence(file_path)

