import os
import shutil
import tempfile
import subprocess
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.whisper_service import whisper_service

router = APIRouter()

def is_ffmpeg_installed() -> bool:
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        return False

def convert_to_wav_16k(input_path: str, output_path: str) -> bool:
    try:
        # Convert to 16kHz mono WAV format (standard PCM 16-bit)
        cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", output_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception as e:
        print(f"FFmpeg conversion failed from {input_path} to {output_path}: {e}")
        return False

@router.post("/speech/transcribe")
@router.post("/voice/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    selectedLanguage: Optional[str] = Form(None),
    preferredOutputLanguage: Optional[str] = Form(None)
):
    temp_dir = tempfile.gettempdir()
    unique_suffix = uuid.uuid4().hex
    temp_file_path = os.path.join(temp_dir, f"audio_upload_{unique_suffix}_{file.filename}")
    converted_file_path = None
    
    try:
        # Save temp file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        final_audio_path = temp_file_path
        
        # Check and run FFmpeg conversion dynamically
        if is_ffmpeg_installed():
            converted_file_path = os.path.join(temp_dir, f"converted_{unique_suffix}.wav")
            if convert_to_wav_16k(temp_file_path, converted_file_path):
                final_audio_path = converted_file_path
            else:
                print("FFmpeg conversion failed. Attempting direct file read fallback.")
        else:
            print("FFmpeg not found in path environment. Proceeding with raw file format.")
            
        # Transcribe audio using Whisper model
        result = whisper_service.transcribe(final_audio_path, selectedLanguage)
        
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
            "message": "Unable to transcribe audio recording. Please try speaking clearly or type manually.",
            "errorCode": "TRANSCRIPTION_FAILED"
        }
    finally:
        # Clean up temporary audio files safely
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        if converted_file_path and os.path.exists(converted_file_path):
            try:
                os.remove(converted_file_path)
            except Exception:
                pass

@router.get("/speech/status")
async def get_speech_status():
    from app.config import settings
    return {
        "modelLoaded": whisper_service.is_model_loaded(),
        "modelSize": settings.WHISPER_MODEL_SIZE,
        "device": settings.WHISPER_DEVICE,
        "ffmpegInstalled": is_ffmpeg_installed()
    }
