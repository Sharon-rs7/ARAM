import sys
import types

# Inject mock modules for ML dependencies if not installed
for mod_name in ['numpy', 'joblib', 'easyocr', 'cv2', 'pandas', 'sklearn', 'sentence_transformers', 'tensorflow', 'keras', 'scipy', 'pytesseract', 'faster_whisper']:
    try:
        __import__(mod_name)
    except ImportError:
        mock_mod = types.ModuleType(mod_name)
        if mod_name == 'numpy':
            mock_mod.zeros = lambda shape: [0] * (shape[1] if len(shape) > 1 else shape[0])
            mock_mod.argmax = lambda arr: 0
            mock_mod.array = lambda arr: arr
        elif mod_name == 'joblib':
            mock_mod.load = lambda path: None
        elif mod_name == 'easyocr':
            mock_mod.Reader = lambda *args, **kwargs: None
        elif mod_name == 'scipy':
            mock_sparse = types.ModuleType('scipy.sparse')
            mock_sparse.csr_matrix = lambda *args, **kwargs: None
            mock_sparse.hstack = lambda *args, **kwargs: None
            mock_mod.sparse = mock_sparse
            sys.modules['scipy.sparse'] = mock_sparse
        elif mod_name == 'pandas':
            class MockDataFrame:
                def __init__(self, *args, **kwargs): pass
            mock_mod.DataFrame = MockDataFrame
        elif mod_name == 'pytesseract':
            mock_mod.image_to_string = lambda *args, **kwargs: ""
            mock_mod.get_tesseract_version = lambda *args, **kwargs: "4.0.0"
        elif mod_name == 'faster_whisper':
            class MockWhisperModel:
                def __init__(self, *args, **kwargs): pass
                def transcribe(self, *args, **kwargs):
                    return [], type('Info', (object,), {'language': 'en', 'language_probability': 0.85})()
            mock_mod.WhisperModel = MockWhisperModel
        sys.modules[mod_name] = mock_mod

import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from app.schemas import ComplaintAnalyzeRequest, ChatAskRequest
from app.complaint_classifier import predict_category
from app.priority_predictor import predict_priority
from app.authority_recommender import recommend_authority
from app.document_recommender import recommend_documents
from app.chatbot_engine import ask_chatbot_engine
from app.ocr_engine import extract_ocr_text
from app.document_verifier import verify_document_service
from app.mongo_logger import log_ai_action
from app.speech_to_text import transcribe_audio

from app.routers.health import router as health_router
from app.routers.train import router as train_router
from app.routers.analyze import router as analyze_router
from app.routers.language import router as language_router
from app.routers.speech import router as speech_router

app = FastAPI(title="ARAM AI Service")

app.include_router(health_router)
app.include_router(train_router)
app.include_router(analyze_router)
app.include_router(language_router)
app.include_router(speech_router)

@app.post("/chat/ask")
def chat_ask(request: ChatAskRequest):
    try:
        res = ask_chatbot_engine(
            message=request.message,
            language=request.language,
            user_role=request.userRole,
            complaint_id=request.complaintId
        )
        
        # Log to Mongo
        log_ai_action("chatbot_logs", res)
        
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/ocr")
def documents_ocr(file: UploadFile = File(...)):
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"ocr_{uuid_filename(file.filename)}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        res = extract_ocr_text(temp_file_path)
        log_ai_action("document_ocr_logs", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/documents/verify")
def documents_verify(
    file: UploadFile = File(...),
    expectedDocumentType: str = Form(...),
    complaintCategory: str = Form(...)
):
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"verify_{uuid_filename(file.filename)}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        res = verify_document_service(temp_file_path, expectedDocumentType, complaintCategory)
        log_ai_action("document_verification_logs", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/voice/transcribe")
def voice_transcribe(file: UploadFile = File(...)):
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"transcribe_{uuid_filename(file.filename)}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        res = transcribe_audio(temp_file_path)
        log_ai_action("voice_transcription_logs", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

def uuid_filename(filename: str) -> str:
    import uuid
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4()}{ext}"
