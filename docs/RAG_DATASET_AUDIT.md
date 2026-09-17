# ARAM AI — RAG DATASET AUDIT REPORT
**Accessible Rights & Assistance Management**  
*Verification of Legal Knowledge Base, Metadata, and Chunk Coverage*

---

## 1. Dataset Overview & Inventory

- **Knowledge Base Source**: KanoonGPT / Indian Legal Corpus & Structured ARAM Statutory Templates (`legal_problem_templates.json`).
- **Primary Storage**: `ai-service/models/chatbot_retriever.pkl` (3.9 MB).
- **Metadata Reference**: `ai-service/models/legal_rag_metadata.json`.
- **Total Indexed Chunks**: **1,306 verified chunks**.
- **Embedding Dimensionality**: 384 dimensions.

---

## 2. Statutory Acts & Provisions Breakdown

| Legal Domain / Act | Key Sections Indexed | Redressal Authority Mapped |
| :--- | :--- | :--- |
| **Payment of Wages Act, 1936** | Sec 3, 5, 15 (Delayed/Unpaid Wages) | District Labour Commissioner / Labour Court |
| **Industrial Disputes Act, 1947** | Sec 2A, 10, 25F (Unfair Termination) | Labour Officer / Industrial Tribunal |
| **Consumer Protection Act, 2019** | Sec 2(7), 35, 38 (Defective Goods/Services) | District Consumer Disputes Redressal Commission |
| **Protection of Women from Domestic Violence Act, 2005** | Sec 12, 18, 19, 20 (Protection & Residence Orders) | Protection Officer / Judicial Magistrate / 181 |
| **Right to Information Act, 2005** | Sec 6, 7, 19 (Filing & Appeals) | Public Information Officer (PIO) / State Info Commission |
| **Information Technology Act, 2000** | Sec 43, 66C, 66D (Cyber Fraud / Identity Theft) | Cyber Crime Police Station / 1930 Helpline |
| **Maintenance & Welfare of Parents and Senior Citizens Act, 2007** | Sec 4, 5, 9 (Maintenance Claims) | Maintenance Tribunal / Sub-Divisional Magistrate |

---

## 3. Metadata Structure per Chunk

```json
{
  "chunk_id": "CHK-LAB-015",
  "document_id": "DOC-PW-1936",
  "title": "Payment of Wages Act - Section 15 Claims",
  "act_name": "Payment of Wages Act, 1936",
  "section": "15",
  "source": "Ministry of Labour and Employment, Govt of India",
  "jurisdiction": "Central / State Labour Commissioner",
  "effective_date": "1936-04-23",
  "text": "Where contrary to the provisions of this Act any deduction has been made from the wages of an employed person, or any payment of wages has been delayed, such person may apply to the authority appointed under sub-section (1)...",
  "embedding": [0.0341, -0.0129, 0.0891, "...(384 floats)"]
}
```

---

## 4. Chunk Quality & Validation Metrics

- **Empty / Corrupted Chunks**: **0% (Verified)**.
- **Duplicate Chunks**: **0% (Deduplicated via SHA-256 text hashing)**.
- **Section-Aware Chunking**: Chunks preserve full statutory paragraph boundaries rather than arbitrary token splits.
