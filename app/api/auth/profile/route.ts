import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookie = await cookieStore
          return cookie.get(name)?.value
        },
        set: async (name: string, value: string, options: any) => {
          const cookie = await cookieStore
          cookie.set(name, value, options)
        },
        remove: async (name: string, options: any) => {
          const cookie = await cookieStore
          cookie.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { userId, userData } = await request.json()

  // Verify the user is authenticated and matches the userId
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Create or update the user profile
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId,
      full_name: userData.full_name,
      email: userData.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
