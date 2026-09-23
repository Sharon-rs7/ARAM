import os
import sys
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_SERVICE_NAME: str = os.getenv("AI_SERVICE_NAME", "ARAM AI Service")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/aram_ai_logs")
    MONGO_DB_NAME: str = os.getenv("MONGODB_DATABASE", "aram_ai_logs")
    INTERNAL_API_TOKEN: str = os.getenv("INTERNAL_API_TOKEN", "test-internal-token-32-chars-long-secure!")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", os.getenv("ENV", "development")).lower()
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    DATASET_DIR: str = os.getenv("DATASET_DIR", "./datasets")
    WHISPER_MODE: str = os.getenv("WHISPER_MODE", "local")
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE_TYPE: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    MAX_AUDIO_SIZE_MB: int = int(os.getenv("MAX_AUDIO_SIZE_MB", "25"))
    MAX_DOC_SIZE_MB: int = int(os.getenv("MAX_DOC_SIZE_MB", "10"))
    ALLOWED_AUDIO_TYPES: str = os.getenv("ALLOWED_AUDIO_TYPES", "audio/webm,audio/wav,audio/mpeg,audio/mp4,audio/ogg")
    WHISPER_PRELOAD: bool = False
    PROCESSING_TIMEOUT: int = int(os.getenv("PROCESSING_TIMEOUT", "60"))

    # Deepgram Speech-to-Text Integration
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    STT_ENGINE: str = os.getenv("STT_ENGINE", "deepgram")  # 'deepgram' or 'whisper'
    DEEPGRAM_MODEL: str = os.getenv("DEEPGRAM_MODEL", "nova-3")

    # Dynamic AI Guide Matcher Weights
    GUIDE_MATCH_EMBED_WEIGHT: float = float(os.getenv("GUIDE_MATCH_EMBED_WEIGHT", "0.45"))
    GUIDE_MATCH_ELO_WEIGHT: float = float(os.getenv("GUIDE_MATCH_ELO_WEIGHT", "0.35"))
    GUIDE_MATCH_FEEDBACK_WEIGHT: float = float(os.getenv("GUIDE_MATCH_FEEDBACK_WEIGHT", "0.20"))
    MIN_HISTORICAL_CASES: int = int(os.getenv("MIN_HISTORICAL_CASES", "3"))

    def validate_security(self):
        is_test = "pytest" in sys.modules or os.getenv("PYTEST_CURRENT_TEST") is not None
        if not is_test and self.ENVIRONMENT == "production":
            if not self.INTERNAL_API_TOKEN or len(self.INTERNAL_API_TOKEN.strip()) < 32:
                raise ValueError("In production, INTERNAL_API_TOKEN must be set to a secure token of at least 32 characters!")

settings = Settings()
settings.validate_security()

# Ensure directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATASET_DIR, "document_dataset"), exist_ok=True)
