import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Todo } from "./todos";

// Server-side functions
export async function getUserTodosServer(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching todos:", error)
    throw new Error("Failed to fetch todos")
  }

  return data as Todo[]
} 