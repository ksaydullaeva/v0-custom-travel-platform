"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  MapPin,
  Filter,
  PlaneTakeoff,
  Hotel,
  Ticket,
  Coffee,
  Plus,
  Star,
  ChevronRight,
  Menu,
  X,
  Heart,
  Calendar,
  Clock,
  Compass,
} from "lucide-react"
import MapComponent from "@/components/map-component"
import { useMobile } from "@/hooks/use-mobile"

// Mock data for demonstration
const mockLocations = [
  {
    id: 1,
    type: "attraction",
    name: "Eiffel Tower",
    location: "Paris, France",
    rating: 4.7,
    price: "€25",
    image: "/placeholder.svg?height=200&width=300",
    position: { lat: 48.8584, lng: 2.2945 },
    description: "Iconic iron tower offering city views",
  },
  {
    id: 2,
    type: "hotel",
    name: "Grand Hotel Paris",
    location: "Paris, France",
    rating: 4.5,
    price: "€180/night",
    image: "/placeholder.svg?height=200&width=300",
    position: { lat: 48.8606, lng: 2.3376 },
    description: "Luxury hotel in the heart of Paris",
  },
  {
    id: 3,
    type: "activity",
    name: "Seine River Cruise",
    location: "Paris, France",
    rating: 4.6,
    price: "€15",
    image: "/placeholder.svg?height=200&width=300",
    position: { lat: 48.8566, lng: 2.3522 },
    description: "Scenic boat tour along the Seine River",
  },
  {
    id: 4,
    type: "restaurant",
    name: "Le Petit Bistro",
    location: "Paris, France",
    rating: 4.8,
    price: "€€€",
    image: "/placeholder.svg?height=200&width=300",
    position: { lat: 48.8649, lng: 2.3401 },
    description: "Authentic French cuisine in a cozy setting",
  },
  {
    id: 5,
    type: "attraction",
    name: "Louvre Museum",
    location: "Paris, France",
    rating: 4.9,
    price: "€17",
    image: "/placeholder.svg?height=200&width=300",
    position: { lat: 48.8606, lng: 2.3376 },
    description: "World's largest art museum and historic monument",
  },
]

