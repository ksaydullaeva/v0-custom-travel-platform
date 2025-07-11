import { getSupabaseClient } from "@/lib/supabase/client"

export interface Experience {
  id: string
  title: string
  description: string
  location: string
  price: number
  rating: number
  reviews_count: number
  duration: number
  image_url: string
  category: string
  city: string
  country: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

export interface ExperienceFilters {
  category?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  minDuration?: number
  maxDuration?: number
  search?: string
}

// Function to get experiences with client-side Supabase client
export async function getExperiences(
  filters: ExperienceFilters = {},
  limit = 20,
  offset = 0,
  sortBy = "rating",
  sortOrder = "desc",
): Promise<Experience[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("experiences").select("*")

  // Apply filters
  if (filters.category) {
    query = query.eq("category", filters.category)
  }

  if (filters.city) {
    query = query.eq("city", filters.city)
  }

  if (filters.country) {
    query = query.eq("country", filters.country)
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`,
    )
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters.minDuration !== undefined) {
    query = query.gte("duration", filters.minDuration)
  }

  if (filters.maxDuration !== undefined) {
    query = query.lte("duration", filters.maxDuration)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching experiences:", error)
    throw new Error("Failed to fetch experiences")
  }

  return data as Experience[]
}

// Function to get a single experience by ID
export async function getExperienceById(id: string): Promise<Experience | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("experiences").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching experience:", error)
    return null
  }

  return data as Experience
}

// Function to get experiences by city
export async function getExperiencesByCity(city: string, limit = 20, offset = 0): Promise<Experience[]> {
  return getExperiences({ city }, limit, offset)
}

// Function to get experiences by category
export async function getExperiencesByCategory(category: string, limit = 20, offset = 0): Promise<Experience[]> {
  return getExperiences({ category }, limit, offset)
}

// Function to get categories
export async function getCategories(): Promise<string[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("experiences")
    .select("category")
    .not("category", "is", null)
    .order("category")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // Extract unique categories
  const categories = [...new Set(data.map((item) => item.category))]
  return categories.filter(Boolean) as string[]
}
