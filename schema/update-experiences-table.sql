-- Add business_id column to experiences table if it doesn't exist
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES auth.users(id);

-- Add index for faster lookups by business_id
CREATE INDEX IF NOT EXISTS idx_experiences_business_id ON experiences(business_id);

-- Update RLS policies for experiences table to allow business access
DROP POLICY IF EXISTS "Businesses can manage their experiences" ON experiences;

CREATE POLICY "Businesses can manage their experiences" ON experiences
FOR ALL USING (
  auth.uid() = business_id OR 
  business_id IS NULL
);

-- Allow businesses to insert experiences
DROP POLICY IF EXISTS "Businesses can insert experiences" ON experiences;

CREATE POLICY "Businesses can insert experiences" ON experiences
FOR INSERT WITH CHECK (auth.uid() = business_id);
