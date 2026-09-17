-- Add ELO/Reputation tracking fields to performance profiles if not already present
ALTER TABLE legal_guide_performance_profiles ADD COLUMN reputation_score DOUBLE DEFAULT 0.5;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN completed_cases INT DEFAULT 0;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN successful_cases INT DEFAULT 0;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN average_resolution_time DOUBLE DEFAULT 0.0;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN deadline_success_rate DOUBLE DEFAULT 1.0;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN feedback_count INT DEFAULT 0;
ALTER TABLE legal_guide_performance_profiles ADD COLUMN last_elo_update DATETIME;

-- Add tracking timestamps to complaints for timeliness measurement
ALTER TABLE complaints ADD COLUMN assigned_at DATETIME;
ALTER TABLE complaints ADD COLUMN resolved_at DATETIME;

-- Create guide ELO history ledger with database-level uniqueness on complaint_id (Idempotency protection)
CREATE TABLE IF NOT EXISTS guide_elo_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guide_id BIGINT NOT NULL,
    complaint_id BIGINT NOT NULL UNIQUE,
    old_elo INT NOT NULL,
    new_elo INT NOT NULL,
    delta INT NOT NULL,
    performance_score DOUBLE NOT NULL,
    reason VARCHAR(255),
    created_at DATETIME
);
