"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, MapPin, Users, Loader2, AlertCircle, Timer, CreditCard, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getExperienceById } from "@/lib/api/experiences"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export default function BookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [experience, setExperience] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [participants, setParticipants] = useState(1)
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = getSupabaseClient()

  // Credit card form state
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/experiences/${id}/book`)
    }
  }, [user, router, id])

  useEffect(() => {
    async function loadExperience() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getExperienceById(id as string)
        if (data) {
          setExperience(data)
        } else {
          setError("Experience not found")
        }
      } catch (err) {
        console.error("Error loading experience:", err)
        setError("Failed to load experience details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadExperience()
    }
  }, [id])

  useEffect(() => {
    if (user) {
      setContactEmail(user.email || "")
    }
  }, [user])

  // Start the 10-minute timer when the page loads
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Format the time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Redirect if timer expires
  useEffect(() => {
    if (timeLeft === 0) {
      router.push(`/experiences/${id}?expired=true`)
    }
  }, [timeLeft, router, id])

  const calculateTotalPrice = () => {
    if (!experience) return 0
    return experience.price * participants
  }

  const handleNextStep = () => {
    if (!selectedDate) {
      setBookingError("Please select a date")
      return
    }
    if (!contactEmail || !contactPhone) {
      setBookingError("Please provide contact information")
      return
    }
    setActiveTab("payment")
    setBookingError(null)
  }

  const handleProceedWithPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setBookingError("Please fill in all payment details")
      return
    }

    setIsSubmitting(true)
    setBookingError(null)

    try {
      // In a real app, you would process payment with Stripe here
      // For now, we'll just create a booking record

      // COMMENTING OUT BOOKING CREATION AND PAYMENT LOGIC
      // const { data, error } = await supabase
      //   .from("bookings")
      //   .insert({
      //     user_id: user?.id,
      //     experience_id: id,
      //     booking_date: selectedDate?.toISOString(),
      //     participants: participants,
      //     total_price: calculateTotalPrice(),
      //     status: "confirmed",
      //     contact_email: contactEmail,
      //     contact_phone: contactPhone,
      //     special_requests: specialRequests || null,
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //     payment_status: "pending", // This would be "paid" in a real implementation
      //   })
      //   .select()

      // if (error) {
      //   throw new Error(error.message)
      // }

      // Placeholder message instead of proceeding with payment/booking
      setBookingError("Payment processing is currently disabled.")

      // Clear the timer (optional, depends on desired behavior when disabled)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Optional: Redirect to a different page or stay on the current one
      // router.push(`/bookings?success=true`) // Remove or comment out actual redirect

    } catch (err: any) {
      console.error("Error processing payment/booking:", err) // Update log message
      setBookingError(err.message || "Failed to process payment/booking") // Update error message
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p className="text-lg">Loading booking details...</p>
      </div>
    )
  }

  if (error || !experience) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Experience not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/experiences")}>Back to Experiences</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push(`/experiences/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Experience
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Book Your Experience</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-1 text-yellow-600" />
              <span className="text-yellow-600 font-medium">
                Your booking is reserved for {formatTimeLeft()} minutes
              </span>
            </div>
          </div>

          {bookingError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{bookingError}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Booking Details</TabsTrigger>
              <TabsTrigger value="payment" disabled={!selectedDate || !contactEmail || !contactPhone}>
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Participants</label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setParticipants(Math.max(1, participants - 1))}
                        disabled={participants <= 1}
                      >
                        -
                      </Button>
                      <div className="w-12 text-center">{participants}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setParticipants(Math.min(10, participants + 1))}
                        disabled={participants >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Email</label>
                        <Input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                        <Input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Special Requests (Optional)</label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Any dietary requirements, accessibility needs, or other requests"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleNextStep} className="ml-auto">
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name on Card</label>
                    <Input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <Input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date</label>
                      <Input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVC</label>
                      <Input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Price per person</span>
                      <span>${experience.price}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Participants</span>
                      <span>x {participants}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("details")}>
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedWithPayment}
                    disabled={isSubmitting || !cardName || !cardNumber || !cardExpiry || !cardCvc}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed with Payment
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden">
                <img
                  src={experience.image_url || `/placeholder.svg?height=300&width=500&query=${experience.title}`}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-lg font-bold">{experience.title}</h3>

              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>
                  {experience.city}, {experience.country}
                </span>
              </div>

              {selectedDate && (
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                  <span>{format(selectedDate, "MMMM d, yyyy")}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>{experience.duration} hours</span>
              </div>

              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>
                  {participants} {participants === 1 ? "person" : "people"}
                </span>
              </div>

              <Separator />

              <div className="pt-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Price per person</span>
                  <span>${experience.price}</span>
                </div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Participants</span>
                  <span>x {participants}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
