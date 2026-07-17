import datetime
import uuid
from app.config import settings

mongo_client = None
db = None

try:
    import pymongo
    # Establish connection with a short 2-second timeout
    mongo_client = pymongo.MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
    db = mongo_client.get_database()
    # Trigger a light call to confirm server is up
    mongo_client.server_info()
except Exception as e:
    print(f"MongoDB connection failed: {e}. AI service will run in log-to-console mode.")
    db = None

def log_ai_action(collection_name: str, payload: dict):
    # Mask raw text before storing
    log_entry = {
        "requestId": str(uuid.uuid4()),
        "timestamp": datetime.datetime.now().isoformat(),
        "payload": payload,
        "modelVersion": "1.0.0"
    }

    if db is not None:
        try:
            db.get_collection(collection_name).insert_one(log_entry)
            return
        except Exception as ex:
            print(f"Failed to log to MongoDB: {ex}")
            
    # Fallback log console print in development
    print(f"[MONGO LOG FALLBACK] Collection: {collection_name} | Entry: {log_entry}")
