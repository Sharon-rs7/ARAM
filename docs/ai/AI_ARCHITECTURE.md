# ARAM AI — Core Architecture Specification
**Location**: `docs/ai/AI_ARCHITECTURE.md`

## 1. Unified ARAM AI Engine
ARAM AI operates as a unified legal-aid triage and assistance system sharing one intelligence core across:
- Conversational Chatbot Intake (`/chat/ask`)
- Grievance Classifier & Triage (`/complaint/analyze`)
- Document Verification & OCR (`/documents/verify`, `/documents/ocr`)
- Legal Assessment & Procedure Routing

## 2. Shared Intelligence Model
All subsystems share:
1. **Language & Script Normalization**: Detects Tamil, Tanglish, Hindi, Hinglish, English and normalizes to retrieval-friendly forms while replying in the citizen's native language.
2. **Taxonomy & Category Intelligence**: Standardized category hierarchy (Property, Tenancy, Labour, Consumer, Cyber, Women Safety, Financial Fraud, General Legal Aid).
3. **Jurisdiction Filter**: Enforces state-level filtering (Tamil Nadu vs Central vs Other States).
4. **Session State**: Maintains conversation context and facts in Redis cache across turns.
5. **Grounded Legal Corpus**: 1,306 certified statutory chunks with Legal Relevance Gating.
