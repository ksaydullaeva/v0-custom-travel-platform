-- Add age_categories column to experiences table
ALTER TABLE experiences
ADD COLUMN age_categories JSONB;

COMMENT ON COLUMN experiences.age_categories IS 'JSON array of age category objects, each with label, min, and max age.'; 