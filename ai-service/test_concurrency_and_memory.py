import os
import sys
import time
import io
import tempfile
import psutil
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def create_real_ocr_image(doc_id: int) -> bytes:
    img = Image.new('RGB', (800, 250), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
        
    d.text((30, 30), f"ARAM LEGAL AID COMPLAINT ATTACHMENT #{doc_id}", fill=(0, 0, 0), font=font)
    d.text((30, 80), f"Salary Statement Employee ID: EMP-2026-90{doc_id}", fill=(0, 0, 0), font=font)
    d.text((30, 130), f"Monthly Wage Net Payment: Rs. {40000 + doc_id * 500}", fill=(0, 0, 0), font=font)
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def run_concurrency_and_memory_test():
    print("\n==================================================")
    print("10 CONCURRENT ASYNC OCR BURST & MEMORY STABILITY TEST")
    print("==================================================")
    
    process = psutil.Process(os.getpid())
    ram_before_mb = round(process.memory_info().rss / (1024 * 1024), 2)
    print(f"\n1. Initial FastAPI API Process RAM: {ram_before_mb} MB")
    
    with TestClient(app) as client:
        # Pre-generate 10 images
        image_bytes_list = [create_real_ocr_image(i+1) for i in range(10)]
        
        def post_async_job(idx: int):
            img_data = image_bytes_list[idx]
            files = {"file": (f"salary_document_{idx+1}.png", img_data, "image/png")}
            t0 = time.time()
            resp = client.post("/documents/ocr/async", files=files)
            latency_ms = round((time.time() - t0) * 1000, 2)
            return {
                "idx": idx + 1,
                "status_code": resp.status_code,
                "latency_ms": latency_ms,
                "data": resp.json()
            }
            
        print("\n2. Firing 10 Concurrent Uploads at POST /documents/ocr/async...")
        t_burst_start = time.time()
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(post_async_job, i) for i in range(10)]
            post_results = [f.result() for f in futures]
            
        t_burst_total_ms = round((time.time() - t_burst_start) * 1000, 2)
        ram_after_burst_mb = round(process.memory_info().rss / (1024 * 1024), 2)
        ram_delta_mb = round(ram_after_burst_mb - ram_before_mb, 2)
        
        print(f"\n   Burst Finished in Total: {t_burst_total_ms} ms")
        print(f"   API Process RAM Immediately After 10 Concurrent Enqueues: {ram_after_burst_mb} MB (Delta: {ram_delta_mb} MB)")
        print("\n   [CONCURRENT HTTP LATENCY RESULTS]:")
        for res in post_results:
            print(f"   Upload #{res['idx']}: Code = {res['status_code']}, Latency = {res['latency_ms']} ms, JobId = {res['data'].get('jobId')}")
            assert res['status_code'] == 202, f"Upload #{res['idx']} failed with {res['status_code']}"
            assert res['latency_ms'] < 3000, f"Upload #{res['idx']} blocked! Latency: {res['latency_ms']} ms"

        job_ids = [res['data'].get('jobId') for res in post_results]
        
        print("\n3. Polling All 10 Jobs Until COMPLETED by Background Workers...")
        completed_jobs = {}
        t_poll_start = time.time()
        for attempt in range(60):
            time.sleep(1.0)
            all_done = True
            for jid in job_ids:
                if jid in completed_jobs:
                    continue
                s_resp = client.get(f"/documents/ocr/status/{jid}")
                s_data = s_resp.json()
                if s_data.get("status") == "COMPLETED":
                    completed_jobs[jid] = s_data
                else:
                    all_done = False
            
            print(f"   Poll Attempt #{attempt+1}: {len(completed_jobs)}/10 jobs completed...")
            if all_done:
                break
                
        t_poll_total_sec = round(time.time() - t_poll_start, 2)
        ram_final_mb = round(process.memory_info().rss / (1024 * 1024), 2)
        
        print(f"\n4. [FINAL CONCURRENCY & MEMORY VERIFICATION SUMMARY]:")
        print(f"   All 10 Async OCR Jobs Completed in: {t_poll_total_sec} seconds")
        print(f"   Final Process Memory: {ram_final_mb} MB")
        print(f"   Number of Successfully Completed Jobs: {len(completed_jobs)}/10")
        
        for idx, (jid, jdata) in enumerate(completed_jobs.items()):
            ocr = jdata['result']['ocr']
            doc = jdata['result']['classification']
            print(f"   Job #{idx+1} ({jid}): engine='{ocr['engine']}', text='{ocr['rawText'][:50]}...', docType='{doc['documentType']}'")
            assert ocr['engine'] == "easyocr", f"Job {jid} did not use EasyOCR"
            
        assert len(completed_jobs) == 10, f"Only {len(completed_jobs)}/10 jobs completed"
        
        print("\n==================================================")
        print("ALL 10 CONCURRENT ASYNC OCR JOBS COMPLETED SUCCESSFULLY!")
        print("==================================================\n")

if __name__ == "__main__":
    run_concurrency_and_memory_test()
