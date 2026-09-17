-- ARAM Database Migration V9: Align Schema with JPA Entity mappings

-- ========================================================
-- 1. Create Missing Tables
-- ========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME(6) NOT NULL,
    log_hash VARCHAR(64),
    previous_hash VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    details TEXT
);

CREATE TABLE IF NOT EXISTS authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(50),
    district VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    category VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS blockchain_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nonce INTEGER NOT NULL,
    block_index BIGINT NOT NULL UNIQUE,
    complaint_id BIGINT NOT NULL UNIQUE,
    timestamp DATETIME(6) NOT NULL,
    block_hash VARCHAR(64) NOT NULL,
    complaint_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    block_data TEXT
);

CREATE TABLE IF NOT EXISTS case_appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    legal_guide_id BIGINT NOT NULL,
    public_user_id BIGINT NOT NULL,
    scheduled_at DATETIME(6),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    requested_by VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    mode VARCHAR(30) NOT NULL,
    preferred_time VARCHAR(30) NOT NULL,
    note TEXT
);

CREATE TABLE IF NOT EXISTS case_chat_threads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    legal_guide_id BIGINT NOT NULL,
    public_user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS case_cost_estimates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    estimated_max_amount INTEGER,
    estimated_min_amount INTEGER,
    free_legal_aid_available BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_legal_guide BOOLEAN NOT NULL DEFAULT FALSE,
    complaint_id BIGINT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    currency VARCHAR(10),
    cost_type VARCHAR(50),
    estimate_source VARCHAR(50),
    authority_type VARCHAR(100),
    category VARCHAR(100),
    excludes TEXT,
    includes TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS case_document_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    complaint_id BIGINT NOT NULL,
    legal_guide_id BIGINT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    status VARCHAR(20) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(255),
    reason VARCHAR(255),
    rejection_reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS case_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    helpful BOOLEAN NOT NULL DEFAULT TRUE,
    rating INTEGER NOT NULL,
    complaint_id BIGINT NOT NULL UNIQUE,
    legal_guide_id BIGINT NOT NULL,
    public_user_id BIGINT NOT NULL,
    created_at DATETIME(6),
    comment TEXT
);

CREATE TABLE IF NOT EXISTS case_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    read_aloud_supported BOOLEAN NOT NULL DEFAULT FALSE,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    transcript_confidence DOUBLE,
    voice_message_used BOOLEAN NOT NULL DEFAULT FALSE,
    complaint_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    thread_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    message_type VARCHAR(30) NOT NULL,
    sender_role VARCHAR(30) NOT NULL,
    language VARCHAR(50),
    file_reference VARCHAR(255),
    message_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_outcome_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_plan_useful BOOLEAN NOT NULL DEFAULT TRUE,
    authority_guidance_correct BOOLEAN NOT NULL DEFAULT TRUE,
    downgrade_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_handled_correctly BOOLEAN NOT NULL DEFAULT TRUE,
    quality_rating INTEGER NOT NULL,
    complaint_id BIGINT NOT NULL,
    legal_guide_id BIGINT NOT NULL,
    reviewed_by_admin_id BIGINT NOT NULL,
    created_at DATETIME(6),
    notes_quality TEXT,
    outcome_status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cost_estimate_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    free_legal_aid_available BOOLEAN NOT NULL DEFAULT FALSE,
    max_amount INTEGER,
    min_amount INTEGER,
    currency VARCHAR(10),
    authority_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    excludes TEXT,
    includes TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS document_verification_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_type_confidence DOUBLE,
    image_quality_score DOUBLE,
    ocr_confidence DOUBLE,
    verification_score DOUBLE,
    complaint_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    verified_by_user_id BIGINT,
    created_at DATETIME(6),
    verified_at DATETIME(6),
    status VARCHAR(40) NOT NULL,
    engine VARCHAR(50),
    model_version VARCHAR(50),
    document_type VARCHAR(100),
    errors_json TEXT,
    extracted_fields_json TEXT,
    masked_ocr_text TEXT,
    ocr_text TEXT,
    reasons_json TEXT
);

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_score DOUBLE,
    complaint_id BIGINT NOT NULL,
    uploaded_at DATETIME(6),
    file_type VARCHAR(80) NOT NULL,
    predicted_document_type VARCHAR(100),
    file_name VARCHAR(180) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS guide_assignment_decision_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_score DOUBLE NOT NULL,
    reopened BOOLEAN NOT NULL DEFAULT FALSE,
    user_rating INTEGER,
    admin_id BIGINT NOT NULL,
    assigned_guide_id BIGINT NOT NULL,
    complaint_id BIGINT NOT NULL,
    recommended_guide_id BIGINT,
    created_at DATETIME(6),
    final_outcome VARCHAR(255),
    model_version VARCHAR(255),
    override_reason TEXT
);

