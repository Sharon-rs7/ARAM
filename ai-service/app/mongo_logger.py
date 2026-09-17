import datetime
import uuid
import pymongo
from app.config import settings

class MongoManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.init_db()

    def init_db(self):
        try:
            self.client = pymongo.MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
            if settings.MONGO_DB_NAME:
                self.db = self.client[settings.MONGO_DB_NAME]
            else:
                self.db = self.client.get_database()
            self.client.server_info()
            print(f"[MONGO CONNECTED] Connected to MongoDB database '{self.db.name}' successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}. AI service will run in log-to-console mode.")
            self.db = None

    def get_db(self):
        if self.db is None:
            self.init_db()
        return self.db

    def close(self):
        if self.client:
            self.client.close()
            print("[MONGO CLOSED] MongoDB connection closed cleanly.")
            self.client = None
            self.db = None

mongo_manager = MongoManager()

def log_ai_action(collection_name: str, payload: dict):
    log_entry = {
        "requestId": str(uuid.uuid4()),
        "timestamp": datetime.datetime.now().isoformat(),
        "payload": payload,
        "modelVersion": "1.0.0"
    }

    db = mongo_manager.get_db()
    if db is not None:
        try:
            db.get_collection(collection_name).insert_one(log_entry)
            return
        except Exception as ex:
            print(f"Failed to log to MongoDB: {ex}")
            
    print(f"[MONGO LOG FALLBACK] Collection: {collection_name} | Entry: {log_entry}")
