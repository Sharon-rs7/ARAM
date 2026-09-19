-- V13__add_mobile_verified_and_whatsapp_opt_in.sql
-- ARAM WhatsApp Connect & Citizen Communication Gateway Preferences

ALTER TABLE users ADD COLUMN mobile_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN whatsapp_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
