"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Edit, Trash2, Eye, Plus } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Tour {
  id: string
  title: string
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

export function BusinessToursList() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .eq("business_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setTours(data || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load tours. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [supabase, toast])

  const deleteTour = async (tourId: string) => {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", tourId)

      if (error) throw error

      setTours((prev) => prev.filter((tour) => tour.id !== tourId))
      toast({
        title: "Tour deleted",
        description: "Tour has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete tour. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Tours</CardTitle>
          <CardDescription>You haven't created any tours yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tours found</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first tour to get started.</p>
            <Button asChild>
              <Link href="/business/dashboard/tours/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Tour
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Tours</h2>
          <p className="text-muted-foreground">Manage your tour listings</p>
        </div>
        <Button asChild>
          <Link href="/business/dashboard/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Tour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={tour.image_url || tour.images?.[0] || `/placeholder.svg?height=200&width=300&query=${tour.title}`}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">${tour.price}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{tour.title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {tour.city}, {tour.country}
                </p>
                <p className="capitalize">
                  {tour.category} • {tour.duration} hours
                </p>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>
                    {tour.rating} ({tour.reviews_count} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/experiences/${tour.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/business/dashboard/tours/${tour.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTour(tour.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
