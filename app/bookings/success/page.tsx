"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!sessionId) {
        setError("Invalid session ID")
        setIsLoading(false)
        return
      }

      try {
        const supabase = getSupabaseClient()

        // Find the booking by payment ID (which is the Stripe session ID)
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            experience:experience_id (*)
          `)
          .eq("payment_id", sessionId)
          .single()

        if (error) {
          console.error("Error fetching booking:", error)
          setError("Failed to load booking details")
        } else {
          setBooking(data)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingDetails()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Confirming your booking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/bookings")}>View My Bookings</Button>
              <Button variant="outline" onClick={() => router.push("/experiences")}>
                Browse Experiences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4 text-yellow-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find your booking. It may still be processing.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/bookings")}>View My Bookings</Button>
              <Button variant="outline" onClick={() => router.push("/experiences")}>
                Browse Experiences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your booking. Your payment has been processed successfully.
            </p>
          </div>

          <div className="border-t border-b py-6 my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold text-lg mb-4">Booking Details</h2>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Booking ID:</dt>
                    <dd className="font-medium">{booking.id.substring(0, 8)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Date:</dt>
                    <dd className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Participants:</dt>
                    <dd className="font-medium">{booking.participants}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Amount:</dt>
                    <dd className="font-medium">${booking.total_price}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-4">Experience Details</h2>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={
                        booking.experience?.image_url ||
                        `/placeholder.svg?height=80&width=80&query=${booking.experience?.title}`
                      }
                      alt={booking.experience?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{booking.experience?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.experience?.city}, {booking.experience?.country}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{booking.experience?.duration} hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-6 text-muted-foreground">
              A confirmation email has been sent to your email address. You can also view your booking details in your
              account.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => router.push("/bookings")}>View My Bookings</Button>
              <Button variant="outline" onClick={() => router.push("/experiences")}>
                Browse More Experiences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
