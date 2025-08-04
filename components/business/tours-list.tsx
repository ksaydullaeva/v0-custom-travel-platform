"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Edit, Trash2, Eye } from "lucide-react"

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
  status: string
}

interface BusinessToursListProps {
    tours: Tour[];
    onDeleteTour: (tourId: string) => void;
}

export function BusinessToursList({ tours, onDeleteTour }: BusinessToursListProps) {
  if (!tours || tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tours found</p>
        <p className="text-sm text-muted-foreground mb-4">Create your first tour to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                    onClick={() => onDeleteTour(tour.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  {tour.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
