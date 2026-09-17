# ARAM AI — System Limitations & Guardrails

## 1. Statutory Scope & Jurisdictional Boundaries

1. **Information vs. Representation**: ARAM is an automated triage and statutory guidance platform. It is **not** a licensed attorney and does not form an attorney-client relationship.
2. **Jurisdiction Focus**: Primary coverage is tailored to Indian Central Statutes and Tamil Nadu State legislation/rules. Inter-state matters outside this knowledge base are flagged for DLSA review.
3. **Statutory Knowledge Cutoff**: RAG knowledge base reflects statutes indexed up to the current ingestion version. Amendments not yet ingested will trigger a general statutory citation disclaimer.

---

## 2. Emergency & Physical Safety Guardrails

1. **Immediate Violence**: Cases describing immediate domestic violence, physical assault, or active endangerment are flagged with `emergency: true` and direct the citizen to emergency response services (112, Women Helpline 181, Cyber Crime 1930) rather than standard asynchronous complaint filing.
2. **Preservation of Evidence**: The system emphasizes evidence collection (Aadhaar, salary slips, notices, receipts) but warns citizens never to compromise physical safety to obtain proof.
3. **Strict Penalty Disclaimer**: The AI explicitly refuses to guess imprisonment lengths or fine amounts when specific statutory provisions are missing from the retrieved context.
