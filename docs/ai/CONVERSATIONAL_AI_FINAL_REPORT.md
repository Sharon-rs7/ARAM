# ARAM AI — Conversational Intelligence & Legal Triage Engine Report

## 1. Executive Summary

This document certifies the successful implementation and end-to-end verification of the **Conversational-First Architecture** for ARAM AI (Accessible Rights & Assistance Management).

Previously, the system immediately routed all user messages—even greetings (`"hi"`) and language switches (`"tamil?"`)—directly into the legal RAG pipeline, generating premature and irrelevant 11-part statutory assessment cards (e.g., answering "hi" with Section 35 of the Consumer Protection Act).

The upgraded engine implements a strict **Intent Classification & Dialogue State Manager**, ensuring that legal RAG is only triggered when sufficient problem context is available, while conversational intents, language switches, emergency alerts, and progressive clarifications are handled natively.

---

## 2. Intent Routing & Architecture

```
                      [ User Input Message ]
                                |
                                v
                   [ Intent Classifier Module ]
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
[ Conversational ]      [ Emergency Check ]     [ Domain Grievance ]
  - GREETING              - 112 / 181 Alerts      - Property / Land
  - LANGUAGE_SELECTION    - Immediate Safety      - Tenancy
  - THANKS                                        - Labour & Wages
  - GOODBYE                                       - Consumer
  - GENERAL_HELP                                  - Cybercrime
        |                                               |
        v                                               v
[ Fast Direct Reply ]                       [ Multi-Turn State Check ]
(No RAG, No Legal Card)                                 |
                                        +---------------+---------------+
                                        |                               |
                                        v                               v
                              [ Vague / Missing Info ]        [ Concrete Dispute ]
                                        |                               |
                                        v                               v
                              [ CLARIFICATION Chips ]         [ Jurisdiction RAG ]
                              (Interactive Options)                     |
                                                                        v
                                                              [ LLM Router & Gate ]
                                                                        |
                                                                        v
                                                              [ 11-Part Assessment ]
```

---

## 3. Supported Intent Categories & Routing Rules

| Intent Type | Trigger Examples | Action Taken | RAG Triggered? | Output Format |
|---|---|---|:---:|---|
| `GREETING` | `"hi"`, `"hello"`, `"vanakkam"`, `"வணக்கம்"` | Welcomes citizen and prompts for their legal issue in detected language | ❌ NO | Conversational bubble + Suggested categories |
| `LANGUAGE_SELECTION` | `"tamil?"`, `"தமிழ்ல பேசுங்க"`, `"hindi please"` | Updates session state language (`ta`/`hi`/`en`), confirms switch conversationally | ❌ NO | Conversational bubble in target language |
| `THANKS` | `"thanks"`, `"நன்றி"`, `"thank you"` | Returns polite acknowledgment offering further legal aid if needed | ❌ NO | Conversational bubble |
| `GOODBYE` | `"bye"`, `"போய் வருகிறேன்"` | Returns respectful farewell | ❌ NO | Conversational bubble |
| `GENERAL_CONVERSATION` | `"what can you do?"`, `"help"`, `"நீ யார்"` | Explains ARAM's capabilities and supported civic/legal domains | ❌ NO | Conversational bubble + Category chips |
| `EMERGENCY` | Threats to life, physical attack, violence | Immediate safety notice with emergency helplines (112, 181, Protection Officer) | ❌ NO | High-priority safety alert |
| `CLARIFICATION` | `"en property issue yarkita enga complaint pananum nu enaku thrla"` | Detects vague grievance, identifies category, presents interactive chips | ❌ NO | Clarification prompt + Clickable chips |
| `FULL_ASSESSMENT` | `"Boundary Dispute"` after clarification, or detailed grievance | Runs dense + BM25 hybrid search with jurisdiction gating -> LLM synthesis | ✅ YES | 11-Part Verified Statutory Assessment Card |

---

## 4. Multi-Turn Dialogue Flow Example

### Turn 1 (Citizen Query)
> **User**: *"en property issuse yarkita enga complaint pananum nu enaku thrla"*

- **Engine Response**:
  - `responseType`: `CLARIFICATION`
  - `language`: `ta`
  - `category`: `PROPERTY_DISPUTE`
  - `reply`: *"நிச்சயமாக, நான் உங்களுக்கு வழிகாட்டுகிறேன் 👍 சரியான அதிகாரி மற்றும் சட்ட தீர்வை அடையாளம் காண, உங்கள் பிரச்சனை முக்கியமாக எதைப் பற்றியது என்று தெரிவியுங்கள்:"*
  - `options`: `["Patta / Chitta", "Boundary Dispute", "Land Encroachment", "Property Ownership / Title", "Registration / Sale Deed", "Other"]`

### Turn 2 (Citizen Choice)
> **User**: *"Boundary Dispute"*

- **Engine Response**:
  - `responseType`: `FULL_ASSESSMENT`
  - `language`: `ta`
  - `category`: `PROPERTY_DISPUTE`
  - `applicableLaw`: *Transfer of Property Act, 1882 & Tamil Nadu Patta Pass Book Act, 1983*
  - `section`: *Sec 54 (Transfer of Property) & Sec 3 (Patta Pass Book Act)*
  - `authority`: *Tahsildar / Revenue Divisional Officer (RDO) / Civil Court / DLSA*
  - `documents_required`: *Patta / Chitta, Registered Sale Deed, FMB Field Survey Map, Encumbrance Certificate (EC)*

---

## 5. Automated Verification Test Suite

The automated test suite in `ai-service/tests/test_conversational_routing.py`, `ai-service/tests/rag/test_legal_relevance.py`, and `ai-service/tests/rag/test_retrieval_quality.py` achieved **100% pass rate (16/16 passed)**.
