import Link from "next/link"

interface DestinationCardProps {
  destination: {
    id: string | number
    name: string
    image: string
    country?: string
  }
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  // Use the destination name for filtering if country is not available
  const filterValue = destination.country || destination.name

  return (
    <Link href={`/experiences?location=${encodeURIComponent(filterValue)}`} className="block">
      <div className="rounded-lg overflow-hidden relative aspect-[4/5] group">
        <img
          src={destination.image || "/placeholder.svg"}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-xl p-4">{destination.name}</h3>
        </div>
      </div>
    </Link>
  )
}
