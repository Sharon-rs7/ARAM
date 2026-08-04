import os
from app.config import settings

class WhisperService:
    def __init__(self):
        self.model = None
        if settings.WHISPER_PRELOAD:
            print("Whisper preloading enabled. Preloading model...")
            self._get_model()

    def is_model_loaded(self) -> bool:
        if settings.WHISPER_MODE == "api":
            return True
        return self.model is not None and self.model != "fallback"

    def _get_model(self):
        if settings.WHISPER_MODE == "api":
            return None
            
        if self.model is None:
            print(f"Loading local Whisper model '{settings.WHISPER_MODEL_SIZE}' on {settings.WHISPER_DEVICE}...")
            try:
                from faster_whisper import WhisperModel
                self.model = WhisperModel(
                    settings.WHISPER_MODEL_SIZE,
                    device=settings.WHISPER_DEVICE,
                    compute_type=settings.WHISPER_COMPUTE_TYPE
                )
                print("Local Whisper model loaded successfully.")
            except Exception as e:
                print(f"Warning: could not import faster-whisper or load model. Fallback mode enabled. Error: {e}")
                self.model = "fallback"
        return self.model

    def transcribe(self, audio_path: str, language_code: str = None) -> dict:
        model = self._get_model()
        
        if settings.WHISPER_MODE == "api" or model == "fallback" or model is None:
            return {
                "transcript": "No audible speech detected.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0
            }

        try:
            # Run faster-whisper model
            # language_code map
            lang = None
            if language_code:
                clean_lang = language_code.lower()
                if "ta" in clean_lang:
                    lang = "ta"
                elif "hi" in clean_lang:
                    lang = "hi"
                elif "en" in clean_lang:
                    lang = "en"
            
            segments, info = self.model.transcribe(audio_path, language=lang, beam_size=5)
            
            # Combine segments and compute token-level confidence
            import math
            text_segments = []
            segment_confidences = []
            for segment in segments:
                if segment.text and segment.text.strip():
                    text_segments.append(segment.text.strip())
                    # Convert avg_logprob to probability (0.0 to 1.0)
                    prob = math.exp(segment.avg_logprob)
                    segment_confidences.append(prob)
                
            full_transcript = " ".join(text_segments).strip()
            
            if not full_transcript:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": "Unknown",
                    "duration": round(info.duration, 2),
                    "confidence": 0.0
                }

            avg_confidence = (sum(segment_confidences) / len(segment_confidences)) if segment_confidences else info.language_probability
            
            return {
                "transcript": full_transcript,
                "detectedLanguage": info.language,
                "duration": round(info.duration, 2),
                "confidence": round(avg_confidence, 4)
            }
        except Exception as e:
            print(f"Whisper transcription execution failed: {e}")
            return {
                "transcript": "Audio transcription error. Please try speaking clearly or type manually.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0
            }

whisper_service = WhisperService()
