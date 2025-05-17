"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import ExperienceCard from "@/components/experience-card"
import { featuredExperiences } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"

export default function ExperiencesPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState(featuredExperiences)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Initialize search and date from URL parameters
  useEffect(() => {
    const search = searchParams.get("search") || ""
    const date = searchParams.get("date") || ""

    setSearchQuery(search)
    setDateFilter(date)

    // Apply filters from URL parameters
    if (search || date) {
      filterExperiences(search, date)
    }
  }, [searchParams])

  const filterExperiences = (search: string, date: string) => {
    let filtered = [...featuredExperiences]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchLower) ||
          exp.location.toLowerCase().includes(searchLower) ||
          exp.description.toLowerCase().includes(searchLower),
      )
    }

    if (date) {
      // In a real app, you would filter by date availability
      // For now, we'll just simulate this with a simple filter
      const dateObj = new Date(date)
      const day = dateObj.getDay() // 0-6 (Sunday-Saturday)

      // Filter experiences that are available on this day of week
      // This is just a simulation - in a real app you'd check actual availability
      filtered = filtered.filter((exp) => exp.id % 7 !== day)
    }

    setExperiences(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterExperiences(searchQuery, dateFilter)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("experiences")}</h1>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={t("search_experiences")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              {t("filter")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">{t("no_experiences_found")}</h2>
          <p className="text-muted-foreground">{t("try_different_search")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </div>
  )
}
