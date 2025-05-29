-- Create itinerary table
CREATE TABLE itinerary_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    description TEXT,
    step_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

    UNIQUE (experience_id, step_order) -- Ensure order is unique per experience
);

-- Add comments for columns
COMMENT ON TABLE itinerary_steps IS 'Individual steps for a tour itinerary';
COMMENT ON COLUMN itinerary_steps.experience_id IS 'The ID of the experience this itinerary step belongs to';
COMMENT ON COLUMN itinerary_steps.day_number IS 'The day number of the itinerary';
COMMENT ON COLUMN itinerary_steps.start_time IS 'Optional start time for the step';
COMMENT ON COLUMN itinerary_steps.end_time IS 'Optional end time for the step';
COMMENT ON COLUMN itinerary_steps.location IS 'Location of the itinerary step';
COMMENT ON COLUMN itinerary_steps.description IS 'Description of the itinerary step';
COMMENT ON COLUMN itinerary_steps.step_order IS 'The order of the step within the day'; 