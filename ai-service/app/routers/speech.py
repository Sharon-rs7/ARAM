import os
import shutil
import tempfile
import subprocess
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.auth import verify_internal_token
from typing import Optional
from app.services.whisper_service import whisper_service

router = APIRouter(dependencies=[Depends(verify_internal_token)])

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
        subprocess.run(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception as e:
        print(f"FFmpeg conversion failed from {input_path} to {output_path}: {e}")
        return False

import re

TANGLISH_KEYWORDS = {
    "vanakkam", "epdi", "irukinga", "irukken", "solla", "solranga", "nanba", "romba",
    "enaku", "unakku", "thappu", "neram", "pananum", "pannunga", "panna", "pannu",
    "enna", "aachu", "theriyala", "kudunga", "ippo", "eppo", "illa", "aama", "seri",
    "paravala", "kuduka", "mudiyala", "vaanga", "poonga", "enga", "namma", "nallave",
    "solunga", "pannikitu", "eduthukittu", "velai", "kaasu", "panam"
}

HINGLISH_KEYWORDS = {
    "namaste", "kya", "nahi", "karo", "karna", "kariye", "hoga", "hai", "hain", "bhai",
    "madad", "shikayat", "bolo", "boliye", "kaise", "chahiye", "mera", "meri", "mere",
    "aap", "tum", "kripya", "jaldi", "dhanyawad", "paise", "adhikari", "kanoon"
}

def detect_speech_language(transcript: str, detected_raw: str, selected_lang: Optional[str] = None) -> str:
    if not transcript or transcript == "No audible speech detected.":
        return "Unknown"
        
    if selected_lang:
        sl = selected_lang.lower()
        if "tanglish" in sl:
            return "Tanglish"
        if "hinglish" in sl:
            return "Hinglish"
        if "ta" in sl or "tamil" in sl:
            return "Tamil"
        if "hi" in sl or "hindi" in sl:
            return "Hindi"
        if "en" in sl or "english" in sl:
            return "English"

    has_tamil = bool(re.search(r'[\u0B80-\u0BFF]', transcript))
    has_hindi = bool(re.search(r'[\u0900-\u097F]', transcript))
    has_latin = bool(re.search(r'[a-zA-Z]', transcript))
    
    if has_tamil and has_latin:
        return "Tanglish"
        
    if has_hindi and has_latin:
        return "Hinglish"
        
    if has_tamil:
        return "Tamil"
        
    if has_hindi:
        return "Hindi"

    words = set(re.findall(r'\b[a-z]{3,}\b', transcript.lower()))
    if words.intersection(TANGLISH_KEYWORDS):
        return "Tanglish"
    if words.intersection(HINGLISH_KEYWORDS):
        return "Hinglish"

    det = (detected_raw or "").lower()
    if det in ["ta", "tam", "tamil"]:
        return "Tamil"
    if det in ["hi", "hin", "hindi"]:
        return "Hindi"
    if det in ["en", "eng", "english"]:
        return "English"

    # Strictly disallow unknown foreign language codes (e.g. 'id', 'ru', 'uk', 'ms')
    return "English"

@router.post("/speech/transcribe")
@router.post("/voice/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    selectedLanguage: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
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

        # Resolve selected language from both potential parameter keys
        lang_to_use = selectedLanguage if selectedLanguage else language
        if lang_to_use and lang_to_use.lower() in ["auto", "auto-detect", "detect", "none", "all"]:
            lang_to_use = None
        # Transcribe audio using Deepgram primary with Whisper hot standby
        result = whisper_service.transcribe(final_audio_path, lang_to_use)
        
        raw_text = result.get("transcript", "").strip()
        # Clean any foreign script characters
        raw_text = re.sub(r'[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+', '', raw_text).strip()
        raw_transcript = re.sub(r'\s+', ' ', raw_text).strip()
        is_empty_speech = not raw_transcript or raw_transcript == "No audible speech detected."
        
        raw_detected = result.get("detectedLanguage", "English")
        detected_language = detect_speech_language(raw_transcript, raw_detected, selectedLanguage or language)
        
        if is_empty_speech:
            transcript = "No audible speech detected."
            normalized = "No audible speech detected."
            confidence = 0.0
            detected_language = "Unknown"
        else:
            transcript = raw_transcript
            normalized = raw_transcript
            confidence = result.get("confidence", 0.0)

        lang_code = "ta" if detected_language in ["Tamil", "Tanglish"] else ("hi" if detected_language in ["Hindi", "Hinglish"] else "en")

        return {
            "success": True,
            "transcript": transcript,
            "text": transcript,
            "detectedLanguage": detected_language,
            "languageCode": lang_code,
            "selectedLanguage": lang_to_use if lang_to_use else "Auto",
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
    from app.services.deepgram_service import deepgram_service
    return {
        "engine": settings.STT_ENGINE,
        "deepgramAvailable": deepgram_service.is_available(),
        "deepgramModel": settings.DEEPGRAM_MODEL,
        "modelLoaded": whisper_service.is_model_loaded(),
        "modelSize": settings.WHISPER_MODEL_SIZE,
        "device": settings.WHISPER_DEVICE,
        "ffmpegInstalled": is_ffmpeg_installed()
    }

