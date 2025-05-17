"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Star, Heart, Share, ChevronLeft, Check, X, Info, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { featuredExperiences, allCategories } from "@/lib/data"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ExperienceCard from "@/components/experience-card"
import ReviewCard from "@/components/review-card"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/components/auth/auth-provider"

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [participants, setParticipants] = useState(2)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()

  // Find the experience by ID
  const experience = featuredExperiences.find((exp) => exp.id === params.id) || featuredExperiences[0]

  // Get related experiences (same category)
  const relatedExperiences = featuredExperiences
    .filter((exp) => exp.category === experience.category && exp.id !== experience.id)
    .slice(0, 4)

  // Get category name
  const categoryName = allCategories.find((cat) => cat.id === experience.category)?.name || ""

  // Available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    }
  })

  // Available times
  const availableTimes = ["09:00", "11:00", "13:00", "15:00", "17:00"]

  // Calculate total price
  const totalPrice = experience.price * participants

  // Handle booking
  const handleBookNow = () => {
    if (!user) {
      setShowLoginDialog(true)
    } else {
      // Proceed with booking
      console.log("Booking experience:", experience.id)
      // Here you would typically call an API to create the booking
    }
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push(`/login?redirect=/experiences/${params.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-slate-50 py-4 border-b">
        <div className="container">
          <Link href="/experiences" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Experiences
          </Link>
        </div>
      </div>

      {/* Experience Header */}
      <section className="py-8 bg-slate-50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  {categoryName}
                </Badge>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium">{experience.rating}</span>
                  <span className="text-muted-foreground ml-1">({experience.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{experience.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{experience.location}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Experience Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-8">
                <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                  <img
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=200&width=200&text=Image+${i}`}
                        alt={`Gallery image ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Tabs */}
              <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                  <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">About This Experience</h2>
                    <p className="mb-4">
                      {experience.description ||
                        "Join us for an unforgettable adventure in the heart of this amazing destination. This experience offers a unique opportunity to explore local culture, taste authentic cuisine, and create memories that will last a lifetime."}
                    </p>
                    <p className="mb-4">
                      Led by expert local guides, you'll discover hidden gems and iconic landmarks while learning about
                      the rich history and traditions of the area. Whether you're a first-time visitor or a seasoned
                      traveler, this experience provides insights and access you won't find anywhere else.
                    </p>

                    <h3 className="text-xl font-bold mt-6 mb-3">Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Exclusive access to iconic locations with expert local guides</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Small group sizes ensure a personalized experience</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Authentic cultural immersion with hands-on activities</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Memorable photo opportunities at scenic viewpoints</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="pt-6">
                  <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">Experience Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">What's Included</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                              <span>Professional guide</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                              <span>Transportation during the experience</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                              <span>All entrance fees</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                              <span>Bottled water</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">What's Not Included</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <span>Hotel pickup and drop-off</span>
                            </li>
                            <li className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <span>Gratuities</span>
                            </li>
                            <li className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <span>Food and drinks (unless specified)</span>
                            </li>
                            <li className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <span>Personal expenses</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <h3 className="text-xl font-bold mt-6 mb-3">Important Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Confirmation:</span>
                          <p className="text-muted-foreground">
                            You'll receive a confirmation email and voucher shortly after booking.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Accessibility:</span>
                          <p className="text-muted-foreground">
                            Not wheelchair accessible. Not recommended for travelers with back problems.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Cancellation Policy:</span>
                          <p className="text-muted-foreground">
                            Free cancellation up to 24 hours before the experience starts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Reviews</h2>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium text-lg">{experience.rating}</span>
                        <span className="text-muted-foreground ml-1">({experience.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <ReviewCard
                        name="Sarah Johnson"
                        date="March 15, 2024"
                        rating={5}
                        comment="This was the highlight of our trip! Our guide was knowledgeable and friendly, and the experience exceeded all expectations. Would highly recommend to anyone visiting the area."
                      />
                      <ReviewCard
                        name="Michael Chen"
                        date="March 10, 2024"
                        rating={4}
                        comment="Great experience overall. The guide was excellent and we learned so much about the local culture. The only reason for 4 stars instead of 5 is that it ran a bit longer than advertised."
                      />
                      <ReviewCard
                        name="Emma Wilson"
                        date="February 28, 2024"
                        rating={5}
                        comment="Absolutely fantastic! We had such an amazing time and saw things we never would have discovered on our own. Our guide went above and beyond to make sure everyone had a great experience."
                      />
                      <ReviewCard
                        name="David Rodriguez"
                        date="February 20, 2024"
                        rating={4}
                        comment="Very enjoyable experience with a knowledgeable guide. The pace was perfect and we never felt rushed. Would definitely book again on our next visit."
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Location */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
                  {/* This would be a real map in production */}
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-lg font-medium">{experience.location}</span>
                  </div>
                </div>
              </div>

              {/* Related Experiences */}
              <div>
                <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedExperiences.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold">${experience.price}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableDates.slice(0, 6).map((date) => (
                          <Button
                            key={date.value}
                            variant={selectedDate === date.value ? "default" : "outline"}
                            className="h-auto py-2 px-3 flex flex-col items-center justify-center"
                            onClick={() => setSelectedDate(date.value)}
                          >
                            <span className="text-xs">{date.label.split(" ")[0]}</span>
                            <span className="text-sm font-medium">
                              {date.label.split(" ")[1]} {date.label.split(" ")[2]}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Time</label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className="h-auto py-2"
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Participants */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Participants</label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setParticipants(Math.max(1, participants - 1))}
                          disabled={participants <= 1}
                        >
                          -
                        </Button>
                        <span className="mx-4 font-medium">{participants}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setParticipants(Math.min(10, participants + 1))}
                          disabled={participants >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>
                          ${experience.price} x {participants} participants
                        </span>
                        <span>${totalPrice}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedDate || !selectedTime}
                      onClick={handleBookNow}
                    >
                      {t("bookNow")}
                    </Button>

                    {/* Booking Policies */}
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Free cancellation up to 24 hours before</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Reserve now, pay later</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("loginToBook")}</DialogTitle>
            <DialogDescription>You need to be logged in to book this experience.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-12 w-12 text-blue-600" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoginRedirect}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
