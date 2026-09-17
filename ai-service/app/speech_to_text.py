import os
from app.services.whisper_service import whisper_service

has_whisper = True

def transcribe_audio(file_path: str, language: str = None) -> dict:
    """
    Transcribes audio file to text using WhisperService (Deepgram primary + Faster-Whisper fallback).
    """
    if not os.path.exists(file_path):
        return {
            "text": "Audio file not found.",
            "confidence": 0.0,
            "language": "en"
        }

    try:
        result = whisper_service.transcribe(file_path, language_code=language)
        transcript = result.get("transcript", "").strip()
        
        if not transcript or transcript == "No audible speech detected.":
            return {
                "text": "",
                "confidence": 0.0,
                "language": language or "en",
                "error": "No clear speech detected in audio file. Please speak clearly or enter text manually."
            }

        return {
            "text": transcript,
            "confidence": round(result.get("confidence", 0.85), 2),
            "language": result.get("detectedLanguage", language or "en"),
            "duration": result.get("duration", 0.0),
            "engine": result.get("engine", "deepgram")
        }
    except Exception as ex:
        print(f"Speech transcription error: {ex}")
        return {
            "text": "",
            "confidence": 0.0,
            "language": language or "en",
            "error": f"Transcription error: {str(ex)}"
        }

