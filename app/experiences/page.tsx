"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search, Loader2 } from "lucide-react"
import ExperienceCard from "@/components/experience-card"
import { useTranslation } from "@/lib/i18n"
import { useState as useHookState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DatePicker } from "@/components/simple-date-picker"
import { getExperiences, type Experience, type ExperienceFilters } from "@/lib/api/experiences"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


interface Category {
  id: string
  name: string
  slug: string
}

export default function ExperiencesPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortOption, setSortOption] = useState("popular")
  const [destinationFilter, setDestinationFilter] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useHookState(false)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [durationFilters, setDurationFilters] = useState<string[]>([])

  // Categories fetched from DB
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const supabase = (await import('@/lib/supabase/client')).getSupabaseClient()
        const { data, error } = await supabase.from('categories').select('id, name, slug').order('name')
        if (error) throw error
        setCategories(data as Category[])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    })()
  }, [])

  // Duration options for filter
  const durationOptions = [
    { id: "less-than-3", label: t("less_than_3") },
    { id: "3-to-6", label: t("three_to_six") },
    { id: "more-than-6", label: t("more_than_6") },
  ]

  // Extract search parameters once
  const searchValue = searchParams.get("search") || ""
  const dateValue = searchParams.get("date") || ""
  const categoryValue = searchParams.get("category") || ""
  const destinationValue = searchParams.get("destination") || ""

  // Initialize from URL parameters
  useEffect(() => {
    setSearchQuery(searchValue)
    setDateFilter(dateValue)
    setDestinationFilter(destinationValue)

    if (categoryValue) {
      setSelectedCategories([categoryValue])
    }
  }, [searchValue, dateValue, categoryValue, destinationValue])

  // Prepare filters for API call
  const prepareFilters = useCallback((): ExperienceFilters => {
    const filters: ExperienceFilters = {}

    if (searchQuery) {
      filters.search = searchQuery
    }

    if (destinationFilter) {
      // Try to match as city first, then as country
      filters.city = destinationFilter
    }

    if (selectedCategories.length > 0) {
      // Convert slug back to category name
      const category = categories.find(c => c.slug === selectedCategories[0])
      if (category) {
        filters.category = category.name
      }
    }

    // Only apply price range if it's different from default
    if (priceRange[0] !== 0 || priceRange[1] !== 500) {
      filters.minPrice = priceRange[0]
      filters.maxPrice = priceRange[1] === 500 ? undefined : priceRange[1]
    }

    // Handle duration filters
    if (durationFilters.length > 0) {
      durationFilters.forEach(filter => {
        switch (filter) {
          case "less-than-3":
            filters.maxDuration = 3
            break
          case "3-to-6":
            if (filters.minDuration === undefined || filters.minDuration < 3) {
              filters.minDuration = 3
            }
            if (filters.maxDuration === undefined || filters.maxDuration > 6) {
              filters.maxDuration = 6
            }
            break
          case "more-than-6":
            filters.minDuration = 6
            if (filters.maxDuration !== undefined && filters.maxDuration < 6) {
              delete filters.maxDuration
            }
            break
        }
      })
    }

    return filters
  }, [searchQuery, destinationFilter, selectedCategories, priceRange, durationFilters, categories])

  // Fetch experiences from API
  const fetchExperiences = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters = prepareFilters()
      let sortField = "rating"
      let sortDirection = "desc"

      // Map sort options to API parameters
      if (sortOption === "price-low") {
        sortField = "price"
        sortDirection = "asc"
      } else if (sortOption === "price-high") {
        sortField = "price"
        sortDirection = "desc"
      } else if (sortOption === "rating") {
        sortField = "rating"
        sortDirection = "desc"
      }

      const data = await getExperiences(filters, 20, 0, sortField, sortDirection)
      setExperiences(data)
    } catch (err) {
      console.error("Error fetching experiences:", err)
      setError("Failed to load experiences. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [prepareFilters, sortOption])

  // Fetch experiences when filters change
  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  const handleDurationChange = (duration: string, checked: boolean) => {
    if (checked) {
      setDurationFilters((prev) => [...prev, duration])
    } else {
      setDurationFilters((prev) => prev.filter((d) => d !== duration))
    }
  }

  const handleDateSelect = (dateRange: string) => {
    setDateFilter(dateRange)
    setIsDatePickerOpen(false)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 500])
    setDurationFilters([])
    setSearchQuery("")
    setDateFilter("")
    setDestinationFilter("")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {destinationFilter ? `${t("experiences")} ${t("experiences_in")} ${destinationFilter}` : t("experiences")}
      </h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder={t("search_placeholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:w-64 relative">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setIsDatePickerOpen(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateFilter ? dateFilter : t("choose_date")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <DatePicker onSelect={handleDateSelect} onClose={() => setIsDatePickerOpen(false)} />
            </PopoverContent>
          </Popover>
        </div>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("sort_by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{t("most_popular")}</SelectItem>
            <SelectItem value="price-low">{t("price_low_high")}</SelectItem>
            <SelectItem value="price-high">{t("price_high_low")}</SelectItem>
            <SelectItem value="rating">{t("highest_rated")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t("filters")}</h2>

              {/* Destination Filter - Only show if a destination is selected */}
              {destinationFilter && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">{t("destination")}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">{destinationFilter}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDestinationFilter("")}
                      className="h-8 px-2 text-xs"
                    >
                      {t("clear")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t("category")}</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.slug}`}
                        checked={selectedCategories.includes(category.slug)}
                        onCheckedChange={(checked) => handleCategoryChange(category.slug, checked === true)}
                      />
                      <Label htmlFor={`category-${category.slug}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t("price_range")}</h3>
                <Slider value={priceRange} min={0} max={500} step={10} onValueChange={setPriceRange} className="mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t("duration")}</h3>
                <div className="space-y-2">
                  {durationOptions.map((duration) => (
                    <div key={duration.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`duration-${duration.id}`}
                        checked={durationFilters.includes(duration.id)}
                        onCheckedChange={(checked) => handleDurationChange(duration.id, checked === true)}
                      />
                      <Label htmlFor={`duration-${duration.id}`}>{duration.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={clearAllFilters}>
                {t("clear_all_filters")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-muted-foreground">
              {destinationFilter
                ? `${t("showing")} ${experiences.length} ${t("experiences_in")} ${destinationFilter}`
                : `${t("showing")} ${experiences.length} ${t("experiences")}`}
            </p>
          </div>

          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">{t("loading")}...</span>
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">{t("no_experiences_found")}</h2>
              <p className="text-muted-foreground">{t("try_different_search")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
