import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, fullName, email } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Create a server-side Supabase admin client with service role key
    const supabase = createAdminClient()

    // Check if profile already exists
    const { data: existingProfile, count } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .eq("id", userId)

    if (count && count > 0) {
      // Profile already exists, update it
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          full_name: fullName || existingProfile[0].full_name,
          email: email || existingProfile[0].email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating user profile:", error)
        return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
      }

      return NextResponse.json({ success: true, profile: data, action: "updated" })
    }

    // Create the user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        full_name: fullName || "",
        email: email || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data, action: "created" })
  } catch (error: any) {
    console.error("Unexpected error in create-profile route:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
