-- Add itinerary column to experiences table
ALTER TABLE experiences
ADD COLUMN itinerary JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN experiences.itinerary IS 'Structured itinerary for the tour'; 