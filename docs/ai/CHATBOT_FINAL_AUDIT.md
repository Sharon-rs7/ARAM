# Forensic Audit: ARAM AI Conversational Chatbot Pipeline

## 1. Executive Summary
A comprehensive codebase audit was conducted on `E:\OurAram\My-aram-app` to identify why the chatbot previously triggered default legal assessment cards on conversational queries (e.g. `"hi"`, `"tanglish la pesalama?"`) and generic fallbacks.

---

## 2. Root Cause Analysis of Legacy Flaws

### Flaw A: Intent Misclassification on Colloquial & Tanglish Inputs
- **File**: `ai-service/app/intent_classifier.py`
- **Root Cause**: The legacy regex only matched standard English/Tamil Unicode phrases (e.g. `tamil la pesalama`). Spoken Tanglish queries (`thannglish la pesa mudium ha`, `enaku doubt iruku`, `epdi irukinga`) missed regex rules and fell through directly to `INTENTS["LEGAL_PROBLEM"]`.

### Flaw B: Automatic Invocation of Heavy Legal Assessment Engine
- **File**: `ai-service/app/chatbot_engine.py`
- **Root Cause**: Any message marked as `LEGAL_PROBLEM` immediately passed to `detect_category_smart()` and `generate_rag_response()`, forcing an arbitrary legal assessment (often defaulting to `CONSUMER_COMPLAINT` or `GENERAL_LEGAL_AID` / `Legal Services Authorities Act`) even when the user had provided zero dispute facts.

### Flaw C: Frontend Assumption of Rigid 11-Part Grid Cards
- **File**: `src/pages/citizen/Chatbot.jsx`
- **Root Cause**: Whenever backend returned any response object, `Chatbot.jsx` conditionally rendered `AiResultCard` (an 11-part dashboard card with "Grounded Legal Assessment", "Applicable Law", "Required Document Checklist", "Competent Authority") beneath the chat bubble, converting an ongoing chat dialogue into a static form.

### Flaw D: Inability to Decompose Multi-Case Grievances
- **Files**: `ai-service/app/chatbot_engine.py`, `ai-service/rag/retrieval/retriever.py`
- **Root Cause**: Queries containing multiple distinct issues (e.g. property title fraud + cyber OTP theft + defective laptop warranty) were squashed into a single category, causing RAG to retrieve cross-domain noise.

---

## 3. Rectification Blueprint
1. **True Conversational Flow**: Messages with no legal facts (greetings, language requests, small talk) never trigger RAG or legal models.
2. **Dynamic Multi-Case Decomposer**: Separates multi-issue grievances into independent case tracks.
3. **Strict Domain & Jurisdiction Gating**: Rejects unrelated legal chunks before reaching LLM synthesis.
4. **Three-Tier LLM Architecture**: Local LLM $\rightarrow$ Gemini $\rightarrow$ Grounded Deterministic RAG.
5. **Gemini-Style Markdown Chat UI**: Replaces rigid dashboard grids with natural conversational chat bubbles and in-chat complaint filing.
