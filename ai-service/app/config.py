import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_SERVICE_NAME: str = os.getenv("AI_SERVICE_NAME", "ARAM AI Service")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/aram_ai_logs")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    DATASET_DIR: str = os.getenv("DATASET_DIR", "./datasets")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATASET_DIR, "document_dataset"), exist_ok=True)
