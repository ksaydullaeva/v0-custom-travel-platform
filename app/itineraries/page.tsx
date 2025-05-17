"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  CalendarIcon,
  Compass,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Share,
  Trash2,
  Menu,
  ChevronRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Mock data for demonstration
const mockItineraries = [
  {
    id: 1,
    title: "Paris Adventure",
    description: "Exploring the City of Lights",
    startDate: "2024-05-15",
    endDate: "2024-05-20",
    location: "Paris, France",
    image: "/placeholder.svg?height=200&width=300",
    days: 6,
    places: 12,
  },
  {
    id: 2,
    title: "Tokyo Exploration",
    description: "Discovering Japan's capital",
    startDate: "2024-07-10",
    endDate: "2024-07-18",
    location: "Tokyo, Japan",
    image: "/placeholder.svg?height=200&width=300",
    days: 9,
    places: 15,
  },
  {
    id: 3,
    title: "New York Weekend",
    description: "Quick trip to the Big Apple",
    startDate: "2024-06-05",
    endDate: "2024-06-07",
    location: "New York, USA",
    image: "/placeholder.svg?height=200&width=300",
    days: 3,
    places: 8,
  },
]

export default function ItinerariesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/itineraries")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="container py-10">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Compass className="h-6 w-6 text-primary" />
            <span>TravelExplorer</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-10">
            <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/activities" className="text-sm font-medium hover:text-primary transition-colors">
              Activities
            </Link>
            <Link href="/hotels" className="text-sm font-medium hover:text-primary transition-colors">
              Hotels
            </Link>
            <Link href="/flights" className="text-sm font-medium hover:text-primary transition-colors">
              Flights
            </Link>
            <Link href="/itineraries" className="text-sm font-medium text-primary">
              My Itineraries
            </Link>
          </nav>
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
                      <Compass className="h-5 w-5" />
                      Activities
                    </Link>
                    <Link href="/hotels" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Compass className="h-5 w-5" />
                      Hotels
                    </Link>
                    <Link href="/flights" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Compass className="h-5 w-5" />
                      Flights
                    </Link>
                    <Link href="/itineraries" className="flex items-center gap-2 p-2 rounded-md bg-muted">
                      <CalendarIcon className="h-5 w-5" />
                      My Itineraries
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Itineraries</h1>
            <p className="text-muted-foreground">Manage and organize your travel plans</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Itinerary</DialogTitle>
                <DialogDescription>Enter the details for your new travel itinerary.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Itinerary Title</Label>
                  <Input id="title" placeholder="e.g., Summer Vacation in Italy" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Brief description of your trip" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Destination</Label>
                  <Input id="location" placeholder="e.g., Rome, Italy" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Itinerary</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockItineraries.map((itinerary) => (
                <Card key={itinerary.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={itinerary.image || "/placeholder.svg"}
                      alt={itinerary.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/80 hover:bg-background/90 rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{itinerary.title}</CardTitle>
                    <CardDescription>{itinerary.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {itinerary.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                      {new Date(itinerary.endDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{itinerary.days}</span> days
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{itinerary.places}</span> places
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/itineraries/${itinerary.id}`}>
                        View
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No past itineraries</h3>
              <p className="text-muted-foreground mt-2">You don't have any completed trips yet.</p>
            </div>
          </TabsContent>
          <TabsContent value="drafts" className="mt-6">
            <div className="text-center py-12">
              <Edit className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No draft itineraries</h3>
              <p className="text-muted-foreground mt-2">You don't have any itineraries in progress.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create New Itinerary
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
