"use client"

import { useState } from "react"

interface Agency {
  id: string
  name: string
  logo: string
  website: string
}

interface AgencyLogosProps {
  agencies: Agency[]
}

export function AgencyLogos({ agencies }: AgencyLogosProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = (agencyId: string) => {
    setFailedImages(prev => new Set(prev).add(agencyId))
  }

  return (
    <div className="flex flex-wrap justify-center gap-8 items-center">
      {agencies.map((agency) => (
        <div key={agency.id} className="flex flex-col items-center">
          {!failedImages.has(agency.id) ? (
            <img
              src={agency.logo}
              alt={`${agency.name} logo`}
              className="h-22 w-44 object-contain rounded"
              onError={() => handleImageError(agency.id)}
            />
          ) : (
            <div className="bg-muted/50 h-22 w-44 rounded flex items-center justify-center">
              <span className="text-muted-foreground text-sm text-center px-2">{agency.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 