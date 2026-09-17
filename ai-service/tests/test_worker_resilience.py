import pytest
import json
import time
import os
import threading
from unittest.mock import patch, MagicMock
from app.config import settings
from app.worker import (
    execute_job_task,
    execute_task_with_timeout,
    worker_loop,
)

# Mock config overrides for testing
@pytest.fixture(autouse=True)
def test_settings_override():
    original_timeout = settings.PROCESSING_TIMEOUT
    settings.PROCESSING_TIMEOUT = 2  # Set low timeout for testing
    yield
    settings.PROCESSING_TIMEOUT = original_timeout

# A. Normal complaint -> COMPLETED
@patch("app.worker.update_job_callback")
def test_normal_complaint_processing(mock_callback):
    job_data = {
        "jobId": "test-job-normal",
        "taskType": "COMPLAINT_ANALYSIS",
        "complaintId": "123",
        "requestMetadata": {
            "title": "Road pothole issue",
            "description": "Collectorate road is damaged and filled with potholes."
        }
    }
    
    with patch("app.routers.analyze.analyze_complaint") as mock_analyze:
        mock_analyze.return_value = {"status": "COMPLETED", "category": "CIVIL_DISPUTE"}
        
        res = execute_job_task(job_data)
        res_dict = json.loads(res)
        assert res_dict["status"] == "COMPLETED"

# B. Corrupted PDF -> FAILED & C. Oversized file -> rejected safely
def test_oversized_file_rejected_safely(tmp_path):
    # Create a dummy file that exceeds 10MB limit (e.g. 11MB)
    huge_file = tmp_path / "huge.pdf"
    with open(huge_file, "wb") as f:
        f.write(b"0" * (11 * 1024 * 1024))
        
    job_data = {
        "jobId": "test-job-huge",
        "taskType": "OCR",
        "fileReference": str(huge_file),
        "requestMetadata": {"expectedDocumentType": "Salary Slip"}
    }
    
    # We expect ValueError because of size validation limits
    with pytest.raises(ValueError) as ex:
        # Check size validation through thread wrapper
        execute_task_with_timeout(job_data, 1, settings.PROCESSING_TIMEOUT)
    assert "exceeds maximum allowed size" in str(ex.value)

# D. OCR timeout -> task fails / TimeoutError raised
def test_ocr_timeout_triggers_failure():
    job_data = {
        "jobId": "test-job-hang",
        "taskType": "OCR",
        "requestMetadata": {"expectedDocumentType": "Salary Slip"}
    }

    # Simulate a hanging task execution
    def hang_task(job, attempt):
        time.sleep(5)  # longer than 2s timeout
        return "SUCCESS"

    with patch("app.worker.execute_job_task", side_effect=hang_task):
        with pytest.raises(TimeoutError) as ex:
            execute_task_with_timeout(job_data, 1, settings.PROCESSING_TIMEOUT)
        assert "timed out after" in str(ex.value)

# E. AI exception -> fails gracefully
def test_ai_exception_isolated():
    job_data = {
        "jobId": "test-job-fail",
        "taskType": "COMPLAINT_ANALYSIS",
        "requestMetadata": {}
    }
    
    def raise_err(job, attempt):
        raise ZeroDivisionError("AI Math error")
        
    with patch("app.worker.execute_job_task", side_effect=raise_err):
        with pytest.raises(ZeroDivisionError) as ex:
            execute_task_with_timeout(job_data, 1, settings.PROCESSING_TIMEOUT)
        assert "AI Math error" in str(ex.value)

# F. Worker restart -> unfinished job recovered on startup
@patch("app.worker.update_job_callback")
@patch("app.worker.get_redis_client")
def test_startup_recovery_mechanism(mock_redis_client, mock_callback):
    mock_redis = MagicMock()
    # Mock RPOP to return an unfinished job first, then None
    mock_redis.rpop.side_effect = [b'{"jobId": "unf-123"}', None]
    
    # Return mock_redis on recovery call, then throw KeyboardInterrupt on loop's first call
    mock_redis_client.side_effect = [mock_redis, KeyboardInterrupt("Break loop")]
    
    # Run the startup recovery section by mock-patching the main loop to break immediately
    with pytest.raises(KeyboardInterrupt):
        worker_loop()
            
    # Verify that lpush was called to return the unfinished job to the main queue
    mock_redis.lpush.assert_called_with("aram_jobs_queue", b'{"jobId": "unf-123"}')

# G. Retry limit -> job eventually reaches FAILED/DLQ
@patch("app.worker.update_job_callback")
@patch("app.worker.get_redis_client")
def test_retry_limit_reaches_dlq(mock_redis_client, mock_callback):
    mock_redis = MagicMock()
    # Return one job, then block/timeout
    mock_redis.brpoplpush.return_value = b'{"jobId": "fail-123", "taskType": "OCR"}'
    mock_redis.rpop.return_value = None  # Prevent infinite recovery loop!
    
    # Return mock_redis on first two calls, then raise KeyboardInterrupt
    mock_redis_client.side_effect = [mock_redis, mock_redis, KeyboardInterrupt("Break loop")]
    
    # Force task execution to throw exception constantly
    def raise_const(job, attempt):
        raise RuntimeError("Failure")
        
    with patch("app.worker.execute_job_task", side_effect=raise_const), \
         patch("time.sleep") as mock_sleep:  # Mock sleep to run quickly
        
        with pytest.raises(KeyboardInterrupt):
            worker_loop()
            
        # Verify it removed from processing list and pushed to DLQ
        mock_redis.lrem.assert_called_with("aram_jobs_processing", 1, b'{"jobId": "fail-123", "taskType": "OCR"}')
        mock_redis.lpush.assert_called_with("aram_jobs_dlq", b'{"jobId": "fail-123", "taskType": "OCR"}')
