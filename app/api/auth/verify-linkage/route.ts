import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get a sample of users from auth.users
    const { data: authUsers, error: authError } = await supabase.from("auth.users").select("id, email").limit(5)

    if (authError) {
      return NextResponse.json({ error: "Failed to fetch auth users" }, { status: 500 })
    }

    // Check if each auth user has a corresponding profile
    const results = await Promise.all(
      authUsers.map(async (authUser) => {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        return {
          authUser,
          hasProfile: !!profile,
          profile: profile || null,
          error: profileError ? profileError.message : null,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      results,
      allLinked: results.every((result) => result.hasProfile),
    })
  } catch (error) {
    console.error("Error verifying linkage:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
