#!/usr/bin/env python3
"""
ARAM Legal Aid Platform - Environment Generator
Generates cryptographically strong secrets for development and production environments.
"""

import os
import secrets
import sys

def generate_secret(num_bytes: int = 32) -> str:
    return secrets.token_urlsafe(num_bytes)

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_env = os.path.join(root_dir, ".env")
    force = "--force" in sys.argv

    if os.path.exists(target_env) and not force:
        print(f"[INFO] .env already exists at {target_env}. Use --force to overwrite.")
        return

    jwt_secret = generate_secret(48)  # 64 chars
    internal_token = generate_secret(32)
    db_password = generate_secret(24)
    db_root_password = generate_secret(24)
    redis_password = generate_secret(24)

    env_content = f"""# ==============================================================================
# ARAM Environment Configuration (Generated Automatically)
# Do not commit this file to source control.
# ==============================================================================

# Database Credentials
DB_NAME=aram_db
DB_USERNAME=aram
DB_PASSWORD={db_password}
DB_ROOT_PASSWORD={db_root_password}
DB_URL=jdbc:mysql://localhost:3306/aram_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD={redis_password}

# MongoDB AI Logs
MONGO_URI=mongodb://localhost:27017/aram_logs
MONGO_DB=aram_logs

# Authentication & Internal Tokens
JWT_SECRET={jwt_secret}
INTERNAL_API_TOKEN={internal_token}
AI_INTERNAL_TOKEN={internal_token}
APP_ENCRYPTION_KEY=ARAMLegalAidEncryptionSecretKey2026

# Email Service
SPRING_MAIL_USERNAME=
SPRING_MAIL_PASSWORD=
APP_MAIL_ENABLED=false

# External AI APIs (Optional / Bring Your Own Key)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
DEEPGRAM_API_KEY=

# Service Endpoints
AI_SERVICE_URL=http://127.0.0.1:8000
VITE_API_BASE_URL=http://localhost:8082/api
VITE_AUTH_SERVICE_BASE_URL=http://localhost:8082/api
VITE_AI_SERVICE_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=false
"""

    with open(target_env, "w", encoding="utf-8") as f:
        f.write(env_content)

    print(f"[SUCCESS] Wrote new environment configuration to {target_env}")

if __name__ == "__main__":
    main()