export default function ExplorePage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLocations, setFilteredLocations] = useState(mockLocations)
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }) // Paris
  const [mapZoom, setMapZoom] = useState(13)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const isMobile = useMobile()

  // Filter locations based on search query and active tab
  useEffect(() => {
    let filtered = mockLocations

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((location) => location.type === activeTab)
    }

    setFilteredLocations(filtered)
  }, [searchQuery, activeTab])

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setMapCenter(location.position)
    setMapZoom(15)
  }

  // Handle adding to itinerary
  const handleAddToItinerary = (location) => {
    // This would connect to your itinerary management system
    console.log(`Added ${location.name} to itinerary`)
    // Show success message or open itinerary drawer
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Compass className="h-6 w-6 text-primary" />
            <span>TravelExplorer</span>
          </Link>
          <div className="flex items-center ml-auto gap-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Sign In
            </Button>
            <Button size="sm" className="hidden md:flex">
              Sign Up
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-4 py-4">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Compass className="h-6 w-6 text-primary" />
                    <span>TravelExplorer</span>
                  </Link>
                  <div className="grid gap-2">
                    <Link href="/explore" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <MapPin className="h-5 w-5" />
                      Explore
                    </Link>
                    <Link href="/activities" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Ticket className="h-5 w-5" />
                      Activities
                    </Link>
                    <Link href="/hotels" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Hotel className="h-5 w-5" />
                      Hotels
                    </Link>
                    <Link href="/flights" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <PlaneTakeoff className="h-5 w-5" />
                      Flights
                    </Link>
                    <Link href="/itineraries" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Calendar className="h-5 w-5" />
                      My Itineraries
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar for search and results */}
        <div
          className={`w-full md:w-[400px] border-r flex flex-col ${isMobile && selectedLocation ? "hidden" : "flex"}`}
        >
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search locations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)}>
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="grid gap-4 py-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <div className="grid gap-2">
                      <h4 className="font-medium">Price Range</h4>
                      <Slider defaultValue={[0, 100]} max={100} step={1} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$1000+</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <h4 className="font-medium">Rating</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating-4" />
                        <Label htmlFor="rating-4" className="flex items-center">
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4" />
                          <span className="ml-1">& up</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating-3" />
                        <Label htmlFor="rating-3" className="flex items-center">
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <Star className="h-4 w-4" />
                          <Star className="h-4 w-4" />
                          <span className="ml-1">& up</span>
                        </Label>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <h4 className="font-medium">Amenities</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="wifi" />
                        <Label htmlFor="wifi">WiFi</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pool" />
                        <Label htmlFor="pool">Swimming Pool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="breakfast" />
                        <Label htmlFor="breakfast">Breakfast Included</Label>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button variant="outline">Reset</Button>
                      <Button>Apply Filters</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="attraction">Attractions</TabsTrigger>
                <TabsTrigger value="activity">Activities</TabsTrigger>
                <TabsTrigger value="hotel">Hotels</TabsTrigger>
                <TabsTrigger value="restaurant">Food</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 grid gap-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <Card
                    key={location.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedLocation?.id === location.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <img
                          src={location.image || "/placeholder.svg"}
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 capitalize">{location.type}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 bg-background/80 hover:bg-background/90 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Add to favorites logic
                          }}
                        >
                          <Heart className="h-4 w-4" />
                          <span className="sr-only">Add to favorites</span>
                        </Button>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{location.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                            <span className="text-sm">{location.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location.location}
                        </div>
                        <p className="text-sm mb-3">{location.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{location.price}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToItinerary(location)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Itinerary
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No results found. Try adjusting your search or filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Map and detail view */}
        <div className="flex-1 relative">
          <MapComponent
            center={mapCenter}
            zoom={mapZoom}
            markers={filteredLocations}
            onMarkerClick={handleLocationSelect}
            selectedMarker={selectedLocation}
          />

          {/* Mobile back button */}
          {isMobile && selectedLocation && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 left-4 z-10 bg-background rounded-full shadow-md"
              onClick={() => setSelectedLocation(null)}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="sr-only">Back to results</span>
            </Button>
          )}

          {/* Detail panel */}
          {selectedLocation && (
            <div
              className={`absolute ${isMobile ? "inset-0" : "bottom-0 right-0 w-1/3 max-h-[70%]"} bg-background shadow-lg rounded-t-lg overflow-hidden z-10`}
            >
              <div className="relative h-48">
                <img
                  src={selectedLocation.image || "/placeholder.svg"}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full"
                  onClick={() => setSelectedLocation(null)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
                <Badge className="absolute top-2 left-2 capitalize">{selectedLocation.type}</Badge>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{selectedLocation.name}</h2>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                    <span>{selectedLocation.rating}</span>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedLocation.location}
                </div>
                <p className="mb-4">{selectedLocation.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-lg">{selectedLocation.price}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Itinerary
                    </Button>
                  </div>
                </div>

                {/* Additional details would go here */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Open: 9AM - 6PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Available daily</span>
                  </div>
                </div>

                <Button className="w-full mt-6">View Details</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating action button for itinerary */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full shadow-lg z-20">
            <Calendar className="h-4 w-4 mr-2" />
            My Itinerary
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Current Itinerary</h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Day 1 - Paris Exploration</CardTitle>
                  <CardDescription>May 15, 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 bg-primary/10 p-1 rounded">
                        <Coffee className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid gap-0.5">
                        <div className="font-medium">Breakfast at Le Petit Bistro</div>
                        <div className="text-sm text-muted-foreground">8:00 AM - 9:30 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 bg-primary/10 p-1 rounded">
                        <Ticket className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid gap-0.5">
                        <div className="font-medium">Visit Eiffel Tower</div>
                        <div className="text-sm text-muted-foreground">10:00 AM - 12:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 bg-primary/10 p-1 rounded">
                        <Ticket className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid gap-0.5">
                        <div className="font-medium">Seine River Cruise</div>
                        <div className="text-sm text-muted-foreground">2:00 PM - 3:30 PM</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    View Day Details
                  </Button>
                </CardFooter>
              </Card>

              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add New Day
              </Button>

              <div className="flex justify-between mt-4">
                <Button variant="outline">Save Itinerary</Button>
                <Button>Get Directions</Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
