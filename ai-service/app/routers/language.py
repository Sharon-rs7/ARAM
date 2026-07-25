import shutil
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.language_detector import language_detector
from app.speech_to_text import transcribe_audio

router = APIRouter()

class LanguageDetectRequest(BaseModel):
    text: str

class TranslationRequest(BaseModel):
    text: str
    sourceLanguage: Optional[str] = "Tamil"
    targetLanguage: Optional[str] = "English"

class NormalizeRequest(BaseModel):
    text: str

# Translation dictionary maps key multilingual terms from our dataset templates
TRANSLATION_MAP = {
    # Tamil to English
    "சம்பளம்": "salary",
    "பணம்": "money",
    "வேலை": "job / work",
    "நிலம்": "land",
    "சாதி": "caste",
    "லஞ்சம்": "bribe",
    "மனைவி": "wife",
    "கணவர்": "husband",
    "விவாகரத்து": "divorce",
    "பிரச்சனை": "problem",
    "காவல்": "police",
    "அடி": "assault / beating",
    "ஏமாற்று": "scam / fraud",
    # Tanglish to English
    "ennoda": "my",
    "sambalam": "salary",
    "panam": "money",
    "velai": "job",
    "veetu": "house",
    "tarala": "not paying / not giving",
    "latcham": "bribe"
}

@router.post("/speech/transcribe")
@router.post("/voice/transcribe")
def transcribe_speech_endpoint(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"audio_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        transcription_result = transcribe_audio(temp_file_path)
        transcript = transcription_result.get("text", "")
        confidence = transcription_result.get("confidence", 0.85)
        
        # Detect language of transcript
        detected = language_detector.detect_language(transcript)
        
        return {
            "transcript": transcript,
            "detectedLanguage": detected,
            "confidence": round(confidence, 2),
            "normalizedText": transcript.strip(),
            "translatedText": transcript.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/language/detect")
def detect_language_endpoint(request: LanguageDetectRequest):
    try:
        lang = language_detector.detect_language(request.text)
        return {"language": lang}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/language/translate")
def translate_endpoint(request: TranslationRequest):
    try:
        original = request.text
        translated = original
        
        # Perform dictionary-based translation mapping
        words = original.split()
        translated_words = []
        for word in words:
            clean_word = word.strip(",.?!()").lower()
            mapped = TRANSLATION_MAP.get(clean_word, clean_word)
            translated_words.append(mapped)
            
        translated = " ".join(translated_words)
        
        return {
            "sourceLanguage": request.sourceLanguage,
            "targetLanguage": request.targetLanguage,
            "originalText": original,
            "translatedText": translated,
            "normalizedText": original.strip().lower()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/language/normalize")
def normalize_endpoint(request: NormalizeRequest):
    try:
        text = request.text.strip().replace("  ", " ")
        return {
            "originalText": request.text,
            "normalizedText": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
