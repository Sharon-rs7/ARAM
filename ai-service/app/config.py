import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_SERVICE_NAME: str = os.getenv("AI_SERVICE_NAME", "ARAM AI Service")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/aram_ai_logs")
    MONGO_DB_NAME: str = os.getenv("MONGODB_DATABASE", "aram_ai_logs")
    INTERNAL_API_TOKEN: str = os.getenv("INTERNAL_API_TOKEN", "aram-secret-token-2026")
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

settings = Settings()

# Ensure directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATASET_DIR, "document_dataset"), exist_ok=True)
