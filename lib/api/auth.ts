import { getSupabaseClient } from "@/lib/supabase/client"

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  preferences: Record<string, any> | null
  created_at: string
  updated_at: string
}

export async function signUp(email: string, password: string, fullName: string): Promise<{ user: any; error: any }> {
  const supabase = getSupabaseClient()

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError || !authData.user) {
    return { user: null, error: authError }
  }

  // Create a user profile
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: authData.user.id,
      full_name: fullName,
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (profileError) {
    console.error("Error creating user profile:", profileError)
    // We don't return an error here because the auth account was created successfully
    // In a production app, you might want to delete the auth account if profile creation fails
  }

  return { user: authData.user, error: null }
}

export async function signIn(email: string, password: string): Promise<{ user: any; error: any }> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { user: data?.user || null, error }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<any> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return null
  }

  return data.user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data as UserProfile
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = getSupabaseClient()

  // Add updated_at timestamp
  const updatedProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("user_profiles").update(updatedProfile).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating user profile:", error)
    return null
  }

  return data as UserProfile
}
