import os
import sys
import time
import tempfile
from PIL import Image, ImageDraw, ImageFont

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ocr_engine import extract_ocr_text

def test_real_easyocr_execution():
    print("\n==================================================")
    print("TESTING REAL EASYOCR PYTORCH EXECUTION & REAL TIMING")
    print("==================================================")
    
    # Create realistic printed image document
    img = Image.new('RGB', (800, 300), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except Exception:
        font = ImageFont.load_default()
        
    d.text((30, 40), "ARAM SOLUTIONS PRIVATE LIMITED", fill=(0, 0, 0), font=font)
    d.text((30, 90), "Employee Wage Pay Slip for Month: July 2026", fill=(0, 0, 0), font=font)
    d.text((30, 140), "Gross Salary Amount: Rs. 45000 Net Pay: 41500", fill=(0, 0, 0), font=font)
    d.text((30, 190), "Aadhaar Card Reference: 9012 8372 1092", fill=(0, 0, 0), font=font)
    
    temp_path = os.path.join(tempfile.gettempdir(), "real_easyocr_sample.png")
    img.save(temp_path, format="PNG")
    
    start_time = time.time()
    res = extract_ocr_text(temp_path)
    total_time_sec = round(time.time() - start_time, 3)
    
    print(f"\n1. REAL EasyOCR Processing Time: {total_time_sec} seconds ({res.get('processingTimeMs')} ms)")
    print(f"2. Engine Used: '{res.get('engine')}'")
    print(f"3. Average Confidence: {res.get('averageConfidence')}")
    print(f"4. Raw Extracted Text:\n----------------------------------------\n{res.get('rawText')}\n----------------------------------------")
    print(f"5. Detected Bounding Box Blocks Count: {len(res.get('blocks', []))}")
    for idx, blk in enumerate(res.get('blocks', [])[:5]):
        print(f"   Block {idx+1}: text='{blk['text']}', conf={blk['confidence']}")
        
    assert res.get('engine') == "easyocr", f"Expected engine 'easyocr', got '{res.get('engine')}'"
    assert total_time_sec >= 0.5, "EasyOCR execution should take real PyTorch CPU time"
    assert "ARAM" in res.get('rawText', '') or "Salary" in res.get('rawText', '') or "Aadhaar" in res.get('rawText', '') or len(res.get('blocks', [])) > 0, "EasyOCR failed to detect bounding box text"
    
    print("\n==================================================")
    print("REAL EASYOCR EXECUTION TEST PASSED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_real_easyocr_execution()
