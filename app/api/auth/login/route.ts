import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

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

  // Try to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Successful login
  return NextResponse.json({ success: true, user: data.user }, { status: 200 })
}
