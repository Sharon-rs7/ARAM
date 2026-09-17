# ARAM AI — MULTILINGUAL AI & TRIAGE PIPELINE

## 1. AI Pipeline Structure

```
                     RAW USER INPUT (Audio / Image / Text)
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
          Audio Input          Image Input          Text Input
               │                    │                    │
         Faster-Whisper       EasyOCR Engine             │
        (ta-IN/hi-IN/en)    (Contrast + Deskew)          │
               │                    │                    │
               └────────────────────┬────────────────────┘
                                    │
                           CLEAN NORMALIZED TEXT
                                    │
                                    ▼
                     LANGUAGE DETECTOR (ta / hi / en)
                                    │
                                    ▼
               MULTILINGUAL NLP CLASSIFIER (ONNX + Keywords)
                     -> Predicts C1-C10 Category Code
                     -> Computes Confidence Score
                                    │
                                    ▼
                     EXPLAINABLE PRIORITY ENGINE
                     -> Base weight + Urgency + Safety + Vulnerability
                     -> Maps to: LOW, MEDIUM, HIGH, SENSITIVE
                                    │
                                    ▼
                     GROUNDED RAG KNOWLEDGE RETRIEVER
                     -> 384-d Cosine Vector Search over Statutory Corpus
                     -> Pulls top-K Acts, Sections, and Legal Provisions
                                    │
                                    ▼
                     GEMINI 3.6 FLASH REASONING ENGINE
                     -> Context: User Query + Top Chunks + Taxonomy Guard
                     -> Generates structured localized explanation
                     -> Fallback: Deterministic Statutory Engine on 429/Error
```
