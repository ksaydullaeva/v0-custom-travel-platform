-- Update RLS policies for user_profiles table

-- First, enable RLS if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON public.user_profiles;

-- Create policies
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow service role to do anything (bypasses RLS)
CREATE POLICY "Service role can do anything"
ON public.user_profiles
USING (true)
WITH CHECK (true);
