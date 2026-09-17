# ARAM — Database Schema & Data Architecture

**Database Systems**: MySQL 8.0 (`aram_db`), MongoDB 7.0 (`aram_logs`), Redis 7.0  
**Migration Framework**: Flyway (`V1__init.sql` through `V11__add_missing_relationship_foreign_keys.sql`)  

---

## 1. MySQL Relational Schema (`aram_db`)

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : "files (citizen_id)"
    USERS ||--o{ REFRESH_TOKENS : "owns (user_id)"
    USERS ||--o{ CASE_ACTION_PLANS : "assigned_to (helper_id)"
    USERS ||--o{ NOTIFICATIONS : "receives (user_id)"
    USERS ||--o{ AUDIT_LOGS : "acts (actor_id)"
    COMPLAINTS ||--o| AI_ANALYSIS_RESULTS : "analyzed_by (complaint_id)"
    COMPLAINTS ||--o| CASE_ACTION_PLANS : "managed_by (complaint_id)"
    COMPLAINTS ||--o{ COMPLAINT_DOCUMENTS : "contains (complaint_id)"
    COMPLAINTS ||--o{ AUDIT_LOGS : "generates (complaint_id)"
    COMPLAINTS ||--o{ CASE_MESSAGES : "contains (complaint_id)"

    USERS {
        bigint id PK
        varchar email UK
        varchar phone UK
        varchar password_hash
        varchar role
        varchar district
        boolean is_active
        datetime created_at
    }

    COMPLAINTS {
        bigint id PK
        varchar tracking_number UK
        bigint citizen_id FK
        varchar title
        text description_encrypted
        varchar category
        varchar priority
        varchar status
        varchar district
        varchar language
        boolean sensitive_flag
        boolean female_guide_requested
        datetime created_at
        datetime updated_at
    }

    AI_ANALYSIS_RESULTS {
        bigint id PK
        bigint complaint_id FK
        varchar predicted_category
        float category_confidence
        varchar predicted_priority
        float priority_confidence
        text extracted_legal_sections
        float duplicate_score
        datetime analyzed_at
    }

    CASE_ACTION_PLANS {
        bigint id PK
        bigint complaint_id FK
        bigint helper_id FK
        varchar current_stage
        text steps_completed
        text next_steps
        datetime target_completion_date
    }

    AUTHORITIES {
        bigint id PK
        varchar name
        varchar designation
        varchar department
        varchar district
        varchar phone
        varchar email
    }

    AUDIT_LOGS {
        bigint id PK
        bigint complaint_id FK
        bigint actor_id FK
        varchar action
        varchar previous_state
        varchar new_state
        varchar ip_address
        varchar hash
        varchar previous_hash
        datetime timestamp
    }
```

---

## 2. Foreign Key Constraints & Cascade Policies

| Source Column | Target Column | On Delete Action | On Update Action | Integrity Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `complaints.citizen_id` | `users.id` | `RESTRICT` | `CASCADE` | Prevents deleting citizens with active complaints |
| `case_action_plans.complaint_id` | `complaints.id` | `CASCADE` | `CASCADE` | Action plans lifecycle bound to complaint |
| `case_action_plans.helper_id` | `users.id` | `SET NULL` | `CASCADE` | Preserves action plan if guide account is deactivated |
| `ai_analysis_results.complaint_id` | `complaints.id`| `CASCADE` | `CASCADE` | Clean cascade of AI inference records |
| `audit_logs.complaint_id` | `complaints.id` | `SET NULL` | `CASCADE` | Preserves audit chain even upon record purge |
| `audit_logs.actor_id` | `users.id` | `RESTRICT` | `CASCADE` | Ensures immutable attribution of audit events |

---

## 3. MongoDB Collections (`aram_logs`)

1. **`ai_inference_telemetry`**: Stores full request/response payloads, inference latency, Faster-Whisper durations, and ONNX probability vectors.
2. **`vector_embeddings_store`**: Stores 384-dimensional `all-MiniLM-L12-v2` dense vectors for deduplication and RAG search.
3. **`document_ocr_logs`**: Stores bounding boxes, raw text extractions, and PII masking audit records.
4. **`chatbot_logs`**: Conversation session history, intent detection scores, and citation mappings.

---

## 4. Redis Keys & Cache Eviction Strategy

- **Queue (`aram:jobs:queue`)**: Redis list for heavy async task distribution (multi-page OCR, PDF export).
- **Regional Stats (`aram:cache:district:stats:{district}`)**: 60s TTL string cache for regional admin KPI cards.
- **Statewide Stats (`aram:cache:superadmin:statewide`)**: 30s TTL cache aggregating all 38 Tamil Nadu districts.
