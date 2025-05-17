import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client for server-side usage
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "", {
    auth: {
      persistSession: false,
      // Get auth token from cookie if available
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
