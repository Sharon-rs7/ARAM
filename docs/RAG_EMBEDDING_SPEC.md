# ARAM AI — RAG EMBEDDING SPECIFICATION
**Accessible Rights & Assistance Management**  
*Vector Embedding Specifications, Distance Metrics, and Indexing Parameters*

---

## 1. Embedding Model Profile

- **Model Name**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Architecture**: 12-layer Transformer (MiniLM)
- **Vector Dimension**: **384 dimensions**
- **Token Limit**: 512 tokens
- **Normalization**: Unit L2 Norm ($\|v\|_2 = 1.0$)
- **Distance Metric**: Cosine Similarity ($\cos(\theta) = u \cdot v$)

---

## 2. Multilingual & Script Support

| Language | Script / ISO Code | Tokenization & Representation |
| :--- | :--- | :--- |
| **English** | Latin (`en`) | Subword BPE tokenizer |
| **Tamil** | Tamil (`ta`) | Native Indic Unicode token mapping |
| **Hindi** | Devanagari (`hi`) | Native Indic Unicode token mapping |
| **Tanglish / Hinglish** | Latin transliterated | Cross-lingual shared subword embeddings |

---

## 3. Retrieval Parameters & Thresholds

```env
# Configurable RAG Parameters (.env)
RAG_TOP_K=5
RAG_SIMILARITY_THRESHOLD=0.45
RAG_MAX_CONTEXT_CHUNKS=4
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

---

## 4. Hardware & Latency Benchmarks

- **Device**: CPU / CUDA (Auto-detected).
- **Average Query Embedding Latency**: $32\text{ms}$ on modern multi-core CPU.
- **Batch Processing Throughput**: 120 chunks/second.
- **Memory Footprint**: $\sim 480\text{MB}$ RAM during inference.
