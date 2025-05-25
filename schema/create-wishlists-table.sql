-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, experience_id)
);

-- Add RLS policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own wishlists
CREATE POLICY "Users can view their own wishlists" 
  ON wishlists FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert into their own wishlists
CREATE POLICY "Users can insert into their own wishlists" 
  ON wishlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete from their own wishlists
CREATE POLICY "Users can delete from their own wishlists" 
  ON wishlists FOR DELETE 
  USING (auth.uid() = user_id);
