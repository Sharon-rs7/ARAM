# ARAM AI — FINAL PRODUCTION DEPLOYMENT & HOSTING GUIDE

## 1. Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Port availability: `80`, `3306`, `6379`, `8000`, `8081`, `8082`, `27017`
- Google Gemini API Key (for LLM reasoning & grounding)

## 2. Fast Launch Commands
```bash
# Set production environment variables
cp .env.example .env

# Build and start all 7 production services
docker-compose -f docker-compose.prod.yml up --build -d

# Verify container health
docker-compose -f docker-compose.prod.yml ps
```

## 3. Microservice Ports & Endpoints
- **Frontend Web Portal**: `http://localhost:80`
- **Auth Microservice**: `http://localhost:8081/api`
- **Core Legal Aid Microservice**: `http://localhost:8082/api`
- **AI / RAG Microservice**: `http://localhost:8000`
- **MySQL 8.0**: `localhost:3306`
- **Redis Cache**: `localhost:6379`
- **MongoDB**: `localhost:27017`
