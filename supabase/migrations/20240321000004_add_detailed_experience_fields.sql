-- Add detailed fields to experiences table
ALTER TABLE experiences
ADD COLUMN overview TEXT,
ADD COLUMN whats_included JSONB,
ADD COLUMN whats_not_included JSONB,
ADD COLUMN meetup_pickup JSONB,
ADD COLUMN what_to_expect TEXT,
ADD COLUMN additional_info TEXT,
ADD COLUMN cancellation_policy TEXT,
ADD COLUMN faq JSONB;

-- Add comments for new columns
COMMENT ON COLUMN experiences.overview IS 'Overview description of the experience';
COMMENT ON COLUMN experiences.whats_included IS 'JSON array of items included in the experience';
COMMENT ON COLUMN experiences.whats_not_included IS 'JSON array of items not included in the experience';
COMMENT ON COLUMN experiences.meetup_pickup IS 'JSON object or array for meetup and pickup details';
COMMENT ON COLUMN experiences.what_to_expect IS 'Detailed description of what to expect during the experience';
COMMENT ON COLUMN experiences.additional_info IS 'Any additional important information';
COMMENT ON COLUMN experiences.cancellation_policy IS 'Details of the cancellation policy';
COMMENT ON COLUMN experiences.faq IS 'JSON array of frequently asked questions and answers'; 