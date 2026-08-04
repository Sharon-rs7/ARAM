import os
import sys
import time
import io
import tempfile
from PIL import Image, ImageDraw

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ocr_queue import ocr_job_store

def test_async_ocr_queue_service():
    print("\n==================================================")
    print("TESTING ASYNC OCR QUEUE SERVICE WORKFLOW")
    print("==================================================")
    
    # 1. Create a dummy file
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, "test_salary_slip.png")
    
    img = Image.new('RGB', (400, 100), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 40), "Aram Solutions Pay Slip June 2026 Salary 45000", fill=(0, 0, 0))
    img.save(temp_file_path, format='PNG')
    
    # 2. Create Job
    job_id = ocr_job_store.create_job("test_salary_slip.png")
    print(f"\n1. Created Async Job ID: {job_id}")
    
    initial_job = ocr_job_store.get_job(job_id)
    assert initial_job["status"] == "PROCESSING", f"Expected PROCESSING status, got {initial_job['status']}"
    print(f"   Initial Job Status: '{initial_job['status']}'")
    
    # 3. Enqueue Background Execution
    print("\n2. Enqueuing job to background worker queue...")
    ocr_job_store.enqueue_background_job(job_id, temp_file_path)
    
    # 4. Poll until completed
    completed = False
    final_job = None
    for attempt in range(20):
        time.sleep(0.3)
        job = ocr_job_store.get_job(job_id)
        status = job["status"]
        print(f"   Poll Attempt {attempt+1}: status = '{status}'")
        if status == "COMPLETED":
            completed = True
            final_job = job
            break
            
    assert completed == True, f"Job failed to complete: {final_job}"
    
    result = final_job["result"]
    ocr_res = result["ocr"]
    doc_res = result["classification"]
    
    print("\n3. VERIFICATION OF COMPLETED ASYNC JOB:")
    print(f"   Job ID: {final_job['jobId']}")
    print(f"   Status: {final_job['status']}")
    print(f"   OCR Engine: {ocr_res.get('engine')}")
    print(f"   Extracted Text: '{ocr_res.get('rawText')}'")
    print(f"   Document Type: {doc_res.get('documentType')} (confidence: {doc_res.get('confidence')})")
    
    assert final_job["status"] == "COMPLETED"
    assert result["ocr"] is not None
    assert result["classification"] is not None
    
    print("\n==================================================")
    print("ASYNC OCR QUEUE SERVICE VERIFIED CLEANLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_async_ocr_queue_service()
