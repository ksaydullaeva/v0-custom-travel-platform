"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { format } from "date-fns"

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoading) {
      router.push("/login?redirect=/bookings")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadBookings() {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            experience:experience_id (*)
          `)
          .eq("user_id", user.id)
          .order("booking_date", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setBookings(data || [])
      } catch (err: any) {
        console.error("Error loading bookings:", err)
        setError(err.message || "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadBookings()
    }
  }, [user, supabase])

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return

    setIsCancelling(true)

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", cancelBookingId)
        .eq("user_id", user?.id) // Ensure the booking belongs to the user

      if (error) {
        throw new Error(error.message)
      }

      // Update the local state
      setBookings(
        bookings.map((booking) => (booking.id === cancelBookingId ? { ...booking, status: "cancelled" } : booking)),
      )

      // Close the dialog
      setCancelBookingId(null)
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      setError(err.message || "Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

  // Filter bookings by status and date
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.booking_date) >= new Date(),
  )

  const pastBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.booking_date) < new Date(),
  )

  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p className="text-lg">Loading your bookings...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  // Render booking card
  const renderBookingCard = (booking: any) => {
    const experience = booking.experience || {}
    const bookingDate = booking.booking_date ? new Date(booking.booking_date) : new Date()
    const formattedDate = format(bookingDate, "MMMM d, yyyy")
    const isPastBooking = bookingDate < new Date()
    const isCancelled = booking.status === "cancelled"

    return (
      <Card key={booking.id} className={isCancelled ? "opacity-70" : ""}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3">
              <div className="aspect-[4/3] relative">
                <img
                  src={experience.image_url || `/placeholder.svg?height=300&width=400&query=${experience.title}`}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
                {isCancelled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg py-1 px-3">
                      Cancelled
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 p-6">
              <div className="flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {experience.city}, {experience.country}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Date</div>
                      <div>{formattedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Participants</div>
                      <div>{booking.participants}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div>{experience.duration} hours</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Total Price</div>
                    <div className="font-bold">${booking.total_price}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  {booking.payment_status === "pending" && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mb-2">
                      Payment Pending
                    </Badge>
                  )}
                  {booking.payment_status === "paid" && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 mb-2">
                      Paid
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 border-t">
          <Button variant="outline" asChild>
            <a href={`/experiences/${experience.id}`}>View Experience</a>
          </Button>
          {!isPastBooking && !isCancelled && (
            <Button variant="destructive" onClick={() => setCancelBookingId(booking.id)}>
              Cancel Booking
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Empty state
  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">No bookings found</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button asChild>
        <a href="/experiences">Browse Experiences</a>
      </Button>
    </div>
  )

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            {pastBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pastBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            {cancelledBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {cancelledBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingBookings.length > 0
            ? upcomingBookings.map(renderBookingCard)
            : renderEmptyState(
                "You don't have any upcoming bookings. Browse our experiences and book your next adventure!",
              )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastBookings.length > 0
            ? pastBookings.map(renderBookingCard)
            : renderEmptyState("You don't have any past bookings yet.")}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-6">
          {cancelledBookings.length > 0
            ? cancelledBookings.map(renderBookingCard)
            : renderEmptyState("You don't have any cancelled bookings.")}
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <Dialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBookingId(null)} disabled={isCancelling}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
