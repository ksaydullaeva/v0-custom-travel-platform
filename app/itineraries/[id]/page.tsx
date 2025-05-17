"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  Compass,
  Download,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Share,
  Trash2,
  Menu,
  Coffee,
  Ticket,
  Hotel,
  Car,
  PlaneTakeoff,
  ArrowRight,
  FlipVerticalIcon as DragVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import MapComponent from "@/components/map-component"

// Mock data for demonstration
const mockItinerary = {
  id: 1,
  title: "Paris Adventure",
  description: "Exploring the City of Lights",
  startDate: "2024-05-15",
  endDate: "2024-05-20",
  location: "Paris, France",
  image: "/placeholder.svg?height=400&width=800",
  days: [
    {
      id: 1,
      date: "2024-05-15",
      title: "Arrival & City Introduction",
      activities: [
        {
          id: 1,
          type: "transportation",
          title: "Flight to Paris",
          time: "08:00 - 10:30",
          location: "Charles de Gaulle Airport",
          notes: "Terminal 2E, Air France",
          icon: PlaneTakeoff,
        },
        {
          id: 2,
          type: "transportation",
          title: "Airport Transfer",
          time: "11:00 - 12:00",
          location: "CDG to Hotel",
          notes: "Pre-booked shuttle service",
          icon: Car,
        },
        {
          id: 3,
          type: "accommodation",
          title: "Check-in at Grand Hotel Paris",
          time: "14:00",
          location: "123 Champs-Élysées",
          notes: "Reservation #12345",
          icon: Hotel,
        },
        {
          id: 4,
          type: "food",
          title: "Dinner at Le Petit Bistro",
          time: "19:00 - 21:00",
          location: "45 Rue de Rivoli",
          notes: "Reservation for 2 people",
          icon: Coffee,
        },
      ],
    },
    {
      id: 2,
      date: "2024-05-16",
      title: "Iconic Landmarks Day",
      activities: [
        {
          id: 5,
          type: "food",
          title: "Breakfast at Hotel",
          time: "08:00 - 09:00",
          location: "Grand Hotel Paris",
          notes: "Included with stay",
          icon: Coffee,
        },
        {
          id: 6,
          type: "attraction",
          title: "Visit Eiffel Tower",
          time: "10:00 - 12:30",
          location: "Champ de Mars",
          notes: "Pre-booked tickets for observation deck",
          icon: Ticket,
        },
        {
          id: 7,
          type: "food",
          title: "Lunch at Café de Paris",
          time: "13:00 - 14:30",
          location: "10 Avenue de la Grande Armée",
          notes: "Famous for their croque monsieur",
          icon: Coffee,
        },
        {
          id: 8,
          type: "attraction",
          title: "Seine River Cruise",
          time: "15:30 - 17:00",
          location: "Pont de l'Alma",
          notes: "1-hour sightseeing cruise",
          icon: Ticket,
        },
        {
          id: 9,
          type: "food",
          title: "Dinner at La Maison",
          time: "19:30 - 21:30",
          location: "22 Rue Saint-Antoine",
          notes: "Traditional French cuisine",
          icon: Coffee,
        },
      ],
    },
    {
      id: 3,
      date: "2024-05-17",
      title: "Museums & Culture",
      activities: [
        {
          id: 10,
          type: "food",
          title: "Breakfast at Local Bakery",
          time: "08:30 - 09:30",
          location: "Boulangerie Parisienne",
          notes: "Try the pain au chocolat",
          icon: Coffee,
        },
        {
          id: 11,
          type: "attraction",
          title: "Louvre Museum",
          time: "10:00 - 14:00",
          location: "Rue de Rivoli",
          notes: "Skip-the-line tickets, see Mona Lisa",
          icon: Ticket,
        },
      ],
    },
  ],
}

