CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id BIGINT NULL,
    user_id BIGINT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    file_reference VARCHAR(512) NULL,
    retry_count INT DEFAULT 0,
    error_reason VARCHAR(1024) NULL,
    result_data TEXT NULL,
    request_metadata TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_job_idempotency UNIQUE (file_reference, task_type)
);
