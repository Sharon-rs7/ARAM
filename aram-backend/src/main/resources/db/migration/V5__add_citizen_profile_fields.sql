-- V5__add_citizen_profile_fields.sql
-- Add citizen profile fields to users table
ALTER TABLE users ADD COLUMN date_of_birth DATE NULL;
ALTER TABLE users ADD COLUMN state VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN pincode VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN profile_completion_percentage INT DEFAULT 0;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(150) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempt_count INT DEFAULT 0,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
