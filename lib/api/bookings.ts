import { getSupabaseClient } from "@/lib/supabase/client"
import type { Experience } from "./experiences"

export interface Booking {
  id: string
  user_id: string
  experience_id: string
  booking_date: string
  participants: number
  total_price: number
  status: string
  contact_email: string
  contact_phone: string
  special_requests: string | null
  created_at: string
  updated_at: string
  experience?: Experience
}

export interface BookingCreateParams {
  user_id: string
  experience_id: string
  booking_date: string
  participants: number
  total_price: number
  contact_email: string
  contact_phone: string
  special_requests?: string
}

// Create a new booking
export async function createBooking(params: BookingCreateParams): Promise<Booking> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: params.user_id,
      experience_id: params.experience_id,
      booking_date: params.booking_date,
      participants: params.participants,
      total_price: params.total_price,
      status: "confirmed", // Default status
      contact_email: params.contact_email,
      contact_phone: params.contact_phone,
      special_requests: params.special_requests || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return data as Booking
}

// Get bookings for a user
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      experience:experience_id (*)
    `)
    .eq("user_id", userId)
    .order("booking_date", { ascending: false })

  if (error) {
    console.error("Error fetching user bookings:", error)
    throw new Error("Failed to fetch bookings")
  }

  return data as Booking[]
}

// Get a single booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      experience:experience_id (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching booking:", error)
    return null
  }

  return data as Booking
}

// Cancel a booking
export async function cancelBooking(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id)

  if (error) {
    console.error("Error cancelling booking:", error)
    return false
  }

  return true
}
