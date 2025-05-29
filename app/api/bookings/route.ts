import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { experience_id, date, time, participants, language } = body

    // Validate required fields
    if (!experience_id || !date || !time || !participants || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: user.id,
          experience_id,
          booking_date: date,
          booking_time: time,
          participants,
          language,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error in booking creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
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

  // ... existing code ...
} 