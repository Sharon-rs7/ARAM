-- Create Legal Guide Performance Profiles if not exists (handling Flyway run-before-Hibernate setup)
CREATE TABLE IF NOT EXISTS legal_guide_performance_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    legal_guide_id BIGINT NOT NULL UNIQUE,
    current_level_number INT DEFAULT 1,
    current_level_name VARCHAR(100) DEFAULT 'Beginner Legal Guide',
    credit_score INT DEFAULT 0,
    cases_assigned INT DEFAULT 0,
    cases_resolved INT DEFAULT 0,
    cases_confirmed_resolved INT DEFAULT 0,
    cases_reopened INT DEFAULT 0,
    average_rating DOUBLE DEFAULT 0.0,
    admin_quality_score INT DEFAULT 0,
    response_time_avg_minutes INT DEFAULT 0,
    document_request_count INT DEFAULT 0,
    action_plan_shared_count INT DEFAULT 0,
    sensitive_cases_handled INT DEFAULT 0,
    privacy_violation_count INT DEFAULT 0,
    downgrade_review_required BOOLEAN DEFAULT FALSE,
    last_level_updated_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    elo_rating INT DEFAULT 1000
);
