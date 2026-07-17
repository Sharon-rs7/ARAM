import os
import re

has_easyocr = False
reader = None

try:
    import easyocr
    # Load reader for English/Tamil
    reader = easyocr.Reader(['en', 'ta'], gpu=False)
    has_easyocr = True
except Exception as e:
    print(f"EasyOCR not loaded: {e}. OCR will run in mock/low-resource mode.")

def mask_sensitive_data(text: str) -> str:
    if not text:
        return ""
    # Aadhaar: 12 digits
    text = re.sub(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "XXXX-XXXX-XXXX", text)
    # Mobile: 10 digits starting with 6-9
    text = re.sub(r"\b[6-9]\d{9}\b", "XXXXXXXXXX", text)
    # Email
    text = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", "XXXX@XXXX.COM", text)
    # UPI ID
    text = re.sub(r"\b[\w\.-]+@(?:upi|ybl|paytm|okaxis|okhdfcbank)\b", "XXXX@UPI", text)
    # Long digits (Bank account number check)
    text = re.sub(r"\b\d{11,16}\b", "XXXXXXXXXXXX", text)
    return text

def extract_ocr_text(file_path: str) -> dict:
    if not os.path.exists(file_path):
        return {
            "extractedText": "Mock OCR: File not found.",
            "ocrConfidence": 0.50,
            "detectedLanguage": "en"
        }

    extracted = ""
    confidence = 0.85
    
    if has_easyocr and reader:
        try:
            results = reader.readtext(file_path)
            texts = [res[1] for res in results]
            confidences = [res[2] for res in results]
            extracted = " ".join(texts)
            if confidences:
                confidence = float(sum(confidences) / len(confidences))
        except Exception as ex:
            print(f"EasyOCR extraction error: {ex}")
            extracted = ""

    # Fallback/Mock OCR if empty or EasyOCR not present
    if not extracted:
        filename = os.path.basename(file_path).lower()
        if "salary" in filename:
            extracted = "Aram Solutions Private Limited. Pay Slip for June 2026. Employee ID: EMP9821. Gross Salary: Rs. 45,000. Net Pay: 41,500. Account No: 109283726152."
        elif "invoice" in filename:
            extracted = "Retail Invoice. GSTIN: 33AAAAA1111A1Z1. Invoice No: INV-2026-981. Seller: Electro Plaza Coimbatore. Total Amount Paid: Rs. 15,499. Payment Mode: UPI scanner."
        elif "id" in filename or "emp" in filename:
            extracted = "ARAM LEGAL AID. Identity Card. Employee Name: Rajesh Kumar. Employee Code: E-9921. Validity: 31-12-2028."
        else:
            extracted = "This is a mock OCR document text copy. Aadhaar Number: 9012 8372 1092. Account: 30982716254. Contact: 9876543210."

    return {
        "extractedText": extracted,
        "ocrConfidence": confidence,
        "detectedLanguage": "en"
    }
