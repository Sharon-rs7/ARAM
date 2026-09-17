# ARAM AI — Environment Variables Specification

---

## 1. Auth Microservice (`auth-service/`)

```properties
SERVER_PORT=8081
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/aram_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
APP_JWT_SECRET=ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026
APP_JWT_EXPIRATION_MS=86400000
```

---

## 2. Legal Aid Core Service (`aram-backend/`)

```properties
SERVER_PORT=8082
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/aram_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/aram_logs
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD}
APP_JWT_SECRET=ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026
```

---

## 3. AI & RAG Inference Service (`ai-service/`)

```properties
AI_SERVICE_PORT=8000
INTERNAL_API_TOKEN=aram-secret-token-2026
MONGO_URI=mongodb://localhost:27017/aram_logs
WHISPER_MODEL_SIZE=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
```