CREATE TABLE IF NOT EXISTS guide_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    women_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6),
    expiry_time DATETIME(6) NOT NULL,
    role VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    languages VARCHAR(250),
    specializations VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS legal_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS legal_guide_case_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    legal_guide_id BIGINT NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS legal_guide_credit_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    points INTEGER NOT NULL,
    awarded_by_user_id BIGINT,
    complaint_id BIGINT,
    legal_guide_id BIGINT NOT NULL,
    created_at DATETIME(6),
    awarded_by_role VARCHAR(255),
    reason VARCHAR(255),
    source VARCHAR(255),
    transaction_type VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS legal_guide_level_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    assignment_weight DOUBLE NOT NULL DEFAULT 1.0,
    level_number INTEGER NOT NULL,
    max_credit_score INTEGER NOT NULL,
    min_credit_score INTEGER NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    badge_name VARCHAR(255),
    level_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS legal_guide_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    can_read_hindi BOOLEAN NOT NULL DEFAULT FALSE,
    can_read_tamil BOOLEAN NOT NULL DEFAULT FALSE,
    current_workload INTEGER NOT NULL DEFAULT 0,
    experience_years INTEGER NOT NULL DEFAULT 0,
    max_case_capacity INTEGER NOT NULL DEFAULT 5,
    supports_hinglish BOOLEAN NOT NULL DEFAULT FALSE,
    supports_tanglish BOOLEAN NOT NULL DEFAULT FALSE,
    women_support_trained BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    district VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    expertise_categories VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(255),
    languages_known VARCHAR(255),
    phone VARCHAR(255),
    service_areas VARCHAR(255),
    verification_status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS legal_problem_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    women_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    priority_code VARCHAR(20),
    problem_id VARCHAR(20) NOT NULL UNIQUE,
    preferred_volunteer_gender_rule VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    priority_name VARCHAR(100),
    recommended_authority VARCHAR(150),
    subcategory VARCHAR(150) NOT NULL,
    disclaimer TEXT,
    next_steps TEXT,
    required_documents TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    read_flag BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at DATETIME(6),
    sent_at DATETIME(6)
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    otp VARCHAR(6) NOT NULL,
    blocked_until DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    expiry_time DATETIME(6) NOT NULL,
    email VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS regions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL UNIQUE,
    region_name VARCHAR(100) NOT NULL,
    admin_email VARCHAR(150),
    created_at DATETIME(6)
);

