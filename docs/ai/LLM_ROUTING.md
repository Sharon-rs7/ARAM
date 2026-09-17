# ARAM AI — LLM Provider & Grounding Specification
**Location**: `docs/ai/LLM_ROUTING.md`

## 1. Multi-Provider Router Hierarchy
1. **Primary**: Google Gemini API (`gemini-1.5-flash` / `gemini-pro`).
2. **Secondary / Local**: Configured open-weight local provider.
3. **Deterministic Fallback**: Structured domain-grounded response generator.

## 2. Strict Grounding Principles
- RAG is the sole legal fact source.
- The LLM only explains and structures verified chunks.
- If information is not present in retrieved context, the system states: *"Verified statutory information for this specific issue was not found in the current legal corpus. Please proceed with human legal review."*
