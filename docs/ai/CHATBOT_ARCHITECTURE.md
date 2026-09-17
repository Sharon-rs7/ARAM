# ARAM AI Conversational Legal Assistant — Complete System Architecture

**Document Version**: 2.0.0  
**Status**: Production Verified  
**Date**: September 2026  

---

## 1. Executive Summary

The **ARAM AI Legal Assistant** is a multi-tier, multi-lingual, and multi-turn conversational legal AI system engineered specifically for Indian citizens. It bridges the gap between natural human conversation (in Tamil, Tanglish, Hindi, and English) and statutory legal aid procedures (DLSA, Tahsildar, Rent Court, Consumer Forum, Labour Commissioner, Cyber Crime 1930).

Unlike rigid legal rule engines or generic chatbots, ARAM AI uses an **Intent-First Triage Router** that guarantees:
1. **Conversational First**: Greetings, language inquiries, and colloquial queries are answered naturally without triggering unwanted statutory cards.
2. **Dynamic Multi-Turn Clarification**: If a citizen's complaint is underspecified (e.g., *"i have a problem"*), it prompts for key missing facts with interactive chips.
3. **Multi-Case Decomposition**: Automatically disentangles multi-issue disputes (e.g., Unpaid Salary + Tenancy Eviction + Consumer Fraud) into separate statutory redressal tracks.
4. **Three-Tier Fallback Provider Engine**: Local LLM (Ollama/Llama3) -> Gemini 3.5 Flash Lite -> Deterministic Domain-Grounded Statutory RAG with 1,306 verified legal chunks.
5. **In-Chat Direct Complaint Creation**: Generates official complaint payloads for direct registration with the ARAM MySQL/MongoDB backend with one click.

---

## 2. End-to-End Architectural Pipeline

```
[Citizen Input: Tamil / Tanglish / English / Hindi]
                       │
                       ▼
            [/chat/ask Endpoint (FastAPI)]
                       │
                       ▼
        [Intent Engine (intent_engine.py)]
    ┌──────────────────┼──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼
[Greeting/Thanks] [Language Inq]    [Clarification]    [Multi-Case Engine]
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
[Conversational] [Tanglish Norm]     [Action Chips]    [Decomposed Cases]
                                                             │
                                                             ▼
                                               [Legal RAG & LLM Router]
                                                             │
                                                             ▼
                                               [Domain Gate + 1,306 Chunks]
                                                             │
                                                             ▼
                                            [Local LLM -> Gemini -> Fallback]
                                                             │
                                                             ▼
                                                  [ChatGPT/Gemini UI]
```

---

## 3. Modular Backend Components

| Component | File Path | Primary Function |
|---|---|---|
| **Intent Engine** | `app/intent/intent_engine.py` | Classifies input into 8 distinct intents (Greeting, Language Switch, Capabilities, Clarification, Multi-Case, Emergency, Complaint, Legal Problem) |
| **Tanglish Normalizer** | `app/nlp/tanglish_normalizer.py` | Detects and maps phonetic Tanglish colloquial terms into normalized Tamil and legal search concepts |
| **Emergency Engine** | `app/safety/emergency_engine.py` | Intercepts violence, threats, suicide, child abuse, and domestic violence; outputs emergency helplines |
| **Multi-Case Engine** | `app/cases/multi_case_engine.py` | Splits multi-grievance queries into isolated statutory cases with applicable laws and authorities |
| **Conversation Manager** | `app/conversation_manager.py` | Maintains Redis / In-Memory multi-turn state, tracks missing case facts, and renders interactive chips |
| **Legal Relevance Gate** | `rag/retrieval/legal_gate.py` | Enforces negative keyword exclusions across 30+ legal taxonomy categories to eliminate cross-domain hallucination |
| **Hybrid Retriever** | `rag/retrieval/retriever.py` | Combines SentenceTransformer vector embeddings and BM25 ranking across 1,306 statutory law chunks |
| **LLM Router** | `llm/llm_router.py` | Orchestrates Local LLM -> Gemini 3.5 Flash Lite -> Deterministic Domain RAG |
| **Frontend Assistant** | `src/pages/Chatbot.jsx` | ChatGPT/Gemini-style markdown streaming bubbles, direct complaint submission button, and quick suggestion chips |

---

## 4. Multi-Language & Dialect Normalization Matrix

| Input Dialect | Input Example | Detected Intent | Resulting Action |
|---|---|---|---|
| **English Greeting** | `"hi" / "hello aram"` | `GREETING` | Warm English greeting with domain suggestions; **no legal dump** |
| **Tanglish Inquiry** | `"thannglish la pesa mudium ha"` | `LANGUAGE_SELECTION` | Warm Tanglish switch confirmation (`"Kandippa pesa mudiyum!"`) |
| **Native Tamil** | `"வணக்கம், உதவி வேண்டும்"` | `GREETING` | Native Tamil greeting and legal aid menu |
| **Vague Tamil / Tanglish** | `"enaku oru problem iruku"` | `CLARIFICATION_NEEDED` | Interactive category chips to identify dispute type |
| **Complex Multi-Case** | `"Salary not paid + Landlord evicting + Defective phone"` | `MULTI_CASE_ASSESSMENT` | Sub-cases broken down into Payment of Wages Act, TN Tenancy Act, and Consumer Protection Act |
| **Direct Complaint** | `"submit complaint" / "புகார் பதிவு செய்"` | `SUBMIT_COMPLAINT_READY` | Directly opens one-click complaint filing modal in database |

---

## 5. Security & Verification Guarantees

1. **Zero Hallucination Grounding**: Every statutory citation must exist in the verified 1,306-chunk index or verified taxonomy map.
2. **Rate Limit & Timeout Resilience**: Gemini 3.5 Flash Lite has active rate-limit and exponential backoff retry.
3. **Internal Token Auth**: All internal microservice requests validate `X-Internal-Token: aram-secret-token-2026`.
4. **Data Isolation**: No citizen PII is exposed across cross-tenant sessions.
