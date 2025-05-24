-- Enable RLS on the user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can insert a user profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create policies that work with our approach
-- Allow users to select their own profile
CREATE POLICY "Users can select their own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow service role to do anything
CREATE POLICY "Service role can do anything"
ON user_profiles
USING (auth.jwt() ->> 'role' = 'service_role');
