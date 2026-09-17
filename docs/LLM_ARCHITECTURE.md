# ARAM AI — Hybrid LLM Architecture & Provider Abstraction

## 1. System Overview

ARAM (Accessible Rights & Assistance Management) operates an institutional **Hybrid Multi-Provider Legal AI System**. 

The fundamental architectural principle of ARAM is:
> **LEGAL KNOWLEDGE = RAG (Source of Truth)**  
> **REASONING & TRANSLATION = Self-Hosted Qwen LLM**  
> **RESILIENT SECONDARY GENERATOR = Gemini 1.5 Flash API**  
> **ANTI-HALLUCINATION AUDIT = ARAM Grounding Validator**  
> **SAFETY FLOOR = Deterministic Grounded Extraction**  
> **SAFETY ESCALATION = Human Legal Guide & DLSA**

No LLM is ever allowed to invent statutory provisions, acts, sections, penalties, fines, deadlines, or court outcomes.

---

## 2. Component Structure

```
ai-service/
├── llm/
│   ├── base_provider.py       # Base abstract class with standard contract
│   ├── qwen_provider.py       # Self-hosted Qwen inference client (vLLM/OpenAI-compatible)
│   ├── gemini_provider.py     # Resilient secondary Gemini generator
│   ├── response_validator.py  # Zero-hallucination grounding audit
│   ├── llm_router.py          # Dynamic routing & fallback orchestrator
│   └── prompts.py             # Strict system instructions & multilingual schemas
```

---

## 3. Primary Model: `Qwen/Qwen3-30B-A3B-Instruct`

- **Role**: Primary local inference engine for legal reasoning, citizen understanding, and multilingual explanation.
- **Inference Protocol**: OpenAI-compatible REST endpoint via **vLLM** or local inference container.
- **Persistent Connection**: Loaded once at startup or hosted on dedicated container, preventing per-request model loading overhead.
- **Configurability**: Model name and base URL are fully configurable via environment variables:
  ```env
  LLM_PROVIDER_PRIMARY=qwen
  QWEN_BASE_URL=http://localhost:8005/v1
  QWEN_MODEL=Qwen/Qwen3-30B-A3B-Instruct
  QWEN_TIMEOUT_SECONDS=25.0
  ```
- **VRAM / Hardware Adaptation**: For hardware environments with limited GPU memory, `QWEN_MODEL` can be toggled to `Qwen/Qwen2.5-7B-Instruct` or `Qwen/Qwen2.5-14B-Instruct-AWQ` with zero code modifications.

---

## 4. Secondary Fallback: `Gemini 1.5 Flash API`

- **Role**: High-availability cloud secondary provider.
- **Trigger Conditions**:
  - Qwen server offline or unhealthy.
  - Qwen inference timeout (> 25s).
  - Qwen connection error or malformed JSON.
  - Initial Qwen response fails Grounding Validation after retry.
  - Configured maintenance mode.
- **Strict RAG Coupling**: Gemini **never** answers citizen queries directly. It only receives retrieved statutory chunks and must operate under strict system instructions.
