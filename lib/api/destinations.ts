import { getSupabaseClient } from "@/lib/supabase/client"

export interface Destination {
  id: string
  name: string
  city: string
  country: string | null
  image_url: string | null
  latitude: number
  longitude: number
  population: number | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface DestinationFilters {
  country?: string
  is_featured?: boolean
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
  if (filters.country) {
    query = query.eq("country", filters.country)
  }

  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured)
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
    .order("name", { ascending: true })
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

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  return getDestinations({ is_featured: true }, limit)
}

export async function getDestinationsByCountry(country: string, limit = 20): Promise<Destination[]> {
  return getDestinations({ country }, limit)
}

// Get all unique countries from destinations table
export async function getCountries(): Promise<string[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("destinations")
    .select("country")
    .not("country", "is", null)
    .order("country")

  if (error) {
    console.error("Error fetching countries:", error)
    return []
  }

  // Extract unique countries
  const countries = [...new Set(data.map((item) => item.country))]
  return countries.filter(Boolean) as string[]
}
