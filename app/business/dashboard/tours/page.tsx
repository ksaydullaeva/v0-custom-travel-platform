"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessToursList } from "@/components/business/tours-list"

// Define a type for your tour data (adjust based on your 'experiences' table schema)
interface Tour {
  id: string
  title: string
  description: string | null
  price: number
  location: string
  city: string
  country: string
  category: string
  image_url: string | null
  images: string[]
  duration: number
  rating: number
  reviews_count: number
  created_at: string
}

export default function BusinessToursPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tours, setTours] = useState<Tour[] | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const { t } = useTranslation()

  const fetchTours = useCallback(async () => {
    console.log("fetching tours")
    setIsLoading(true)
    try {
      // Check if user is authenticated and is a business
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.log("No user found, redirecting to login")
        router.push("/business/login")
        return
      }

      // Fetch experiences belonging to the current business user
      const { data: toursData, error: toursError } = await supabase
        .from('experiences') // Assuming your tours are in the 'experiences' table
        .select('id, title, description, price, location, city, country, category, image_url, images, duration, rating, reviews_count, created_at') // Select all necessary fields
        .eq('business_id', user.id) // Filter by the current business user's ID
        .order('created_at', { ascending: false })

      if (toursError) {
        throw toursError
      }

      setTours(toursData as Tour[]) // Cast data to Tour[]

    } catch (error: any) {
      console.error("Error fetching tours:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load tours.",
        variant: "destructive",
      })
    } finally {
      console.log("set loading false")
      setIsLoading(false)
    }
  }, [router, supabase, toast])

  useEffect(() => {
    // Fetch tours when the component mounts
    fetchTours()

  }, [fetchTours])

  const deleteTour = async (tourId: string) => {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", tourId)

      if (error) throw error

      toast({
        title: "Tour deleted",
        description: "Tour has been successfully deleted.",
      })
      fetchTours()

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete tour. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddTourClick = () => {
    router.push("/business/dashboard/tours/new") // Assuming a page for adding new tours
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("your_tours")}</h1>
            <p className="text-muted-foreground">{t("manage_your_tour_listings")}</p>
          </div>
          <Button onClick={handleAddTourClick}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_new_tour")}
          </Button>
        </div>

        {/* Tour Listing Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_tours")}</CardTitle>
          </CardHeader>
          <CardContent>
             {tours && tours.length > 0 ? (
                <BusinessToursList tours={tours} onDeleteTour={deleteTour} />
             ) : (
               <div className="flex flex-col items-center justify-center py-8">
                 <h2 className="text-xl font-semibold mb-2">{t("no_tours_yet")}</h2>
                 <p className="text-muted-foreground">{t("tours_will_appear_here")}</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Future Sections for adding forms, editing, etc. */}

      </div>
    </div>
  )
} 