CREATE TABLE IF NOT EXISTS volunteer_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id BIGINT NOT NULL,
    duration_seconds BIGINT,
    action_label VARCHAR(255),
    action_type VARCHAR(255) NOT NULL,
    route_path VARCHAR(255),
    session_id VARCHAR(255),
    target_id VARCHAR(255),
    target_type VARCHAR(255),
    metadata_json TEXT,
    created_at DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS volunteer_matching_training_samples (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_category_match BOOLEAN NOT NULL DEFAULT FALSE,
    candidate_credit_score INTEGER NOT NULL DEFAULT 0,
    candidate_experience_years INTEGER NOT NULL DEFAULT 0,
    candidate_language_match BOOLEAN NOT NULL DEFAULT FALSE,
    candidate_level INTEGER NOT NULL DEFAULT 1,
    candidate_women_support_trained BOOLEAN NOT NULL DEFAULT FALSE,
    candidate_workload INTEGER NOT NULL DEFAULT 0,
    match_quality_score DOUBLE NOT NULL DEFAULT 0.0,
    sensitive_flag BOOLEAN NOT NULL DEFAULT FALSE,
    imported_at DATETIME(6),
    category VARCHAR(255),
    complaint_text TEXT,
    language_code VARCHAR(255),
    priority VARCHAR(255),
    problem_id VARCHAR(255),
    recommended_authority VARCHAR(255),
    required_documents TEXT,
    row_hash VARCHAR(255),
    source_file_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS volunteer_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    last_active_at DATETIME(6) NOT NULL,
    login_at DATETIME(6) NOT NULL,
    logout_at DATETIME(6),
    total_duration_seconds BIGINT,
    volunteer_id BIGINT NOT NULL,
    device_info VARCHAR(255),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(255) NOT NULL
);

-- ========================================================
-- 2. Alter Existing Tables to Add Missing Columns
-- ========================================================

-- Table: users
ALTER TABLE users ADD COLUMN can_handle_sensitive_cases BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN can_read_hindi BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN can_read_tamil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN current_active_cases INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN force_password_change BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN max_active_cases INTEGER NOT NULL DEFAULT 5;
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN simple_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN speech_rate_preference DOUBLE NOT NULL DEFAULT 1.0;
ALTER TABLE users ADD COLUMN supports_hinglish BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN supports_tanglish BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN voice_assistance_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN women_support_trained BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN associated_authority_id BIGINT NULL;
ALTER TABLE users ADD COLUMN last_login DATETIME(6) NULL;
ALTER TABLE users ADD COLUMN updated_at DATETIME(6) NULL;
ALTER TABLE users ADD COLUMN availability_status VARCHAR(50) NULL DEFAULT 'AVAILABLE';
ALTER TABLE users ADD COLUMN experience_level VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN bio VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN service_area VARCHAR(250) NULL;
ALTER TABLE users ADD COLUMN specialization_categories VARCHAR(250) NULL;
ALTER TABLE users ADD COLUMN sub_specializations VARCHAR(250) NULL;
ALTER TABLE users ADD COLUMN address VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(20) NOT NULL DEFAULT 'LIGHT';

-- Table: complaints
ALTER TABLE complaints ADD COLUMN disclaimer_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN disclaimer_accepted_at DATETIME(6) NULL;
ALTER TABLE complaints ADD COLUMN high_risk BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN language_confidence DOUBLE NULL;
ALTER TABLE complaints ADD COLUMN priority_score INTEGER NULL DEFAULT 0;
ALTER TABLE complaints ADD COLUMN transcript_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN transcription_confidence DOUBLE NULL;
ALTER TABLE complaints ADD COLUMN voice_input_used BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN voice_transcript_confidence DOUBLE NULL;
ALTER TABLE complaints ADD COLUMN women_sensitive BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN referred_advocate_id BIGINT NULL;
ALTER TABLE complaints ADD COLUMN updated_at DATETIME(6) NULL;
ALTER TABLE complaints ADD COLUMN complaint_custom_id VARCHAR(50) NULL UNIQUE;
ALTER TABLE complaints ADD COLUMN detected_language VARCHAR(50) NULL;
ALTER TABLE complaints ADD COLUMN input_language VARCHAR(50) NULL;
ALTER TABLE complaints ADD COLUMN original_language VARCHAR(50) NULL;
ALTER TABLE complaints ADD COLUMN preferred_response_language VARCHAR(50) NULL;
ALTER TABLE complaints ADD COLUMN safe_contact_method VARCHAR(50) NULL;
ALTER TABLE complaints ADD COLUMN safe_contact_time VARCHAR(100) NULL;
ALTER TABLE complaints ADD COLUMN assignment_override_reason TEXT NULL;
ALTER TABLE complaints ADD COLUMN authority_remarks TEXT NULL;
ALTER TABLE complaints ADD COLUMN legal_opinion TEXT NULL;
ALTER TABLE complaints ADD COLUMN normalized_text TEXT NULL;
ALTER TABLE complaints ADD COLUMN original_text TEXT NULL;
ALTER TABLE complaints ADD COLUMN reopen_reason TEXT NULL;
ALTER TABLE complaints ADD COLUMN resolution_summary TEXT NULL;
ALTER TABLE complaints ADD COLUMN transcribed_text TEXT NULL;
ALTER TABLE complaints ADD COLUMN translated_text TEXT NULL;
ALTER TABLE complaints ADD COLUMN identity_visibility VARCHAR(30) NOT NULL DEFAULT 'VISIBLE';
ALTER TABLE complaints ADD COLUMN input_mode VARCHAR(30) NOT NULL DEFAULT 'TEXT';
ALTER TABLE complaints ADD COLUMN preferred_helper_gender VARCHAR(30) NOT NULL DEFAULT 'ANY';

