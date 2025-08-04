"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Globe, 
  CheckCircle, 
  Heart, 
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Info,
  Route,
  MessageCircle,
  Minus
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface ExperienceItinerary {
  day: number
  title: string
  description: string
  duration: string
}

interface ExperienceFAQ {
  question: string
  answer: string
}

interface ExperienceReview {
  id: string
  user_name: string
  rating: number
  comment: string
  date: string
}

export interface ExperienceDetailProps {
  id: string
  title: string
  description: string
  price: number
  duration: number
  city: string
  country: string
  category: string
  rating: number
  reviews_count: number
  image_url: string
  languages?: string
  number_participants?: number
  includes?: string[]
  excludes?: string[]
  itinerary?: ExperienceItinerary[]
  faq?: ExperienceFAQ[]
  reviews?: ExperienceReview[]
  onBookNow?: () => void
  showBackButton?: boolean
  onBack?: () => void
}

export default function ExperienceDetail({
  id,
  title,
  description,
  price,
  duration,
  city,
  country,
  category,
  rating,
  reviews_count,
  image_url,
  languages = "English",
  number_participants = 10,
  includes = [
    "Professional guide",
    "Transportation",
    "Entrance fees",
    "Lunch",
    "Equipment rental"
  ],
  excludes = [
    "Personal expenses",
    "Tips",
    "Travel insurance"
  ],
  itinerary = [
    {
      day: 1,
      title: "Arrival & Orientation",
      description: "Meet your guide and get briefed on the day's activities",
      duration: "1 hour"
    },
    {
      day: 2,
      title: "Main Experience",
      description: "Enjoy the main activity with professional guidance",
      duration: "4 hours"
    },
    {
      day: 3,
      title: "Wrap-up & Departure",
      description: "Conclude the experience and say farewell",
      duration: "1 hour"
    }
  ],
  faq = [
    {
      question: "What should I bring?",
      answer: "Comfortable clothing, walking shoes, water bottle, and camera."
    },
    {
      question: "Is transportation included?",
      answer: "Yes, all transportation during the experience is included."
    },
    {
      question: "What if it rains?",
      answer: "We have alternative indoor activities planned for rainy days."
    }
  ],
  reviews = [
    {
      id: "1",
      user_name: "Sarah M.",
      rating: 5,
      comment: "Amazing experience! The guide was knowledgeable and friendly.",
      date: "2024-01-15"
    },
    {
      id: "2",
      user_name: "John D.",
      rating: 4,
      comment: "Great value for money. Highly recommend!",
      date: "2024-01-10"
    }
  ],
  onBookNow,
  showBackButton = true,
  onBack
}: ExperienceDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileSections, setMobileSections] = useState({
    details: false,
    booking: false
  })
  const supabase = getSupabaseClient()

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow()
      return
    }
    
    if (!user) {
      router.push(`/login?redirect=/experiences/${id}/book`)
      return
    }
    router.push(`/experiences/${id}/book`)
  }

  const toggleWishlist = async () => {
    if (!user) {
      router.push(`/login?redirect=/experiences/${id}`)
      return
    }

    setIsWishlistLoading(true)

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("experience_id", id)

        if (error) {
          console.error("Delete error:", error)
          throw new Error(`Failed to remove from wishlist: ${error.message}`)
        }

        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: "Experience has been removed from your wishlist",
        })
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          experience_id: id,
          created_at: new Date().toISOString(),
        })

        if (error) {
          if (error.code === "23503") {
            throw new Error("The wishlist system is not set up properly. Please run the setup SQL script.")
          } else if (error.code === "42P01") {
            throw new Error("The wishlist table doesn't exist. Please run the setup SQL script.")
          } else {
            throw new Error(`Failed to add to wishlist: ${error.message}`)
          }
        }

        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: "Experience has been added to your wishlist",
        })
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const toggleMobileSection = (section: 'details' | 'booking') => {
    setMobileSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ))
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 lg:h-[500px]">
        <img
          src={image_url || `/placeholder.svg?height=600&width=800&query=${title}`}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Wishlist Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full h-12 w-12"
          onClick={toggleWishlist}
          disabled={isWishlistLoading}
        >
          <Heart className={`h-6 w-6 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          <span className="sr-only">{isInWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
        </Button>

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full h-12 w-12"
            onClick={handleBack}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Go back</span>
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Basic Info */}
            <div className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{city}, {country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      {renderStars(rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating} ({reviews_count} reviews)
                      </span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Quick Info - Collapsible */}
            <div className="lg:hidden mb-6">
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleMobileSection('details')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Info</CardTitle>
                    {mobileSections.details ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
                {mobileSections.details && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{duration} hours</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Group Size</p>
                          <p className="font-medium">Up to {number_participants}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Language</p>
                          <p className="font-medium">{languages}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-medium">${price}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="includes" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Includes</span>
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline">Itinerary</span>
                </TabsTrigger>
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">FAQ</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">About This Experience</h3>
                    <p className="text-gray-700 leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="includes" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {includes.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-600" />
                        What's Not Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {excludes.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Minus className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Experience Itinerary</h3>
                    <div className="space-y-6">
                      {itinerary.map((day, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{day.title}</h4>
                            <p className="text-gray-700 mb-2">{day.description}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {day.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                      {faq.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <h4 className="font-semibold text-lg mb-2">{item.question}</h4>
                          <p className="text-gray-700">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Customer Reviews</h3>
                      <div className="flex items-center gap-2">
                        {renderStars(rating)}
                        <span className="text-lg font-semibold">{rating}</span>
                        <span className="text-gray-600">({reviews_count} reviews)</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.user_name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">{review.rating}/5</span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Desktop Quick Info */}
              <div className="hidden lg:block mb-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{duration} hours</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Group Size</p>
                          <p className="font-medium">Up to {number_participants} people</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Language</p>
                          <p className="font-medium">{languages}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-1">${price}</div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookNow}
                    >
                      Book Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={toggleWishlist}
                      disabled={isWishlistLoading}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </Button>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Free cancellation</span>
                      <span className="font-medium">24h before</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instant confirmation</span>
                      <span className="font-medium">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mobile ticket</span>
                      <span className="font-medium">✓</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Booking Summary - Collapsible */}
              <div className="lg:hidden">
                <Card>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleMobileSection('booking')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Booking Summary</CardTitle>
                      {mobileSections.booking ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                  {mobileSections.booking && (
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-primary mb-1">${price}</div>
                        <div className="text-sm text-gray-600">per person</div>
                      </div>
                      
                      <div className="space-y-4">
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleBookNow}
                        >
                          Book Now
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={toggleWishlist}
                          disabled={isWishlistLoading}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        </Button>
                      </div>

                      <Separator className="my-4" />
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span>Free cancellation</span>
                          <span className="font-medium">24h before</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instant confirmation</span>
                          <span className="font-medium">✓</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mobile ticket</span>
                          <span className="font-medium">✓</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 