"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Hotel, Coffee, Ticket, Car } from "lucide-react"

// This is a placeholder component that simulates a map
// In a real application, you would use Google Maps, Mapbox, or another mapping library
export default function MapComponent({
  center = { lat: 0, lng: 0 },
  zoom = 10,
  markers = [],
  onMarkerClick = () => {},
  selectedMarker = null,
}) {
  const mapRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Get icon based on marker type
  const getMarkerIcon = (type) => {
    switch (type) {
      case "hotel":
        return <Hotel className="h-5 w-5" />
      case "restaurant":
        return <Coffee className="h-5 w-5" />
      case "attraction":
        return <Ticket className="h-5 w-5" />
      case "transportation":
        return <Car className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  return (
    <div ref={mapRef} className="w-full h-full bg-muted/30 relative">
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-[#f8f9fa] overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e6e8eb" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Simulated markers */}
          {markers.map((marker) => {
            // Calculate position based on center and some offset
            const offsetX = (marker.position.lng - center.lng) * 100 + 50
            const offsetY = (marker.position.lat - center.lat) * -100 + 50

            const isSelected = selectedMarker && selectedMarker.id === marker.id

            return (
              <button
                key={marker.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${
                  isSelected ? "bg-primary text-white scale-125 z-10" : "bg-background text-primary hover:bg-primary/10"
                }`}
                style={{
                  left: `${offsetX}%`,
                  top: `${offsetY}%`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onClick={() => onMarkerClick(marker)}
              >
                {getMarkerIcon(marker.type)}
              </button>
            )
          })}

          {/* Map attribution */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Map data © TravelExplorer
          </div>
        </>
      )}
    </div>
  )
}
