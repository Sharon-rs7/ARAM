# ARAM AI — Conversational Triage Flow
**Location**: `docs/ai/CONVERSATIONAL_FLOW.md`

## 1. Multi-Turn Progressive Triage Flow
```
User Message
    │
    ▼
Conversation Manager (Session State)
    │
    ├── Greeting / Smalltalk ──► Returns GREETING (No RAG dump)
    │
    ├── Vague / Incomplete Query ──► Returns CLARIFICATION + Interactive Option Chips
    │
    ├── Emergency Alert ──► Returns EMERGENCY + 112/181 Safety Routing
    │
    └── Sufficient Detail ──► Jurisdiction-Aware RAG ──► Legal Relevance Gate ──► LLM Explanation ──► FULL_ASSESSMENT
```

## 2. Interactive Clarification Chips
When a citizen states a broad issue (e.g., *"en property issue yarkita complaint pananum"*), the system responds with conversational guidance and interactive chips (`[Patta / Chitta]`, `[Boundary Dispute]`, `[Land Encroachment]`, `[Property Ownership]`).
