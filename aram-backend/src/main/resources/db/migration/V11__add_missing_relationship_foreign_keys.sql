-- Hardening ARAM V2 Database Relationships

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_complaint 
FOREIGN KEY (complaint_id) REFERENCES complaints(id);

ALTER TABLE case_appointments 
ADD CONSTRAINT fk_appointment_citizen 
FOREIGN KEY (public_user_id) REFERENCES users(id);

ALTER TABLE case_appointments 
ADD CONSTRAINT fk_appointment_helper 
FOREIGN KEY (legal_guide_id) REFERENCES users(id);

ALTER TABLE case_messages 
ADD CONSTRAINT fk_message_sender 
FOREIGN KEY (sender_id) REFERENCES users(id);

ALTER TABLE document_verification_results 
ADD CONSTRAINT fk_doc_verification_document 
FOREIGN KEY (document_id) REFERENCES documents(id);

ALTER TABLE document_verification_results 
ADD CONSTRAINT fk_doc_verification_complaint 
FOREIGN KEY (complaint_id) REFERENCES complaints(id);

ALTER TABLE case_cost_estimates 
ADD CONSTRAINT fk_cost_estimate_complaint 
FOREIGN KEY (complaint_id) REFERENCES complaints(id);

ALTER TABLE blockchain_blocks 
ADD CONSTRAINT fk_blockchain_complaint 
FOREIGN KEY (complaint_id) REFERENCES complaints(id);
