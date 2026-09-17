# ARAM — RAG Knowledge Base & Retrieval Pipeline

**Dataset Source**: `indian_legal_documents.parquet` (995MB Indian legal statutes, BNS, TNSLSA guidelines)  
**Embedding Engine**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional dense vectors)  
**Similarity Metric**: Cosine Similarity ($\ge 0.55$ relevance threshold)  

---

## 1. Knowledge Base Categories

1. **Constitutional & Legal Services Rights**: *Legal Services Authorities Act (1987)*, NALSA Free Legal Aid eligibility criteria.
2. **Property & Revenue Regulations**: Tamil Nadu Patta Passbook Act, Land Encroachment Act, Revenue Standing Orders.
3. **Labour & Employment Protections**: Payment of Wages Act, Industrial Disputes Act, Minimum Wages Act.
4. **Women & Family Safety**: Protection of Women from Domestic Violence Act, Dowry Prohibition Act.
5. **Consumer Protection**: Consumer Protection Act (2019), E-commerce dispute resolution rules.
6. **Cyber Crime & Digital Grievances**: Information Technology Act (2000), Cyber Crime Helpline 1930 procedures.

---

## 2. RAG Retrieval & Grounding Workflow

```
Complainant Speech / Text
    │
    ├── 1. Language Detection & Normalization (Tamil / Hindi / English)
    │
    ├── 2. Dense Vector Embedding Generation (384-dim MiniLM)
    │
    ├── 3. Cosine Similarity Match against Statutory Index
    │         └── Filter Top-K Chunks with Score >= 0.55
    │
    ├── 4. Legal Context Assembly & Hallucination Guardrails
    │         └── Enforce Strict Grounding in Retrieved Law Text
    │
    └── 5. Structured Actionable Output Generation
              ├── Problem Understanding
              ├── Statutory Section Citation
              ├── Required Document Checklist
              └── Next Steps Timeline (Localized in Complainant Language)
```

---

## 3. Hallucination Control & Safe Fallbacks

- **Zero-Hallucination Policy**: If cosine similarity for a query is $<0.55$, the engine returns a safe fallback message:
  *"No verified statutory provision directly matched. Your complaint will be routed to a qualified Legal Guide for human review."*
- **Disclaimer Enforcement**: Every generated answer automatically includes the mandatory legal aid triage disclaimer.
