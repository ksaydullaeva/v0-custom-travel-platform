import { getSupabaseClient } from "@/lib/supabase/client"

export interface Itinerary {
  id: string
  title: string
  description: string | null
  user_id: string
  start_date: string | null
  end_date: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: string
  itinerary_id: string
  name: string
  description: string | null
  day_number: number
  start_time: string | null
  end_time: string | null
  latitude: number | null
  longitude: number | null
  order_index: number
  destination_id: string | null
  created_at: string
  updated_at: string
}

export interface ItineraryDetail extends Itinerary {
  items: ItineraryItem[]
}

export async function getUserItineraries(limit = 20, offset = 0): Promise<Itinerary[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching itineraries:", error)
    throw new Error("Failed to fetch itineraries")
  }

  return data as Itinerary[]
}

export async function getPublicItineraries(limit = 20, offset = 0): Promise<Itinerary[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching public itineraries:", error)
    throw new Error("Failed to fetch public itineraries")
  }

  return data as Itinerary[]
}

export async function getItineraryById(id: string): Promise<ItineraryDetail | null> {
  const supabase = getSupabaseClient()

  // First get the itinerary
  const { data: itinerary, error: itineraryError } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", id)
    .single()

  if (itineraryError) {
    console.error("Error fetching itinerary:", itineraryError)
    return null
  }

  // Then get the itinerary items
  const { data: items, error: itemsError } = await supabase
    .from("itinerary_items")
    .select("*")
    .eq("itinerary_id", id)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true })

  if (itemsError) {
    console.error("Error fetching itinerary items:", itemsError)
    return null
  }

  return {
    ...itinerary,
    items: items || [],
  } as ItineraryDetail
}

export async function createItinerary(itinerary: Partial<Itinerary>): Promise<Itinerary | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("itineraries").insert(itinerary).select().single()

  if (error) {
    console.error("Error creating itinerary:", error)
    return null
  }

  return data as Itinerary
}

export async function updateItinerary(id: string, itinerary: Partial<Itinerary>): Promise<Itinerary | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("itineraries").update(itinerary).eq("id", id).select().single()

  if (error) {
    console.error("Error updating itinerary:", error)
    return null
  }

  return data as Itinerary
}

export async function deleteItinerary(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  // First delete all itinerary items
  const { error: itemsError } = await supabase.from("itinerary_items").delete().eq("itinerary_id", id)

  if (itemsError) {
    console.error("Error deleting itinerary items:", itemsError)
    return false
  }

  // Then delete the itinerary
  const { error } = await supabase.from("itineraries").delete().eq("id", id)

  if (error) {
    console.error("Error deleting itinerary:", error)
    return false
  }

  return true
}

export async function addItineraryItems(
  itineraryId: string,
  items: Partial<ItineraryItem>[],
): Promise<ItineraryItem[] | null> {
  const supabase = getSupabaseClient()

  // Add itinerary_id to each item
  const itemsWithItineraryId = items.map((item, index) => ({
    ...item,
    itinerary_id: itineraryId,
    order_index: item.order_index ?? index,
  }))

  const { data, error } = await supabase.from("itinerary_items").insert(itemsWithItineraryId).select()

  if (error) {
    console.error("Error adding itinerary items:", error)
    return null
  }

  return data as ItineraryItem[]
}
