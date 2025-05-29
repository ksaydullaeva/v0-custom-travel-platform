-- Add language column to bookings table
ALTER TABLE bookings
ADD COLUMN language TEXT NOT NULL DEFAULT 'en';

-- Add comment to explain the column
COMMENT ON COLUMN bookings.language IS 'The language selected by the user for the tour experience'; 