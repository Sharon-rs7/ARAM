import os
import re
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
from app.config import settings

class DeepgramSTTService:
    """
    Cloud-native Deepgram Speech-to-Text service with Nova-2 multilingual support.
    Supports auto-language detection, high accuracy for Tamil, Hindi, Tanglish, and English,
    smart formatting, and confidence scoring.
    """

    LANGUAGE_MAP = {
        "ta": "ta",
        "tamil": "ta",
        "hi": "hi",
        "hindi": "hi",
        "en": "en",
        "english": "en",
        "te": "te",
        "telugu": "te",
        "kn": "kn",
        "kannada": "kn",
        "ml": "ml",
        "malayalam": "ml",
        "mr": "mr",
        "marathi": "mr",
        "bn": "bn",
        "bengali": "bn",
        "gu": "gu",
        "gujarati": "gu",
    }

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.DEEPGRAM_API_KEY
        self.base_url = "https://api.deepgram.com/v1/listen"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def _get_content_type(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        mapping = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".webm": "audio/webm",
            ".ogg": "audio/ogg",
            ".oga": "audio/ogg",
            ".m4a": "audio/m4a",
            ".mp4": "audio/mp4",
            ".flac": "audio/flac"
        }
        return mapping.get(ext, "application/octet-stream")

    def transcribe(self, audio_path: str, language_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Transcribes audio file to text using Deepgram Nova-2 API.
        """
        if not os.path.exists(audio_path):
            return {
                "transcript": "Audio file not found.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0,
                "engine": "deepgram"
            }

        if not self.is_available():
            raise ValueError("Deepgram API key is missing or not configured.")

        params = {
            "model": settings.DEEPGRAM_MODEL or "nova-3",
            "smart_format": "true",
            "punctuate": "true",
            "numerals": "true",
        }

        lang_resolved = None
        if language_code:
            clean_lang = language_code.strip().lower()
            if clean_lang in self.LANGUAGE_MAP:
                lang_resolved = self.LANGUAGE_MAP[clean_lang]
            elif "ta" in clean_lang:
                lang_resolved = "ta"
            elif "hi" in clean_lang:
                lang_resolved = "hi"
            elif "en" in clean_lang:
                lang_resolved = "en"

        if lang_resolved:
            params["language"] = lang_resolved
        else:
            params["detect_language"] = "true"

        query_string = urllib.parse.urlencode(params)
        target_url = f"{self.base_url}?{query_string}"

        content_type = self._get_content_type(audio_path)

        with open(audio_path, "rb") as f:
            audio_bytes = f.read()

        if len(audio_bytes) == 0:
            return {
                "transcript": "No audible speech detected.",
                "detectedLanguage": "Unknown",
                "duration": 0.0,
                "confidence": 0.0,
                "engine": "deepgram"
            }

        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": content_type,
            "User-Agent": "ARAM-LegalAid-AI/2.0"
        }

        req = urllib.request.Request(target_url, data=audio_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))

            results = resp_data.get("results", {})
            channels = results.get("channels", [])
            metadata = resp_data.get("metadata", {})

            if not channels:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": "Unknown",
                    "duration": float(metadata.get("duration", 0.0)),
                    "confidence": 0.0,
                    "engine": "deepgram"
                }

            ch = channels[0]
            detected_lang = ch.get("detected_language") or (params.get("language") if "language" in params else "Unknown")
            alternatives = ch.get("alternatives", [])

            if not alternatives:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": detected_lang,
                    "duration": float(metadata.get("duration", 0.0)),
                    "confidence": 0.0,
                    "engine": "deepgram"
                }

            primary = alternatives[0]
            transcript = (primary.get("transcript") or "").strip()
            confidence = float(primary.get("confidence") or 0.0)

            if not transcript:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": detected_lang,
                    "duration": float(metadata.get("duration", 0.0)),
                    "confidence": 0.0,
                    "engine": "deepgram"
                }

            # Extract base language code (e.g. 'ta-IN' -> 'ta', 'en-US' -> 'en')
            base_lang = (detected_lang or "").split("-")[0].lower()
            has_cyrillic = bool(re.search(r'[\u0400-\u04FF]', transcript))
            is_foreign = (base_lang not in ["ta", "hi", "en"]) or has_cyrillic

            if is_foreign and "detect_language" in params:
                # First try Tamil if not English, otherwise English
                fallback_lang = "ta" if base_lang in ["id", "ms"] else "en"
                retry_params = {
                    "model": settings.DEEPGRAM_MODEL or "nova-3",
                    "smart_format": "true",
                    "punctuate": "true",
                    "numerals": "true",
                    "language": fallback_lang
                }
                retry_query = urllib.parse.urlencode(retry_params)
                retry_url = f"{self.base_url}?{retry_query}"
                retry_req = urllib.request.Request(retry_url, data=audio_bytes, headers=headers, method="POST")
                try:
                    with urllib.request.urlopen(retry_req, timeout=10) as r_resp:
                        r_data = json.loads(r_resp.read().decode("utf-8"))
                    r_ch = r_data.get("results", {}).get("channels", [{}])[0]
                    r_alts = r_ch.get("alternatives", [])
                    if r_alts and (r_alts[0].get("transcript") or "").strip():
                        transcript = r_alts[0].get("transcript").strip()
                        confidence = float(r_alts[0].get("confidence") or confidence)
                        detected_lang = fallback_lang
                except Exception as retry_e:
                    print(f"[DEEPGRAM RETRY] Fallback to '{fallback_lang}' transcription error: {retry_e}")

            # Strip any remaining hallucinated Cyrillic, Arabic or CJK characters
            transcript = re.sub(r'[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+', '', transcript).strip()
            if not transcript:
                return {
                    "transcript": "No audible speech detected.",
                    "detectedLanguage": "Unknown",
                    "duration": float(metadata.get("duration", 0.0)),
                    "confidence": 0.0,
                    "engine": "deepgram"
                }

            base_detected = (detected_lang or "").split("-")[0].lower()
            if base_detected not in ["ta", "hi", "en"]:
                detected_lang = "en"
            else:
                detected_lang = base_detected

            return {
                "transcript": transcript,
                "detectedLanguage": detected_lang,
                "duration": round(float(metadata.get("duration", 0.0)), 2),
                "confidence": round(confidence, 4),
                "engine": "deepgram"
            }

        except Exception as e:
            print(f"[DEEPGRAM API ERROR] {e}")
            raise e

deepgram_service = DeepgramSTTService()
