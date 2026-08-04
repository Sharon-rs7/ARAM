import os
import sys
import time
import io
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def create_sample_salary_image():
    img = Image.new('RGB', (400, 100), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 40), "Salary payslip June 2026 Total Salary 45000", fill=(0, 0, 0))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def test_async_ocr_queue_workflow():
    print("\n==================================================")
    print("TESTING ASYNC OCR QUEUE WORKFLOW (202 ACCEPTED & STATUS)")
    print("==================================================")
    
    with TestClient(app) as client:
        sample_png = create_sample_salary_image()
        files = {"file": ("salary_slip_june.png", sample_png, "image/png")}
        
        # 1. Test POST /documents/ocr/async -> HTTP 202 Accepted
        response = client.post("/documents/ocr/async", files=files)
        print(f"\n1. [POST /documents/ocr/async]: Status Code = {response.status_code}")
        print(f"   Response Payload: {response.json()}")
        
        assert response.status_code == 202, f"Expected HTTP 202, got {response.status_code}"
        data = response.json()
        job_id = data.get("jobId")
        assert job_id is not None, "Job ID missing from async response"
        assert data.get("status") == "PROCESSING", f"Expected PROCESSING status, got {data.get('status')}"
        
        # 2. Test GET /documents/ocr/status/{job_id} -> Poll until COMPLETED
        print(f"\n2. [GET /documents/ocr/status/{job_id}]: Polling for completion...")
        
        completed = False
        final_job = None
        for attempt in range(15):
            time.sleep(0.4)
            status_resp = client.get(f"/documents/ocr/status/{job_id}")
            assert status_resp.status_code == 200, f"Expected HTTP 200 on status poll, got {status_resp.status_code}"
            
            job_data = status_resp.json()
            status_state = job_data.get("status")
            print(f"   Attempt {attempt+1}: status = '{status_state}'")
            
            if status_state == "COMPLETED":
                completed = True
                final_job = job_data
                break
                
        assert completed == True, f"Async OCR job failed to complete, current state: {job_data}"
        
        result = final_job.get("result", {})
        ocr_data = result.get("ocr", {})
        class_data = result.get("classification", {})
        
        print(f"\n3. [JOB COMPLETED VERIFICATION]:")
        print(f"   Job ID: {final_job['jobId']}")
        print(f"   Status: {final_job['status']}")
        print(f"   OCR Engine Used: {ocr_data.get('engine')}")
        print(f"   Extracted OCR Text: '{ocr_data.get('rawText')}'")
        print(f"   Document Classification: {class_data.get('documentType')} (confidence: {class_data.get('confidence')})")
        
        assert ocr_data is not None, "OCR result is missing"
        assert class_data is not None, "Classification result is missing"

        print("\n==================================================")
        print("ASYNC OCR QUEUE VERIFICATION PASSED CLEANLY!")
        print("==================================================\n")

if __name__ == "__main__":
    test_async_ocr_queue_workflow()