-- Table: ai_results
ALTER TABLE ai_results ADD COLUMN category VARCHAR(60) NOT NULL;
ALTER TABLE ai_results ADD COLUMN priority VARCHAR(20) NOT NULL;
ALTER TABLE ai_results ADD COLUMN confidence DOUBLE NOT NULL DEFAULT 0.0;
ALTER TABLE ai_results ADD COLUMN model_version VARCHAR(50) NULL;
ALTER TABLE ai_results ADD COLUMN required_documents TEXT NULL;
ALTER TABLE ai_results ADD COLUMN authority_language_match BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ai_results ADD COLUMN language_confidence DOUBLE NULL;
ALTER TABLE ai_results ADD COLUMN priority_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_results ADD COLUMN read_aloud_available BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ai_results ADD COLUMN complexity VARCHAR(50) NULL;
ALTER TABLE ai_results ADD COLUMN response_language VARCHAR(50) NULL;
ALTER TABLE ai_results ADD COLUMN detected_issues TEXT NULL;
ALTER TABLE ai_results ADD COLUMN next_steps TEXT NULL;
ALTER TABLE ai_results ADD COLUMN normalized_text TEXT NULL;
ALTER TABLE ai_results ADD COLUMN spoken_summary_text TEXT NULL;
ALTER TABLE ai_results ADD COLUMN translated_summary TEXT NULL;
ALTER TABLE ai_results ADD COLUMN reason TEXT NULL;

-- Table: case_action_plans
ALTER TABLE case_action_plans ADD COLUMN online_submission_available BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE case_action_plans ADD COLUMN visit_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE case_action_plans ADD COLUMN admin_id BIGINT NULL;
ALTER TABLE case_action_plans ADD COLUMN legal_guide_id BIGINT NULL;
ALTER TABLE case_action_plans ADD COLUMN updated_at DATETIME(6) NULL;
ALTER TABLE case_action_plans ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE case_action_plans ADD COLUMN document_checklist TEXT NULL;
ALTER TABLE case_action_plans ADD COLUMN expected_timeline VARCHAR(255) NULL;
ALTER TABLE case_action_plans ADD COLUMN legal_guide_note TEXT NULL;
ALTER TABLE case_action_plans ADD COLUMN recommended_authority_name VARCHAR(255) NULL;
ALTER TABLE case_action_plans ADD COLUMN safety_note VARCHAR(255) NULL;
ALTER TABLE case_action_plans ADD COLUMN authority_category VARCHAR(50) NULL;

-- ========================================================
-- 3. Create Constraints, Indexes and Foreign Keys
-- ========================================================

CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (read_flag);
CREATE INDEX idx_appointments_guide ON case_appointments (legal_guide_id);
CREATE INDEX idx_chat_threads_user ON case_chat_threads (public_user_id);

ALTER TABLE case_appointments ADD CONSTRAINT fk_appointment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;
ALTER TABLE case_chat_threads ADD CONSTRAINT fk_chat_thread_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;
ALTER TABLE case_messages ADD CONSTRAINT fk_message_thread FOREIGN KEY (thread_id) REFERENCES case_chat_threads(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE legal_guide_profiles ADD CONSTRAINT fk_guide_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
