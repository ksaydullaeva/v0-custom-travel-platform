import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface ReviewCardProps {
  name: string
  date: string
  rating: number
  comment: string
  avatar?: string
}

export default function ReviewCard({ name, date, rating, comment, avatar }: ReviewCardProps) {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="border-b pb-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          {avatar ? <img src={avatar || "/placeholder.svg"} alt={name} /> : <AvatarFallback>{initials}</AvatarFallback>}
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2">
            <h4 className="font-medium">{name}</h4>
            <div className="text-sm text-muted-foreground">{date}</div>
          </div>

          <div className="flex mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
              />
            ))}
          </div>

          <p className="text-muted-foreground">{comment}</p>
        </div>
      </div>
    </div>
  )
}
