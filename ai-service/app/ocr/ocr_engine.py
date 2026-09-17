import os
import re
import time
from app.ocr.image_quality import check_image_quality

# Initialize EasyOCR reader safely
easyocr_available = False
reader = None
try:
    import easyocr
    reader = easyocr.Reader(['en'], gpu=False)
    easyocr_available = True
    print("REAL EasyOCR PyTorch reader loaded successfully in ocr_engine.")
except Exception as e:
    import traceback
    print(f"EasyOCR not loaded: {e}. Traceback: {traceback.format_exc()}. Falling back to mock/low-resource.")

# Pytesseract check
pytesseract_available = False
try:
    import pytesseract
    pytesseract.get_tesseract_version()
    pytesseract_available = True
except Exception:
    pass

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

def extract_ocr_text(file_path: str) -> dict:
    start_time = time.time()
    
    if not os.path.exists(file_path):
        return {
            "rawText": "",
            "blocks": [],
            "averageConfidence": 0.0,
            "engine": "none",
            "languageDetected": "en",
            "processingTimeMs": 0
        }

    raw_text = ""
    blocks = []
    confidence = 0.0
    engine_name = "none"
    lang_detected = "en"

    # If EasyOCR is available, perform extraction
    if easyocr_available and reader is not None:
        try:
            results = reader.readtext(file_path)
            engine_name = "easyocr"
            
            conf_sum = 0.0
            for bbox, text, conf in results:
                raw_text += text + "\n"
                blocks.append({
                    "text": text,
                    "box": [[int(pt[0]), int(pt[1])] for pt in bbox],
                    "confidence": float(conf)
                })
                conf_sum += conf
                
            raw_text = raw_text.strip()
            if results:
                confidence = float(conf_sum / len(results))
            else:
                confidence = 0.90  # clean empty image
        except Exception as ex:
            print(f"EasyOCR extraction error: {ex}")
            
    # Fallback to Tesseract if EasyOCR failed/not present
    if not raw_text and pytesseract_available:
        try:
            from PIL import Image
            engine_name = "tesseract"
            img = Image.open(file_path)
            raw_text = pytesseract.image_to_string(img, lang="eng+tam").strip()
            confidence = 0.85
        except Exception as ex:
            print(f"Tesseract extraction error: {ex}")

    # If no text could be extracted, do not fabricate synthetic text
    if not raw_text:
        engine_name = "none"
        raw_text = ""
        confidence = 0.0

    # Simple language detection logic based on character sets
    if any(ord(c) >= 0x0B80 and ord(c) <= 0x0BFF for c in raw_text):
        lang_detected = "ta"
    elif any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in raw_text):
        lang_detected = "hi"
    else:
        lang_detected = "en"

    processing_time = int((time.time() - start_time) * 1000)

    return {
        "rawText": raw_text,
        "blocks": blocks,
        "averageConfidence": round(confidence, 3),
        "engine": engine_name,
        "languageDetected": lang_detected,
        "processingTimeMs": processing_time
    }
