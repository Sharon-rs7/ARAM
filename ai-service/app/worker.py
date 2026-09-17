import os
import json
import time
import requests
import threading
import traceback
from app.config import settings
from app.mongo_logger import log_ai_action
from app.services.ocr_queue import get_redis_client

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8082")
INTERNAL_TOKEN = settings.INTERNAL_API_TOKEN

def update_job_callback(job_id: str, status: str, error: str = None, result_data: str = None):
    url = f"{BACKEND_URL}/api/jobs/callback"
    headers = {
        "X-Internal-Token": INTERNAL_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "jobId": job_id,
        "status": status
    }
    if error:
        payload["error"] = error
    if result_data:
        payload["resultData"] = result_data

    try:
        res = requests.post(url, json=payload, headers=headers, timeout=5)
        print(f"[WORKER CALLBACK] Job '{job_id}' updated to status '{status}' -> Callback Response: {res.status_code}")
    except Exception as e:
        print(f"[WORKER CALLBACK ERROR] Failed to send callback for job '{job_id}': {e}")

def execute_job_task(job_data: dict, attempt: int = 1) -> str:
    task_type = job_data.get("taskType")
    file_ref = job_data.get("fileReference")
    complaint_id = job_data.get("complaintId")
    metadata = job_data.get("requestMetadata", {})

    # File validation size checks before processing
    if file_ref and os.path.exists(file_ref):
        file_size = os.path.getsize(file_ref)
        limit = settings.MAX_AUDIO_SIZE_MB if task_type == "WHISPER_TRANSCRIPTION" else settings.MAX_DOC_SIZE_MB
        if file_size > limit * 1024 * 1024:
            raise ValueError(f"File size exceeds maximum allowed size of {limit}MB")

    if file_ref and "fail_temporary" in file_ref:
        if attempt < 3:
            raise RuntimeError(f"Simulated temporary failure on attempt {attempt}")
        else:
            return json.dumps({"status": "COMPLETED", "message": "Success after retries"})

    if file_ref and "fail_permanent" in file_ref:
        raise RuntimeError("Simulated permanent failure")

    if task_type == "WHISPER_TRANSCRIPTION":
        from app.services.whisper_service import whisper_service
        lang = metadata.get("selectedLanguage")
        res = whisper_service.transcribe(file_ref, lang)
        # Log to MongoDB
        log_ai_action("whisper_transcription_logs", {
            "jobId": job_data.get("jobId"),
            "complaintId": complaint_id,
            "taskType": task_type,
            "status": "COMPLETED",
            "file": file_ref,
            "result": res
        })
        return json.dumps(res)

    elif task_type == "OCR" or task_type == "DOCUMENT_ANALYSIS":
        from app.document_verifier import verify_document_service
        expected_type = metadata.get("expectedDocumentType", "Salary Slip")
        category = metadata.get("complaintCategory", "LABOUR_DISPUTE")
        res = verify_document_service(file_ref, expected_type, category)
        # Log to MongoDB
        log_ai_action("ocr_verification_logs", {
            "jobId": job_data.get("jobId"),
            "complaintId": complaint_id,
            "taskType": task_type,
            "status": "COMPLETED",
            "file": file_ref,
            "result": res
        })
        return json.dumps(res)

    elif task_type == "EMBEDDING_GENERATION":
        from app.services.embedding_service import embedding_service
        text = metadata.get("text", "")
        emb = list(embedding_service.encode([text])[0])
        # Convert np.float32 to standard float list
        emb = [float(x) for x in emb]
        return json.dumps({"embedding": emb})

    elif task_type == "COMPLAINT_ANALYSIS":
        from app.ml.prediction_schema import ComplaintMLRequest
        from app.routers.analyze import analyze_complaint
        req = ComplaintMLRequest(
            title=metadata.get("title", ""),
            description=metadata.get("description", ""),
            languageHint=metadata.get("languageHint", "en"),
            detectedLanguage=metadata.get("detectedLanguage", ""),
            district=metadata.get("district", "Coimbatore"),
            area=metadata.get("area", ""),
            sensitive=metadata.get("isSensitive", False),
            voiceComplaintUsed=metadata.get("voiceComplaintUsed", False),
            preferredLegalGuideGender=metadata.get("preferredHelperGender", "ANY"),
            existingComplaints=metadata.get("existingComplaints", []),
            complaintId=str(complaint_id) if complaint_id else "",
            citizenId=int(metadata.get("userId")) if metadata.get("userId") else None,
            regionId=metadata.get("regionId", "")
        )
        res = analyze_complaint(req)
        if isinstance(res, dict):
            return json.dumps(res)
        elif hasattr(res, "dict"):
            return json.dumps(res.dict())
        elif hasattr(res, "model_dump"):
            return json.dumps(res.model_dump())
        else:
            return json.dumps(res)

    else:
        raise ValueError(f"Unknown task type: {task_type}")

