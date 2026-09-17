# ARAM AI — Production Deployment & Docker Architecture

## 1. Multi-Container Architecture

```
Internet / Reverse Proxy (Port 443 / 80)
                │
                ▼
        Nginx API Gateway
        ├── /api/auth/     ──► auth-service (Port 8081, Spring Boot)
        ├── /api/core/     ──► aram-backend (Port 8082, Spring Boot)
        ├── /api/ai/       ──► ai-service (Port 8000, FastAPI)
        └── /              ──► frontend (Port 5173 / Static React)

Internal Private Docker Network:
  ├── ai-service  ──► qwen-inference (Port 8005, vLLM / Local REST)
  ├── ai-service  ──► mongodb (Port 27017, Evidence & AI Context)
  ├── ai-service  ──► redis (Port 6379, Session Context & Retrieval Cache)
  ├── aram-backend──► mysql (Port 3306, Complaints & Auth RBAC)
  └── auth-service──► mysql (Port 3306)
```

---

## 2. Docker Compose Configuration Snippet

```yaml
version: '3.8'

services:
  qwen-inference:
    image: vllm/vllm-openai:latest
    container_name: aram-qwen-inference
    runtime: nvidia # For GPU acceleration
    environment:
      - MODEL=Qwen/Qwen3-30B-A3B-Instruct
    command: >
      --model Qwen/Qwen3-30B-A3B-Instruct
      --port 8005
      --max-model-len 4096
      --gpu-memory-utilization 0.90
      --trust-remote-code
    networks:
      - aram-internal
    restart: unless-stopped

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: aram-ai-service
    ports:
      - "8000:8000"
    environment:
      - LLM_PROVIDER_PRIMARY=qwen
      - LLM_PROVIDER_FALLBACK=gemini
      - QWEN_BASE_URL=http://qwen-inference:8005/v1
      - QWEN_MODEL=Qwen/Qwen3-30B-A3B-Instruct
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_MODEL=gemini-1.5-flash
      - REDIS_HOST=redis
      - MONGO_URI=mongodb://mongodb:27017/aram
    depends_on:
      - qwen-inference
      - redis
      - mongodb
    networks:
      - aram-internal
      - aram-public
    restart: unless-stopped
```

---

## 3. Hardware Profiling & Sizing Guidelines

| Hosting Environment | Recommended Model | RAM / VRAM | Inference Framework |
|---|---|---|---|
| **High-End Cloud GPU** (A100 / H100 80GB) | `Qwen/Qwen3-30B-A3B-Instruct` | 80GB VRAM | vLLM with FP16/BF16 |
| **Mid-Tier GPU** (RTX 4090 / L4 24GB) | `Qwen/Qwen2.5-14B-Instruct-AWQ` | 24GB VRAM | vLLM with 4-bit AWQ |
| **Budget Cloud GPU / VPS** (T4 16GB) | `Qwen/Qwen2.5-7B-Instruct-AWQ` | 16GB VRAM | vLLM / Ollama |
| **CPU Only / Serverless** | Gemini 1.5 Flash (Primary) + Deterministic RAG | 8GB RAM | Direct FastAPI / PyTorch CPU |
