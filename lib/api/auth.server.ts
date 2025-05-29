import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { UserProfile } from "./auth";

// Server-side function to get user profile
export async function getServerUserProfile(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data as UserProfile
} 