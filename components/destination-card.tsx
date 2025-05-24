import Link from "next/link"
import type { Destination } from "@/lib/api/destinations"

interface DestinationCardProps {
  destination: Destination
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/experiences?city=${encodeURIComponent(destination.city)}`} className="block">
      <div className="rounded-lg overflow-hidden relative aspect-[4/5] group">
        <img
          src={destination.image_url || `/placeholder.svg?height=400&width=300&query=${destination.name}`}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h3 className="text-xl font-semibold">{destination.name}</h3>
            {destination.country && <p className="text-sm text-white/80">{destination.country}</p>}
          </div>
        </div>
      </div>
    </Link>
  )
}
