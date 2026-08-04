import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.whisper_service import whisper_service

router = APIRouter()

@router.post("/speech/transcribe")
@router.post("/voice/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    selectedLanguage: Optional[str] = Form(None),
    preferredOutputLanguage: Optional[str] = Form(None)
):
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"audio_upload_{file.filename}")
    
    try:
        # Save temp file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Transcribe audio
        result = whisper_service.transcribe(temp_file_path, selectedLanguage)
        
        detected_language = result.get("detectedLanguage", "English")
        if detected_language == "ta":
            detected_language = "Tamil"
        elif detected_language == "hi":
            detected_language = "Hindi"
        elif detected_language == "en":
            detected_language = "English"

        # Mixed Tamil-English fallback
        if selectedLanguage == "Tanglish":
            detected_language = "Tanglish"

        raw_transcript = result.get("transcript", "").strip()
        is_empty_speech = not raw_transcript or raw_transcript == "No audible speech detected."
        
        if is_empty_speech:
            transcript = "No audible speech detected."
            normalized = "No audible speech detected."
            confidence = 0.0
        else:
            transcript = raw_transcript
            normalized = raw_transcript
            confidence = result.get("confidence", 0.0)

        return {
            "success": True,
            "transcript": transcript,
            "detectedLanguage": detected_language if not is_empty_speech else "Unknown",
            "selectedLanguage": selectedLanguage if selectedLanguage else "Auto",
            "durationSeconds": result.get("duration", 0.0),
            "confidence": confidence,
            "normalizedText": normalized,
            "message": "Speech transcribed successfully"
        }
    except Exception as e:
        print(f"FastAPI transcription endpoint failed: {e}")
        return {
            "success": False,
            "message": "Unable to transcribe audio",
            "errorCode": "TRANSCRIPTION_FAILED"
        }
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

@router.get("/speech/status")
async def get_speech_status():
    from app.config import settings
    return {
        "modelLoaded": whisper_service.is_model_loaded(),
        "modelSize": settings.WHISPER_MODEL_SIZE,
        "device": settings.WHISPER_DEVICE
    }
