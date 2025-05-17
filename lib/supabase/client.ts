import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}
