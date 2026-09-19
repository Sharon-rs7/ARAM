-- ARAM Migration V14: Add mobile_number to password_reset_otps for SMS & WhatsApp OTP recovery

ALTER TABLE password_reset_otps ADD COLUMN mobile_number VARCHAR(20) NULL;
CREATE INDEX idx_reset_otp_mobile ON password_reset_otps (mobile_number);
