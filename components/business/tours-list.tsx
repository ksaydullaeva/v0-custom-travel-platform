"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Edit, Trash2, Eye } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Tour {
  id: string
  title: string
  price: number
  location: string
  category: string
  status: string
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
          .from("tours")
          .select("id, title, price, location, category, status, created_at")
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
              <Link href="/business/dashboard/tours/new">Create Your First Tour</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tours</CardTitle>
        <CardDescription>Manage your tour listings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Tour</th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Location</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="font-medium">{tour.title}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{tour.location}</div>
                  </td>
                  <td className="py-3 px-4">${tour.price.toFixed(2)}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{tour.location}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="capitalize">{tour.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={tour.status === "active" ? "default" : "secondary"}>
                      {tour.status === "active" ? "Active" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/experiences/${tour.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/business/dashboard/tours/${tour.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
