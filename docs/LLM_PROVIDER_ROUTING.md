# ARAM AI — Multi-Provider LLM Routing & Failover Architecture

## 1. Routing Hierarchy

ARAM employs a resilient 4-tier fallback routing mechanism:

```
                  Citizen Grievance + Retrieved Context Pack
                                      │
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ Tier 1: Primary Generator            │
                   │ Self-Hosted Qwen (vLLM / REST API)   │
                   └──────────────────┬───────────────────┘
                                      │
                 Success & Grounded?  ├──────► Validated Legal Response
                                      │ No / Timeout / Validation Fail
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ Tier 2: Secondary Fallback           │
                   │ Gemini 1.5 Flash API                 │
                   └──────────────────┬───────────────────┘
                                      │
                 Success & Grounded?  ├──────► Validated Legal Response
                                      │ No / Unconfigured / API Error
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ Tier 3: Deterministic Grounded RAG   │
                   │ Direct Statutory Provenance Output   │
                   └──────────────────┬───────────────────┘
                                      │
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ Tier 4: Human Escalation             │
                   │ DLSA & Legal Guide Review Assigned   │
                   └──────────────────────────────────────┘
```

---

## 2. Fallback Trigger Conditions

The `LLMRouter` gracefully falls back to the next tier under any of the following verified conditions:
1. **Network / Socket Unreachable**: `QWEN_BASE_URL` cannot be resolved or connection is refused.
2. **Timeout**: Generation exceeds `QWEN_TIMEOUT_SECONDS` (default: 25.0s).
3. **HTTP / Inference Error**: Non-200 HTTP status code returned by inference server.
4. **Malformed JSON Output**: Response cannot be parsed into the standard ARAM JSON schema.
5. **Grounding Validation Failure**: Cited statutory provisions or penalty claims do not exist in the retrieved context, and strict retry also fails.
6. **Configured Maintenance Mode**: Environment flag `LLM_PROVIDER_PRIMARY=gemini` or `deterministic`.

---

## 3. Grounded Guarantee under All Tiers

Even in Tier 3 (Deterministic Grounded RAG) when all external and self-hosted LLMs are unavailable, the application **never crashes** and **never leaves the citizen without assistance**. It extracts exact statutory excerpts, required documents, recommended authority contacts, and procedural steps directly from the verified database.
