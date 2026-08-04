import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_SERVICE_NAME: str = os.getenv("AI_SERVICE_NAME", "ARAM AI Service")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/aram_ai_logs")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    DATASET_DIR: str = os.getenv("DATASET_DIR", "./datasets")
    WHISPER_MODE: str = os.getenv("WHISPER_MODE", "local")
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE_TYPE: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    MAX_AUDIO_SIZE_MB: int = int(os.getenv("MAX_AUDIO_SIZE_MB", "25"))
    ALLOWED_AUDIO_TYPES: str = os.getenv("ALLOWED_AUDIO_TYPES", "audio/webm,audio/wav,audio/mpeg,audio/mp4,audio/ogg")
    WHISPER_PRELOAD: bool = os.getenv("WHISPER_PRELOAD", "True").lower() in ("true", "1", "yes")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATASET_DIR, "document_dataset"), exist_ok=True)
