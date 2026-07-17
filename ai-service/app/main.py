import sys
import types

# Inject mock modules for ML dependencies if not installed
for mod_name in ['numpy', 'joblib', 'easyocr', 'cv2', 'pandas', 'sklearn', 'sentence_transformers', 'tensorflow', 'keras', 'scipy']:
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

app = FastAPI(title="ARAM AI Service")

@app.get("/health")
def health():
    return {
        "service": "ARAM AI Service",
        "status": "ok"
    }

@app.post("/complaint/analyze")
def analyze_complaint(request: ComplaintAnalyzeRequest):
    try:
        text = request.complaintText
        
        # 1. Category Classification
        cat_res = predict_category(text)
        category = cat_res["category"]
        confidence = cat_res["confidence"]
        model_based = cat_res["modelBased"]
        
        # 2. Priority Prediction
        prio_res = predict_priority(text, category, request.isSensitive)
        priority = prio_res["priority"]
        priority_score = prio_res["priorityScore"]
        
        # 3. Authority Recommendation
        auth_res = recommend_authority(text, category, priority, request.district)
        recommended_authority = auth_res["recommendedAuthority"]
        auth_confidence = auth_res["confidence"]
        
        # 4. Document Recommendations
        doc_res = recommend_documents(text, category, priority)
        required_docs = doc_res["requiredDocuments"]
        doc_confidence = doc_res["confidence"]
        
        # 5. Next steps knowledge lookup
        chatbot_res = ask_chatbot_engine(text, request.language)
        next_steps = chatbot_res["suggestedActions"]
        
        manual_review = cat_res["manualReviewRequired"] or prio_res["manualReviewRequired"] or auth_res["manualReviewRequired"]
        
        response_data = {
            "category": category,
            "priority": priority,
            "priorityScore": priority_score,
            "confidence": round(confidence, 2),
            "recommendedAuthority": recommended_authority,
            "authorityConfidence": round(auth_confidence, 2),
            "requiredDocuments": required_docs,
            "documentConfidence": round(doc_confidence, 2),
            "nextSteps": next_steps,
            "manualReviewRequired": manual_review,
            "modelBased": model_based
        }
        
        # Log to Mongo
        log_ai_action("ai_classification_logs", response_data)
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

def uuid_filename(filename: str) -> str:
    import uuid
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4()}{ext}"
