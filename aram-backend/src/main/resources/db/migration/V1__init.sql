-- ARAM Legal Aid Platform Database Schema V1 (Reconciled with JPA Entities)

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    gender VARCHAR(20),
    specialization VARCHAR(100),
    helper_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500),
    district VARCHAR(100),
    preferred_language VARCHAR(50),
    languages_known VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_mobile (mobile)
);

CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    district VARCHAR(100),
    language VARCHAR(50),
    authority VARCHAR(255),
    user_id BIGINT,
    assigned_helper_id BIGINT,
    sensitivity_flag BOOLEAN DEFAULT FALSE,
    manual_review_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_complaint_helper FOREIGN KEY (assigned_helper_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT UNIQUE,
    predicted_category VARCHAR(100),
    predicted_priority VARCHAR(50),
    recommended_authority VARCHAR(255),
    confidence_score DOUBLE,
    detected_language VARCHAR(50),
    fallback_used BOOLEAN DEFAULT FALSE,
    manual_review_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_result_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS authority_offices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    authority_type VARCHAR(100) NOT NULL,
    category_supported VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    working_hours VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    maps_url VARCHAR(500),
    online_portal_url VARCHAR(500),
    supported_languages VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_offices_district (district),
    INDEX idx_offices_category (category_supported)
);

CREATE TABLE IF NOT EXISTS ai_correction_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    model_version VARCHAR(50),
    original_category VARCHAR(100),
    corrected_category VARCHAR(100),
    original_priority VARCHAR(50),
    corrected_priority VARCHAR(50),
    original_authority VARCHAR(255),
    corrected_authority VARCHAR(255),
    correction_reason TEXT,
    corrected_by_admin_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_action_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT UNIQUE NOT NULL,
    summary TEXT,
    immediate_steps TEXT,
    required_documents TEXT,
    target_authority VARCHAR(255),
    estimated_timeline VARCHAR(100),
    legal_aid_eligible BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_plan_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
