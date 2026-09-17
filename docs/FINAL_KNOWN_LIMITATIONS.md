# ARAM AI — FINAL KNOWN LIMITATIONS & FUTURE ROADMAP

## 1. Known Architectural & Operational Limitations

### 1. External LLM Rate Quotas (Gemini Free Tier)
- **Constraint**: The free tier of `gemini-3.6-flash` is subject to a 5 requests/minute quota limit.
- **Fail-Safe Mechanism**: The RAG pipeline incorporates an automated deterministic fallback that retrieves verified statutory excerpts and legal-aid authorities directly from the indexed vector knowledge base without interrupting citizen complaint filing.
- **Production Roadmap**: Connect to Google Cloud paid billing or configure load-balanced model rotation across OpenAI / Anthropic / Local Mistral.

### 2. WebRTC Voice NAT Traversal
- **Constraint**: In cellular (4G/5G) mobile environments behind carrier-grade symmetric NAT, P2P WebRTC calls require an intermediary TURN relay server.
- **Production Roadmap**: Provision a Coturn Docker container integrated with the signaling server.

### 3. Handwritten Regional Language Scans
- **Constraint**: Scanned or photographed handwritten Tamil/Hindi petitions exhibit variable OCR confidence.
- **Production Roadmap**: Route image verification to multimodal vision LLMs with automated deskewing and contrast preprocessing.
