import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Add type definitions
interface Experience {
  language: string
  price: number
}

interface BookingWithExperience {
  user_id: string
  experiences: Experience | null
  created_at: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30' // Default to last 30 days

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
    // Authenticate the user and ensure they are a business user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // You might want to verify the user is a business user by checking their metadata or a separate business_users table
    // For now, we'll assume the authenticated user is a business user for simplicity,
    // but in a real app, you should add this check.
    // Example check:
    // const { data: businessProfile, error: profileError } = await supabase
    //   .from('business_profiles')
    //   .select('id')
    //   .eq('id', user.id)
    //   .single()
    // if (profileError || !businessProfile) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // 1. Total Tours
    const { count: totalTours, error: totalToursError } = await supabase
      .from('experiences')
      .select('*', { count: 'exact' })
      .eq('business_id', user.id)

    if (totalToursError) throw totalToursError

    // 2. Active Bookings
    const { data: experienceIds, error: experienceError } = await supabase
      .from('experiences')
      .select('id')
      .eq('business_id', user.id)

    if (experienceError) throw experienceError

    const experienceIdList = experienceIds?.map(exp => exp.id) || []

    const { count: activeBookings, error: activeBookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .in('status', ['confirmed', 'pending'])
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .in('experience_id', experienceIdList)

    if (activeBookingsError) throw activeBookingsError

    // 3. Revenue Data
    const { data: revenueData, error: revenueError } = await supabase
      .from('bookings')
      .select(`
        created_at,
        experiences (
          price
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
      .in('experience_id', experienceIdList)
      .returns<BookingWithExperience[]>()

    if (revenueError) throw revenueError

    // Process revenue data for charts
    const revenueByDate = revenueData?.reduce((acc: { [key: string]: number }, booking) => {
      const date = new Date(booking.created_at).toLocaleDateString()
      const price = booking.experiences?.price || 0
      acc[date] = (acc[date] || 0) + price
      return acc
    }, {})

    const revenueChartData = {
      labels: Object.keys(revenueByDate || {}),
      data: Object.values(revenueByDate || {})
    }

    // 4. Bookings Data
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('created_at, status')
      .gte('created_at', new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
      .in('experience_id', experienceIdList)

    if (bookingsError) throw bookingsError

    // Process bookings data for charts
    const bookingsByDate = bookingsData?.reduce((acc: { [key: string]: number }, booking) => {
      const date = new Date(booking.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const bookingsChartData = {
      labels: Object.keys(bookingsByDate || {}),
      data: Object.values(bookingsByDate || {})
    }

    // 5. Customer Demographics
    const { data: customerData, error: customerError } = await supabase
      .from('bookings')
      .select('user_id, language')
      .in('experience_id', experienceIdList)

    if (customerError) throw customerError

    // Process customer demographics data
    const languageCounts = customerData?.reduce((acc: { [key: string]: number }, booking) => {
      const language = booking.language || 'Unknown'
      acc[language] = (acc[language] || 0) + 1
      return acc
    }, {})

    const demographicsData = {
      labels: Object.keys(languageCounts || {}),
      data: Object.values(languageCounts || {})
    }

    // Calculate total revenue
    const totalRevenue = revenueData?.reduce((sum, booking) => {
      const price = booking.experiences?.price || 0
      return sum + price
    }, 0) || 0

    // Calculate total customers
    const distinctUserIds = new Set(customerData?.map(booking => booking.user_id))
    const totalCustomers = distinctUserIds.size

    return NextResponse.json({
      totalTours,
      activeBookings,
      totalRevenue,
      totalCustomers,
      charts: {
        revenue: revenueChartData,
        bookings: bookingsChartData,
        demographics: demographicsData
      }
    })

  } catch (error) {
    console.error('Error fetching business analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
