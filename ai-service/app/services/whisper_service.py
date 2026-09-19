import os
import re
import math
from app.config import settings
from app.services.deepgram_service import deepgram_service

class WhisperService:
    """
    Unified High-Availability STT Service:
    - Primary: Deepgram Cloud STT (Nova-3 multilingual)
    - Hot Standby: Local Faster-Whisper (pre-loaded in memory for instant millisecond failover)
    """
    def __init__(self):
        self.model = None
        # Always preload local Whisper model so standby is immediately hot
        if settings.WHISPER_PRELOAD:
            print("[STT INIT] Pre-warming local Faster-Whisper model in memory as hot standby...")
            self._get_model()

    def is_model_loaded(self) -> bool:
        if self.model is not None and self.model != "fallback":
            return True
        if settings.STT_ENGINE == "deepgram" and deepgram_service.is_available():
            return True
        return False

    def _get_model(self):
        if settings.WHISPER_MODE == "api":
            return None
            
        if self.model is None:
            print(f"[WHISPER] Loading local Faster-Whisper model '{settings.WHISPER_MODEL_SIZE}' on {settings.WHISPER_DEVICE}...")
            try:
                from faster_whisper import WhisperModel
                self.model = WhisperModel(
                    settings.WHISPER_MODEL_SIZE,
                    device=settings.WHISPER_DEVICE,
                    compute_type=settings.WHISPER_COMPUTE_TYPE
                )
                print("[WHISPER] Local Faster-Whisper model loaded and ready in memory.")
            except Exception as e:
                print(f"[WHISPER WARN] Could not import faster-whisper or load model. Fallback mode enabled. Error: {e}")
                self.model = "fallback"
        return self.model

    def _transcribe_whisper(self, audio_path: str, language_code: str = None) -> dict:
        """
        Transcribe audio using the preloaded local Faster-Whisper model.
        """
        model = self._get_model()
        
        if settings.WHISPER_MODE == "api" or model == "fallback" or model is None:
            return {
                "transcript": "No audible speech detected.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0,
                "engine": "whisper_fallback"
            }

        try:
            lang = None
            if language_code:
                clean_lang = language_code.strip().lower()
                if "ta" in clean_lang:
                    lang = "ta"
                elif "hi" in clean_lang:
                    lang = "hi"
                elif "en" in clean_lang:
                    lang = "en"

            # Language resolution (ta, hi, en, or None for native auto-detect)
            segments, info = self.model.transcribe(
                audio_path,
                language=lang,
                beam_size=3,
                vad_filter=True,
                condition_on_previous_text=False
            )
            
            text_segments = []
            segment_confidences = []
            for segment in segments:
                if segment.text and segment.text.strip():
                    text_segments.append(segment.text.strip())
                    prob = math.exp(segment.avg_logprob)
                    segment_confidences.append(prob)
                
            # Strip any hallucinated Cyrillic, Arabic, or CJK characters
            cleaned_text = re.sub(r'[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+', '', " ".join(text_segments)).strip()
            full_transcript = re.sub(r'\s+', ' ', cleaned_text).strip()
            
            if not full_transcript:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": "Unknown",
                    "duration": round(info.duration, 2) if hasattr(info, "duration") else 0.0,
                    "confidence": 0.0,
                    "engine": "whisper_local"
                }

            avg_confidence = (sum(segment_confidences) / len(segment_confidences)) if segment_confidences else info.language_probability
            
            det_base = (info.language or "en").split("-")[0].lower() if hasattr(info, "language") and info.language else "en"
            det_lang = det_base if det_base in ["ta", "hi", "en"] else "en"

            return {
                "transcript": full_transcript,
                "detectedLanguage": det_lang,
                "duration": round(info.duration, 2) if hasattr(info, "duration") else 0.0,
                "confidence": round(avg_confidence, 4),
                "engine": "whisper_local"
            }
        except Exception as e:
            print(f"[WHISPER ERROR] Transcription execution failed: {e}")
            return {
                "transcript": "Audio transcription error. Please try speaking clearly or type manually.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0,
                "engine": "whisper_local"
            }

    def transcribe(self, audio_path: str, language_code: str = None) -> dict:
        """
        Orchestrates transcription:
        1. Attempts Deepgram Cloud STT (Nova-3 Multilingual)
        2. Seamlessly falls back to pre-warmed local Faster-Whisper if Deepgram fails or detects no speech
        """
        # 1. Primary Engine: Deepgram Cloud STT
        if settings.STT_ENGINE == "deepgram" and deepgram_service.is_available():
            try:
                res = deepgram_service.transcribe(audio_path, language_code=language_code)
                transcript = (res.get("transcript") or "").strip()
                if transcript and transcript != "No audible speech detected." and not transcript.startswith("Audio transcription error"):
                    return res
                print("[STT FAILOVER] Deepgram produced empty/no speech. Activating local Faster-Whisper standby...")
            except Exception as e:
                print(f"[STT FAILOVER] Deepgram API failed ({e}). Instantly switching to local Faster-Whisper standby...")

        # 2. Standby Engine: Preloaded Local Faster-Whisper
        return self._transcribe_whisper(audio_path, language_code=language_code)

whisper_service = WhisperService()

