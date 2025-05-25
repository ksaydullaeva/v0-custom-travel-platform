import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, MapPin } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import type { Experience } from "@/lib/api/experiences"

interface ExperienceCardProps {
  experience: Experience
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { t } = useTranslation()

  return (
    <Link href={`/experiences/${experience.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <img
            src={experience.image_url || "/placeholder.svg"}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{experience.rating}</span>
            <span className="text-sm text-muted-foreground">({experience.reviews})</span>
          </div>
          <h3 className="font-semibold mb-1 line-clamp-2">{experience.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{experience.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>
              {experience.duration} {t("hours")}
            </span>
          </div>
          <div className="font-semibold">
            From ${experience.price} {t("per_person")}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
