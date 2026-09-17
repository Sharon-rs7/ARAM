# ARAM — Deployment & Security Architecture

---

## 1. Container Topology (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: aram-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: aram_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  mongodb:
    image: mongo:7.0
    container_name: aram-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7.0-alpine
    container_name: aram-redis
    ports:
      - "6379:6379"

  auth-service:
    build: ./auth-service
    container_name: aram-auth-service
    ports:
      - "8081:8081"
    depends_on:
      - mysql

  core-service:
    build: ./aram-backend
    container_name: aram-core-service
    ports:
      - "8082:8082"
    depends_on:
      - mysql
      - redis
      - mongodb

  ai-service:
    build: ./ai-service
    container_name: aram-ai-service
    ports:
      - "8000:8000"
    depends_on:
      - mongodb

  frontend:
    build: .
    container_name: aram-frontend
    ports:
      - "5173:5173"
    depends_on:
      - auth-service
      - core-service
      - ai-service

volumes:
  mysql_data:
  mongo_data:
```

---

## 2. Environment Variables Specification

```properties
# MySQL Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/aram_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

# MongoDB & Redis
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/aram_logs
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# JWT Security
APP_JWT_SECRET=ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026
APP_JWT_EXPIRATION_MS=86400000

# Google Workspace SMTP
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD}

# AI Service Internal Token
INTERNAL_API_TOKEN=aram-secret-token-2026
```
