import os
import shutil
import tempfile
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.ocr_queue import ocr_job_store

router = APIRouter(prefix="/documents/ocr", tags=["Async OCR Job Queue"])

@router.post("/async", status_code=status.HTTP_202_ACCEPTED)
def enqueue_ocr_job(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Invalid file upload")
        
    temp_dir = tempfile.gettempdir()
    unique_name = f"async_ocr_{uuid.uuid4().hex}_{file.filename}"
    temp_file_path = os.path.join(temp_dir, unique_name)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        job_id = ocr_job_store.create_job(file.filename)
        ocr_job_store.enqueue_job(job_id, temp_file_path)
        
        return {
            "jobId": job_id,
            "status": "PROCESSING",
            "message": "OCR job enqueued successfully. Poll /documents/ocr/status/{job_id} for results."
        }
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to enqueue OCR job: {str(e)}")

@router.get("/status/{job_id}")
def get_ocr_job_status(job_id: str):
    job = ocr_job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"OCR job '{job_id}' not found")
    return job
