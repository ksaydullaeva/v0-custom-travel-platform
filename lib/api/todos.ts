import { getSupabaseClient } from "@/lib/supabase/client"
import { createServerClient } from "@/lib/supabase/server"

export type Todo = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  priority: "low" | "medium" | "high"
  related_destination_id: string | null
  created_at: string
  updated_at: string
}

export type TodoInput = Omit<Todo, "id" | "created_at" | "updated_at">

// Get todos for the current user
export async function getUserTodos() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("todos").select("*").order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching todos:", error)
    throw new Error("Failed to fetch todos")
  }

  return data as Todo[]
}

// Create a new todo
export async function createTodo(todo: TodoInput) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("todos").insert(todo).select().single()

  if (error) {
    console.error("Error creating todo:", error)
    throw new Error("Failed to create todo")
  }

  return data as Todo
}

// Update an existing todo
export async function updateTodo(id: string, updates: Partial<TodoInput>) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("todos").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating todo:", error)
    throw new Error("Failed to update todo")
  }

  return data as Todo
}

// Delete a todo
export async function deleteTodo(id: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("todos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting todo:", error)
    throw new Error("Failed to delete todo")
  }

  return true
}

// Server-side functions
export async function getUserTodosServer(userId: string) {
  const supabase = createServerClient()

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
