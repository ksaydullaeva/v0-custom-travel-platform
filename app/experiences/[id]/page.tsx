"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Star, Loader2, AlertCircle, Users, Globe, CheckCircle, Heart } from "lucide-react"
import { getExperienceById } from "@/lib/api/experiences"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function ExperienceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [experience, setExperience] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadExperience() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getExperienceById(id as string)
        if (data) {
          setExperience(data)
          console.log("Fetched experience data:", data)
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

  // Check if experience is in user's wishlist
  useEffect(() => {
    async function checkWishlist() {
      if (!user || !id) return

      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("*")
          .eq("user_id", user.id)
          .eq("experience_id", id)
          .maybeSingle()

        if (error) {
          console.error("Error checking wishlist:", error)
          return
        }

        setIsInWishlist(!!data)
      } catch (error) {
        console.error("Error checking wishlist:", error)
      }
    }

    if (user) {
      checkWishlist()
    }
  }, [user, id, supabase])

  const handleBookNow = () => {
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
        // Remove from wishlist
        const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("experience_id", id)

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
        // Add to wishlist
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          experience_id: id,
          created_at: new Date().toISOString(),
        })

        if (error) {
          // If the error is a foreign key constraint, the wishlists table might not exist
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

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p className="text-lg">Loading experience details...</p>
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
      {/* Experience Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{experience.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {experience.city}, {experience.country}
              </span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span>
                {experience.rating} ({experience.reviews_count || 0} reviews)
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{experience.duration} hours</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex justify-end">
          <div className="text-right">
            <div className="text-3xl font-bold">${experience.price}</div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>
      </div>

      {/* Experience Image and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 relative">
          <div className="rounded-lg overflow-hidden">
            <img
              src={experience.image_url || `/placeholder.svg?height=600&width=800&query=${experience.title}`}
              alt={experience.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full h-10 w-10"
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
            <span className="sr-only">{isInWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
          </Button>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Experience Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                  <p className="capitalize">{experience.category}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Duration</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <p>{experience.duration} hours</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Group Size</h3>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <p>Up to 10 people</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Languages</h3>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    <p>English, Spanish</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Includes</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span>Professional guide</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span>Transportation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span>Entrance fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4">
            <Button className="w-full" onClick={handleBookNow}>
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Experience Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Experience</h2>
        <div className="prose max-w-none">
          <p>{experience.description}</p>
          <p className="mt-4">
            Immerse yourself in the rich history and culture of this destination. Our experienced guides will take you
            through historical landmarks, share fascinating stories, and provide insights that you won't find in
            guidebooks. This tour is perfect for history enthusiasts, photographers, and anyone looking to explore the
            authentic side of the region.
          </p>
          <p className="mt-4">
            The tour is designed to be accessible for all fitness levels and provides plenty of opportunities for photos
            and questions. We recommend comfortable walking shoes, a hat, and a water bottle.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary/5 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to book this experience?</h2>
        <p className="mb-4">Secure your spot now and create memories that will last a lifetime.</p>
        <Button size="lg" onClick={handleBookNow}>
          Book Now
        </Button>
      </div>
    </div>
  )
}
