ALTER TABLE complaints ADD COLUMN guide_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_results ADD COLUMN case_summary TEXT;
