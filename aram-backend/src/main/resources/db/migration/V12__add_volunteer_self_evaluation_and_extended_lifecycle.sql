-- V12__add_volunteer_self_evaluation_and_extended_lifecycle.sql
-- ARAM Legal Aid Platform Schema Extension for End-to-End Case Lifecycle

-- 1. Create volunteer_self_evaluations table
CREATE TABLE IF NOT EXISTS volunteer_self_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    volunteer_id BIGINT NOT NULL,
    case_difficulty VARCHAR(30),
    confidence_level INT,
    time_spent_hours DOUBLE,
    challenges_faced TEXT,
    ai_usefulness_rating INT,
    communication_difficulty VARCHAR(30),
    case_outcome VARCHAR(50),
    lessons_learned TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vse_complaint (complaint_id),
    INDEX idx_vse_volunteer (volunteer_id)
);

