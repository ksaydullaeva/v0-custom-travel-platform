import { createServerClient as createServerClientBase } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerClient() {
  const cookieStore = cookies()

  return createServerClientBase(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Create a separate admin client that uses the service role key
export function createAdminClient() {
  return createServerClientBase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
    {
      // No cookies needed for admin operations
      cookies: {
        get(name: string) {
          return undefined
        },
        set(name: string, value: string, options: any) {},
        remove(name: string, options: any) {},
      },
    },
  )
}

export function getSupabaseServerClient() {
  return createServerClient()
}