export default function ItineraryDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState("itinerary")
  const [selectedDay, setSelectedDay] = useState(mockItinerary.days[0])

  // This would normally fetch the itinerary based on the ID
  const itinerary = mockItinerary

  // Calculate map markers from activities
  const mapMarkers = itinerary.days.flatMap((day) =>
    day.activities.map((activity) => ({
      id: activity.id,
      name: activity.title,
      position: { lat: 48.85 + Math.random() * 0.03, lng: 2.35 + Math.random() * 0.03 }, // Mock positions
      type: activity.type,
    })),
  )

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
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/itineraries">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Itineraries
            </Link>
          </Button>
        </div>

        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <img
            src={itinerary.image || "/placeholder.svg"}
            alt={itinerary.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-3xl font-bold text-white">{itinerary.title}</h1>
            <p className="text-white/80">{itinerary.description}</p>
            <div className="flex items-center text-white/80 mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              {itinerary.location}
              <span className="mx-2">•</span>
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" variant="secondary" className="gap-1">
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" variant="secondary" className="gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Itinerary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="itinerary" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="directions">Directions</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="mt-6">
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              {/* Days sidebar */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-medium">Trip Days</h3>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-2">
                    {itinerary.days.map((day) => (
                      <button
                        key={day.id}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedDay.id === day.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedDay(day)}
                      >
                        <div className="font-medium">{day.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{day.activities.length} activities</div>
                      </button>
                    ))}
                    <Button variant="ghost" className="w-full justify-start mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Day
                    </Button>
                  </div>
                </ScrollArea>
              </div>

              {/* Day details */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{selectedDay.title}</CardTitle>
                    <CardDescription>
                      {new Date(selectedDay.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Activity</DialogTitle>
                        <DialogDescription>Add a new activity to your itinerary for this day.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="activity-title">Activity Title</Label>
                          <Input id="activity-title" placeholder="e.g., Visit Eiffel Tower" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="activity-type">Activity Type</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="attraction">Attraction</option>
                            <option value="food">Food & Dining</option>
                            <option value="transportation">Transportation</option>
                            <option value="accommodation">Accommodation</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input id="start-time" type="time" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input id="end-time" type="time" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" placeholder="e.g., Champ de Mars, 5 Avenue Anatole" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea id="notes" placeholder="Any additional information or reminders" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Activity</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l-2 border-muted">
                    {selectedDay.activities.map((activity, index) => (
                      <div key={activity.id} className="mb-6 relative">
                        <div className="absolute -left-[25px] p-1 rounded-full bg-background border-2 border-muted">
                          <activity.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.time}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {activity.location}
                            </div>
                            {activity.notes && (
                              <div className="text-sm mt-2 bg-muted/50 p-2 rounded-md">{activity.notes}</div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <DragVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Reorder</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Connection line to next activity */}
                        {index < selectedDay.activities.length - 1 && (
                          <div className="absolute -left-[15px] top-8 bottom-0 border-l-2 border-dashed border-muted" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="h-[600px] relative">
                <MapComponent
                  center={{ lat: 48.8566, lng: 2.3522 }} // Paris
                  zoom={13}
                  markers={mapMarkers}
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-md max-w-xs">
                  <h3 className="font-medium mb-2">Trip Overview</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View all your planned activities across {itinerary.days.length} days in {itinerary.location}.
                  </p>
                  <div className="grid gap-2">
                    {itinerary.days.map((day) => (
                      <button
                        key={day.id}
                        className="text-left p-2 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => {
                          // Would center map on this day's activities
                        }}
                      >
                        <div className="font-medium">{day.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="directions" className="mt-6">
            <div className="grid md:grid-cols-[1fr_400px] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Directions</CardTitle>
                  <CardDescription>Step-by-step directions for your entire trip</CardDescription>
                </CardHeader>
                <CardContent>
                  {itinerary.days.map((day) => (
                    <div key={day.id} className="mb-8">
                      <h3 className="font-medium text-lg mb-4">
                        {day.title} -{" "}
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>

                      <div className="space-y-6">
                        {day.activities.map((activity, index) => (
                          <div key={activity.id}>
                            <div className="flex items-start gap-4">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <activity.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{activity.title}</div>
                                <div className="text-sm text-muted-foreground">{activity.location}</div>
                                <div className="text-sm text-muted-foreground">{activity.time}</div>
                              </div>
                            </div>

                            {/* Direction to next activity */}
                            {index < day.activities.length - 1 && (
                              <div className="ml-6 pl-6 border-l-2 border-dashed border-muted my-4">
                                <div className="p-3 bg-muted/50 rounded-md">
                                  <div className="flex items-center text-sm mb-2">
                                    <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                                    <span className="font-medium">
                                      {activity.location} to {day.activities[index + 1].location}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <p>Distance: ~2.5 km</p>
                                    <p>Travel time: ~15 min by metro, ~30 min walking</p>
                                    <p className="mt-2">
                                      Recommended: Take Line 1 from Champs-Élysées to Louvre station
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transportation Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded-full">
                            <Car className="h-4 w-4 text-primary" />
                          </div>
                          <span>Taxi/Uber</span>
                        </div>
                        <span className="text-sm">~€20-30</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded-full">
                            <Compass className="h-4 w-4 text-primary" />
                          </div>
                          <span>Metro</span>
                        </div>
                        <span className="text-sm">~€1.90</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded-full">
                            <Compass className="h-4 w-4 text-primary" />
                          </div>
                          <span>Walking</span>
                        </div>
                        <span className="text-sm">Free</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Travel Passes</h4>
                      <p className="text-sm text-muted-foreground mb-2">Consider these options for your trip:</p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                          <span>Paris Visite Pass: Unlimited travel for 1-5 days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                          <span>Navigo Easy: Rechargeable card for single tickets</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Download Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Itinerary
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export to Calendar
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Offline Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
