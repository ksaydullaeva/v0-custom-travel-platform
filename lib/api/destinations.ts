import { getSupabaseClient } from "@/lib/supabase/client"

export interface Destination {
  id: string
  name: string
  description: string | null
  image_url: string | null
  latitude: number
  longitude: number
  country: string | null
  city: string | null
  category: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

export interface DestinationFilters {
  category?: string
  country?: string
  city?: string
  search?: string
}

export async function getDestinations(
  filters: DestinationFilters = {},
  limit = 20,
  offset = 0,
): Promise<Destination[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("destinations").select("*")

  // Apply filters
  if (filters.category) {
    query = query.eq("category", filters.category)
  }

  if (filters.country) {
    query = query.eq("country", filters.country)
  }

  if (filters.city) {
    query = query.eq("city", filters.city)
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
    .order("rating", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching destinations:", error)
    throw new Error("Failed to fetch destinations")
  }

  return data as Destination[]
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("destinations").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching destination:", error)
    return null
  }

  return data as Destination
}
