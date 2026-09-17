# ARAM AI — Hybrid Legal RAG Final Architecture

## 1. Executive Summary

ARAM's Retrieval-Augmented Generation (RAG) subsystem is the single statutory source of truth for all civic and legal aid queries. The pipeline employs **Hybrid Retrieval** combining semantic dense vectors and exact lexical BM25 token matching with Reciprocal Rank Fusion (RRF), statutory authority weighting, and multi-signal confidence scoring.

---

## 2. Hybrid Retrieval Pipeline

```
Citizen Query (English / தமிழ் / हिंदी / Tanglish)
   │
   ▼
1. Language Detection & Normalization (LanguageDetector)
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
2A. Dense Vector Retrieval     2B. BM25 Keyword Search        2C. Metadata & Jurisdiction Filter
(MiniLM Multilingual, 384-dim) (BM25Okapi on 1,306 chunks)   (Gazette, India Code, DLSA)
   │                              │                              │
   └──────────────────────────────┴──────────────────────────────┘
                                  │
                                  ▼
3. Reciprocal Rank Fusion (RRF with k=60):
   RRF_score(d) = (1.0 / (60 + rank_dense)) + (0.8 / (60 + rank_bm25))
                                  │
                                  ▼
4. Statutory Authority Priority Weighting:
   - Official Gazette / Parliament Legislation: +10%
   - India Code Legislation: +8%
   - NALSA / DLSA / TLSC Statutory Guidance: +6%
   - High Court / Supreme Court / Government Orders: +4%
                                  │
                                  ▼
5. Reranker & Context Pack Assembler (Top 5-8 verified chunks)
                                  │
                                  ▼
6. Verified Legal Context Pack -> LLM Router
```

---

## 3. Statutory Knowledge Base Provenance

The index contains **1,306 verified legal chunks** mapped across major Indian and Tamil Nadu civic legal domains:
- **Labour & Wages**: Payment of Wages Act 1936, Minimum Wages Act 1948, Industrial Disputes Act 1947.
- **Consumer Protection**: Consumer Protection Act 2019, Consumer Dispute Redressal Rules.
- **Women Safety & Family**: Protection of Women from Domestic Violence Act (PWDVA 2005), Section 498A IPC/BNS, Hindu Marriage Act 1955, Family Courts Act 1984.
- **Cybercrime & Fraud**: Information Technology Act 2000 (Sec 66C, 66D), Bharatiya Nyaya Sanhita (BNS) cheating provisions.
- **Property & Land**: Tamil Nadu Patta Pass Book Act 1983, Transfer of Property Act 1882, Specific Relief Act 1963.
- **Cheque Dishonour**: Negotiable Instruments Act 1881 (Sec 138).
- **Public Governance**: Right to Information Act 2005 (RTI), Legal Services Authorities Act 1987 (NALSA/DLSA).

---

## 4. Multi-Signal Grounded Confidence Formula

The system computes retrieval confidence from multiple orthogonal signals rather than relying on a single cosine threshold:

$$\text{Confidence} = \max\left( \text{Dense}_{\text{score}}, \; 0.70 \times \text{Dense}_{\text{score}} + 0.30 \times \min\left(1.0, \frac{\text{BM25}_{\text{score}}}{10.0}\right) \right)$$

If confidence is below the statutory threshold ($0.45$), `human_review_required` is automatically set to `true`.
