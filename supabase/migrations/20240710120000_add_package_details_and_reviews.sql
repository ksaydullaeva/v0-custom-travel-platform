-- Add exclusions and meeting/pickup fields to package_options
ALTER TABLE package_options
  ADD COLUMN IF NOT EXISTS exclusions JSONB,
  ADD COLUMN IF NOT EXISTS meeting_point_address TEXT,
  ADD COLUMN IF NOT EXISTS meeting_point_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS meeting_point_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS meeting_point_details TEXT,
  ADD COLUMN IF NOT EXISTS meeting_point_start_time TEXT,
  ADD COLUMN IF NOT EXISTS meeting_point_end_time TEXT;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE
); 