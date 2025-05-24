"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, Star, Clock, Users, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { featuredExperiences, topDestinations } from "@/lib/data"
import ExperienceCard from "@/components/experience-card"
import DestinationCard from "@/components/destination-card"
import { useTranslation } from "@/lib/i18n"
import { DatePicker } from "@/components/simple-date-picker"

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateQuery, setDateQuery] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [datePickerRef])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build the query parameters
    const params = new URLSearchParams()
    if (searchQuery) {
      params.append("search", searchQuery)
    }
    if (dateQuery) {
      params.append("date", dateQuery)
    }

    // Navigate to experiences page with search parameters
    router.push(`/experiences?${params.toString()}`)
  }

  const handleDateSelect = (dateRange: string) => {
    setDateQuery(dateRange)
    setIsDatePickerOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        {/* Hero Background - only image */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/mountain-lake-sunset-panorama.png')] bg-cover bg-center"></div>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>

        <div className="container relative z-10 py-20 md:py-32 text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-10 text-center">{t("discover_travel")}</h1>

            {/* Search Bar matching the new screenshot */}
            <div className="bg-white p-2 rounded-full flex items-center gap-2 shadow-lg max-w-4xl mx-auto">
              <div className="flex-1 pl-6 border-r border-gray-200">
                <div className="text-sm font-medium text-gray-800">Where to?</div>
                <input
                  placeholder="Search for a place or activity"
                  className="w-full border-none focus:outline-none text-gray-600 placeholder:text-gray-400 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 pl-6 relative" ref={datePickerRef}>
                <div className="text-sm font-medium text-gray-800">When</div>
                <input
                  placeholder="Select Dates"
                  className="w-full border-none focus:outline-none text-gray-600 placeholder:text-gray-400 bg-transparent cursor-pointer"
                  readOnly
                  value={dateQuery}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsDatePickerOpen(!isDatePickerOpen)
                  }}
                />
                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <DatePicker onSelect={handleDateSelect} onClose={() => setIsDatePickerOpen(false)} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full flex items-center justify-center"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page remains the same */}
      {/* Featured Experiences */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t("featured_experiences")}</h2>
              <p className="text-muted-foreground mt-2">{t("handpicked_activities")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExperiences.slice(0, 4).map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/experiences">
              <Button size="lg">
                {t("see_more_experiences")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">{t("where_to_next")}</h2>

          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {topDestinations.map((destination) => (
                <div key={destination.id} className="min-w-[240px] w-[240px] flex-shrink-0">
                  <DestinationCard destination={destination} />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hidden md:flex items-center justify-center"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t("why_choose_us")}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t("we_curate")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("curated_experiences")}</h3>
                <p className="text-muted-foreground">{t("curated_description")}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("local_experts")}</h3>
                <p className="text-muted-foreground">{t("local_experts_description")}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("flexible_booking")}</h3>
                <p className="text-muted-foreground">{t("flexible_booking_description")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('/travel-collage-adventure.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ready_adventure")}</h2>
            <p className="text-xl text-white/90 mb-8">{t("join_travelers")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/experiences">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                  {t("explore_experiences")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  {t("create_account")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
