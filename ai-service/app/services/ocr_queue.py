import os
import json
import uuid
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional

import redis

from app.ocr_engine import extract_ocr_text
from app.ocr.document_classifier import document_classifier
from app.mongo_logger import log_ai_action

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

def get_redis_client():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_timeout=1)
        if r.ping():
            return r
    except Exception:
        pass
    return None

class OCRJobStore:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=8)

    def create_job(self, filename: str) -> str:
        job_id = f"ocr_job_{uuid.uuid4().hex[:12]}"
        job_data = {
            "jobId": job_id,
            "status": "PROCESSING",
            "filename": filename,
            "result": None,
            "error": None,
            "createdAt": time.time(),
            "completedAt": None
        }
        
        r = get_redis_client()
        if r:
            try:
                r.setex(f"ocr_job:{job_id}", 3600, json.dumps(job_data))
            except Exception:
                pass
        
        with self._lock:
            self._jobs[job_id] = job_data
            
        return job_id

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        r = get_redis_client()
        if r:
            try:
                raw = r.get(f"ocr_job:{job_id}")
                if raw:
                    return json.loads(raw.decode("utf-8"))
            except Exception:
                pass
                    
        with self._lock:
            return self._jobs.get(job_id)

    def update_job(self, job_id: str, status: str, result: Dict[str, Any] = None, error: str = None):
        job_data = self.get_job(job_id) or {
            "jobId": job_id,
            "filename": "unknown",
            "createdAt": time.time()
        }
        
        job_data["status"] = status
        job_data["completedAt"] = time.time()
        if result:
            job_data["result"] = result
        if error:
            job_data["error"] = error

        r = get_redis_client()
        if r:
            try:
                r.setex(f"ocr_job:{job_id}", 3600, json.dumps(job_data))
            except Exception:
                pass

        with self._lock:
            self._jobs[job_id] = job_data

    def enqueue_job(self, job_id: str, temp_file_path: str):
        r = get_redis_client()
        redis_status = "ACTIVE (TCP Redis Port 6379)" if r else "INACTIVE (In-Memory Fallback)"
        print(f"[OCR QUEUE] Enqueuing job '{job_id}' to Background Worker Pool. Redis Connection: {redis_status}.")
        self._executor.submit(execute_ocr_processing, job_id, temp_file_path)

ocr_job_store = OCRJobStore()

def execute_ocr_processing(job_id: str, temp_file_path: str) -> Dict[str, Any]:
    print(f"\n[BACKGROUND WORKER] Started processing OCR job '{job_id}' from file '{temp_file_path}'...")
    start_time = time.time()
    try:
        # 1. Heavy EasyOCR PyTorch extraction
        ocr_res = extract_ocr_text(temp_file_path)
        raw_text = ocr_res.get("rawText", "")
        
        # 2. Document Classification
        doc_res = document_classifier.classify(raw_text)
        
        total_time_ms = int((time.time() - start_time) * 1000)
        
        final_result = {
            "ocr": ocr_res,
            "classification": doc_res,
            "totalProcessingTimeMs": total_time_ms
        }
        
        print(f"[BACKGROUND WORKER] Finished job '{job_id}' in {total_time_ms}ms ({round(total_time_ms/1000, 2)}s). Result snippet: '{raw_text[:60]}...'")
        log_ai_action("async_ocr_queue_logs", {"jobId": job_id, "result": final_result})
        ocr_job_store.update_job(job_id, "COMPLETED", result=final_result)
        return final_result
    except Exception as e:
        print(f"[BACKGROUND WORKER ERROR] Failed job '{job_id}': {e}")
        ocr_job_store.update_job(job_id, "FAILED", error=str(e))
        raise e
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
