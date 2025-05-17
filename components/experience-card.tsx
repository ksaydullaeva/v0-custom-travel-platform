"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Clock, Star } from "lucide-react"
import { allCategories } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

interface ExperienceCardProps {
  experience: {
    id: string
    title: string
    description?: string
    location: string
    price: number
    rating: number
    reviews: number
    duration: number
    image?: string
    category: string
  }
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { t } = useTranslation()

  // Get category name
  const categoryName = allCategories.find((cat) => cat.id === experience.category)?.name || ""

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md group">
      <div className="relative">
        <Link href={`/experiences/${experience.id}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={experience.image || "/placeholder.svg?height=300&width=400"}
              alt={experience.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">{t("save_wishlist")}</span>
        </Button>

        <Badge className="absolute top-2 left-2 bg-white/80 text-blue-600 hover:bg-white/90">{categoryName}</Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span>{experience.location}</span>
        </div>

        <Link href={`/experiences/${experience.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {experience.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-medium">{experience.rating}</span>
            <span className="text-muted-foreground ml-1">
              ({experience.reviews} {t("reviews")})
            </span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>
              {experience.duration} {t("hours")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-lg">${experience.price}</span>
            <span className="text-muted-foreground text-sm ml-1">{t("per_person")}</span>
          </div>
          <Link href={`/experiences/${experience.id}`}>
            <Button variant="outline" size="sm">
              {t("view_details")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
