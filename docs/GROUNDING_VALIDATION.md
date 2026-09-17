# ARAM AI — Grounding & Anti-Hallucination Validation

## 1. Zero-Tolerance Grounding Principle

In legal-aid technology, hallucinations can cause severe real-world harm. A citizen falsely told that non-payment of wages incurs a 10-year prison sentence or an arbitrary 7-day court deadline might take disastrous procedural missteps.

ARAM implements a post-generation **Grounding Validator** (`response_validator.py`) that acts as an independent firewall before any legal guidance reaches the citizen.

---

## 2. Validation Checks

| Check | Rule | Action on Failure |
|---|---|---|
| **Statutory Act Verification** | Every cited Act name must exist in the retrieved context chunks. | Flagged as error; Act name omitted or sanitized. |
| **Section Number Verification** | Every cited Section must appear in the retrieved text. | Flagged as error; fabricated section number removed. |
| **Statutory Penalty Audit** | Imprisonment / fine claims are only allowed if explicitly present in the retrieved statutory text. | Flagged as error; replaced with *"Statutory penalty details could not be verified from the retrieved sources."* |
| **Procedural Deadline Audit** | Specific day/month deadlines must be verbatim supported by retrieved legal context. | Replaced with *"within the statutory timeline specified by the designated authority."* |
| **Authority Consistency** | Recommended office must match the verified jurisdiction and taxonomy routing. | Normalized to official DLSA / Labour / Police authority. |

---

## 3. Strict Retry Protocol

If the initial validation fails:
1. The router triggers a **Single Strict Retry** with `STRICT_RETRY_SYSTEM_PROMPT` emphasizing zero-tolerance compliance.
2. If the retried output passes with a grounding score $\ge 0.80$, it is accepted.
3. If the retried output still contains unsupported claims, the router rejects the LLM response entirely and falls back to **Deterministic Grounded RAG** with `human_review_required = True`.