import queue

def execute_task_with_timeout(job_data: dict, attempt: int, timeout: int) -> str:
    res_queue = queue.Queue()

    def target():
        try:
            result = execute_job_task(job_data, attempt)
            res_queue.put((True, result))
        except Exception as ex:
            res_queue.put((False, ex))

    t = threading.Thread(target=target)
    t.daemon = True
    t.start()
    t.join(timeout=timeout)

    if t.is_alive():
        raise TimeoutError(f"Task execution timed out after {timeout} seconds.")

    success, val = res_queue.get()
    if success:
        return val
    else:
        raise val

def worker_loop():
    print("[WORKER] Starting Redis job queue listener loop...")
    
    # 1. Startup Recovery: Scan processing queue and re-queue any unfinished jobs
    r_recovery = get_redis_client()
    if r_recovery:
        try:
            recovered_count = 0
            while True:
                leftover = r_recovery.rpop("aram_jobs_processing")
                if not leftover:
                    break
                r_recovery.lpush("aram_jobs_queue", leftover)
                recovered_count += 1
            if recovered_count > 0:
                print(f"[WORKER RECOVERY] Restored {recovered_count} unfinished jobs back to main queue.")
        except Exception as ex:
            print(f"[WORKER RECOVERY WARNING] Failed to recover unfinished jobs: {ex}")

    while True:
        r = get_redis_client()
        if not r:
            time.sleep(2)
            continue

        payload_bytes = None
        try:
            # 2. Reliable Queue Pop using BRPOPLPUSH
            try:
                payload_bytes = r.brpoplpush("aram_jobs_queue", "aram_jobs_processing", timeout=5)
            except Exception as timeout_ex:
                # Normal socket timeout when queue is idle
                time.sleep(1)
                continue

            if not payload_bytes:
                continue

            job_data = json.loads(payload_bytes.decode("utf-8"))
            job_id = job_data.get("jobId")

            print(f"\n[WORKER] Received job '{job_id}' of type '{job_data.get('taskType')}' atomically via BRPOPLPUSH.")
            
            # 3. Update status to PROCESSING
            update_job_callback(job_id, "PROCESSING")

            # 4. Run with retry logic & timeout
            max_retries = 3
            success = False
            result_str = None
            err_msg = None

            for attempt in range(1, max_retries + 1):
                try:
                    if attempt > 1:
                        update_job_callback(job_id, "PROCESSING")

                    result_str = execute_task_with_timeout(job_data, attempt, settings.PROCESSING_TIMEOUT)
                    success = True
                    break
                except Exception as ex:
                    err_msg = str(ex)
                    print(f"[WORKER WARNING] Attempt {attempt} failed for job '{job_id}': {ex}")
                    traceback.print_exc()
                    if attempt < max_retries:
                        update_job_callback(job_id, "RETRYING", error=err_msg)
                        time.sleep(2 * attempt)

            if success:
                update_job_callback(job_id, "COMPLETED", result_data=result_str)
                # Remove from processing list on success
                r.lrem("aram_jobs_processing", 1, payload_bytes)
            else:
                update_job_callback(job_id, "FAILED", error=f"Failed after {max_retries} attempts. Error: {err_msg}")
                # Remove from processing list and push to DLQ on failure
                r.lrem("aram_jobs_processing", 1, payload_bytes)
                r.lpush("aram_jobs_dlq", payload_bytes)
                print(f"[WORKER DLQ] Moved failed job '{job_id}' to 'aram_jobs_dlq' list.")

        except Exception as e:
            print(f"[WORKER LOOP EXCEPTION]: {e}")
            traceback.print_exc()
            # If parsing failed or callback crashed but we popped the item, clean up if possible
            if payload_bytes and r:
                try:
                    r.lrem("aram_jobs_processing", 1, payload_bytes)
                except Exception:
                    pass
            time.sleep(2)

def start_worker_thread():
    t = threading.Thread(target=worker_loop, daemon=True)
    t.start()
    print("[WORKER DAEMON] Worker background thread spawned successfully.")
