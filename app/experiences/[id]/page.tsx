"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  MapPin, 
  Star, 
  Loader2, 
  AlertCircle, 
  Users, 
  Globe, 
  CheckCircle, 
  Heart, 
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Languages,
  UserCheck,
  Info,
  Route,
  MessageCircle,
  Minus,
  Calendar as CalendarIcon,
  Map,
  Flag
} from "lucide-react"
import { getPackageOptionsForExperience, getExperienceById, getReviewsForExperience, getPackageItinerarySteps, getStartEndTimesForPackageOption, StartEndTime, Experience as ApiExperience, PackageOption, ExperienceReview, PackageItineraryStep } from "@/lib/api/experiences"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Calendar } from '@/components/ui/calendar'

// 1. Update interfaces
interface ExperiencePackage {
  id: string
  name: string
  price: number
  description: string
  duration: string
  includes: string[]
  not_included: string[]
  itinerary: Array<{
    day: number
    title: string
    description: string
    duration: string
  }>
  meeting_point?: {
    address?: string
    lat?: number
    lng?: number
    details?: string
    start_time?: string
    end_time?: string
  }
}

// Fix Experience interface to match AgeCategory[]
interface AgeCategory {
  label: string;
  min: number;
  max: number | null;
  price: number; // price per person for this age category
}

interface Experience extends ApiExperience {
  packages: ExperiencePackage[];
  languages?: string;
  number_participants?: number;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  reviews?: Array<{
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  age_categories?: AgeCategory[];
}

export default function ExperienceDetailPage() {
  // All useState hooks at the top!
  const [peopleCounts, setPeopleCounts] = useState<{ [pkgId: string]: Record<string, number> }>({});
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [experience, setExperience] = useState<ApiExperience | null>(null)
  const selectedPackage = selectedPackageIndex !== null ? packageOptions[selectedPackageIndex] : undefined;
  // Derived data for Additional Info and Cancellation Policy
  const additionalInfoLines = useMemo(() => {
    if (!selectedPackage?.additional_info) return [] as string[];
    return selectedPackage.additional_info.split('\n').map((l: string) => l.trim()).filter(Boolean);
  }, [selectedPackage]);
  const cancellationRules = useMemo(() => {
    if (experience?.cancellation_policy && experience.cancellation_policy.length > 0) {
      return experience.cancellation_policy;
    }
    // Default full refund up to 24h before
    return [{ hours_before: 24, refund_percent: 100 }];
  }, [experience]);
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileSections, setMobileSections] = useState({
    details: false,
    booking: false
  })
  const supabase = getSupabaseClient()
  const [reviews, setReviews] = useState<ExperienceReview[]>([])
  const [packageItinerarySteps, setPackageItinerarySteps] = useState<PackageItineraryStep[]>([])
  const maxPeople = (experience as any)?.max_participants || 32;

  // Add gallery state
  const images = useMemo(() => {
    // If experience.images exists and is an array, use it. Otherwise, use image_url or empty array.
    if (experience && Array.isArray((experience as any).images) && (experience as any).images.length > 0) {
      return (experience as any).images
    }
    if (experience && experience.image_url) {
      return [experience.image_url]
    }
    return []
  }, [experience])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Section refs for scroll sync
  const overviewRef = useRef<HTMLDivElement | null>(null)
  const includedRef = useRef<HTMLDivElement | null>(null)
  const meetingRef = useRef<HTMLDivElement | null>(null)
  const expectRef = useRef<HTMLDivElement | null>(null)
  const additionalRef = useRef<HTMLDivElement | null>(null)
  const cancellationRef = useRef<HTMLDivElement | null>(null)
  const reviewsRef = useRef<HTMLDivElement | null>(null)
  const tabBarRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [showStickyTabs, setShowStickyTabs] = useState(false)

  // Add ref for package options section
  const packageOptionsRef = useRef<HTMLDivElement | null>(null);
  // Add a ref for package options tab
  const packageOptionsTabRef = useRef<HTMLDivElement | null>(null);

  // Scroll to section on tab click (with offset for sticky tab bar)
  const scrollToSection = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      overview: overviewRef,
      packageoptions: packageOptionsRef,
      expect: expectRef,
      additional: additionalRef,
      cancellation: cancellationRef,
      reviews: reviewsRef,
    }
    const el = refs[section]?.current
    if (el && tabBarRef.current) {
      const tabBarHeight = tabBarRef.current.offsetHeight
      const y = el.getBoundingClientRect().top + window.scrollY - tabBarHeight - 8
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  // Update active tab on scroll and sticky state for shadow
  useEffect(() => {
    const handleScroll = () => {
      if (!overviewRef.current || !tabBarRef.current) return;
      const overviewBottom = overviewRef.current.getBoundingClientRect().bottom;
      setShowStickyTabs(overviewBottom <= (tabBarRef.current.offsetHeight || 0));
      if (tabBarRef.current) {
        setIsSticky(tabBarRef.current.getBoundingClientRect().top <= 0)
      }
      const sections = [
        { key: "overview", ref: overviewRef },
        { key: "packageoptions", ref: packageOptionsRef },
        { key: "expect", ref: expectRef },
        { key: "additional", ref: additionalRef },
        { key: "cancellation", ref: cancellationRef },
        { key: "reviews", ref: reviewsRef },
      ]
      const tabBarHeight = tabBarRef.current?.offsetHeight || 0
      const scrollY = window.scrollY
      let found = "overview"
      for (const section of sections) {
        const el = section.ref.current
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - tabBarHeight - 16
          if (top <= scrollY) {
            found = section.key
          }
        }
      }
      setActiveTab(found)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const exp = await getExperienceById(id as string)
        if (!exp) throw new Error("Experience not found")
        setExperience(exp)
        const pkgs = await getPackageOptionsForExperience(id as string)
        setPackageOptions(pkgs)
        const revs = await getReviewsForExperience(id as string)
        setReviews(revs)
        // Fetch itinerary for the first package by default
        if (pkgs.length > 0) {
          const steps = await getPackageItinerarySteps(pkgs[0].id)
          setPackageItinerarySteps(steps)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load experience details")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) loadData()
  }, [id])

  // Fetch itinerary steps when selected package changes
  useEffect(() => {
    async function fetchItinerary() {
      if (packageOptions[selectedPackageIndex!]) {
        const steps = await getPackageItinerarySteps(packageOptions[selectedPackageIndex!].id)
        setPackageItinerarySteps(steps)
      } else {
        setPackageItinerarySteps([])
      }
    }
    fetchItinerary()
  }, [selectedPackageIndex, packageOptions])

  // Check if experience is in user's wishlist
  useEffect(() => {
    async function checkWishlist() {
      if (!user || !id) return

      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("*")
          .eq("user_id", user.id)
          .eq("experience_id", id)
          .maybeSingle()

        if (error) {
          console.error("Error checking wishlist:", error)
          return
        }

        setIsInWishlist(!!data)
      } catch (error) {
        console.error("Error checking wishlist:", error)
      }
    }

    if (user) {
      checkWishlist()
    }
  }, [user, id, supabase])

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/experiences/${id}/book`)
      return
    }
    router.push(`/experiences/${id}/book`)
  }

  const toggleWishlist = async () => {
    if (!user) {
      router.push(`/login?redirect=/experiences/${id}`)
      return
    }

    setIsWishlistLoading(true)

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("experience_id", id)

        if (error) {
          console.error("Delete error:", error)
          throw new Error(`Failed to remove from wishlist: ${error.message}`)
        }

        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: "Experience has been removed from your wishlist",
        })
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          experience_id: id,
          created_at: new Date().toISOString(),
        })

        if (error) {
          if (error.code === "23503") {
            throw new Error("The wishlist system is not set up properly. Please run the setup SQL script.")
          } else if (error.code === "42P01") {
            throw new Error("The wishlist table doesn't exist. Please run the setup SQL script.")
          } else {
            throw new Error(`Failed to add to wishlist: ${error.message}`)
          }
        }

        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: "Experience has been added to your wishlist",
        })
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const toggleMobileSection = (section: 'details' | 'booking') => {
    setMobileSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ))
  }

  // Add expandedReviews state
  const [expandedReviews, setExpandedReviews] = useState<{[id: string]: boolean}>({});

  const today = new Date();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Compute unavailableDates and allowedDays based on package selection
  let unavailableDates: string[] = [];
  let unavailableDays: number[] = [];
  if (selectedPackage) {
    unavailableDates = (selectedPackage as any)?.unavailable_dates || [];
    unavailableDays = (selectedPackage as any)?.unavailable_days || [];
  } else if (packageOptions.length > 0) {
    // Union of all unavailableDates
    const allUnavailable = packageOptions.map(pkg => (pkg as any)?.unavailable_dates || []);
    unavailableDates = Array.from(new Set(allUnavailable.flat()));
    // Union of all unavailableDays
    const allUnavailableDays = packageOptions.map(pkg => (pkg as any)?.unavailable_days || []);
    unavailableDays = Array.from(new Set(allUnavailableDays.flat()));
  }
  const monthsToShow = 12;
  const availableDates: string[] = [];
  for (let i = 0; i < monthsToShow * 31; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dStr = formatDate(d);
    if (d.getFullYear() > today.getFullYear() + 1) break; // stop after 1 year
    if (unavailableDates.includes(dStr)) continue;
    if (unavailableDays.length > 0) {
      if (!unavailableDays.includes(d.getDay())) continue;
    }
    availableDates.push(dStr);
  }
  const defaultDate = availableDates.length > 0 ? availableDates[0] : formatDate(today);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false)
  const [startTimes, setStartTimes] = useState<StartEndTime[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const calendarRef = useRef<HTMLDivElement>(null)
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // always local time
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calendarInputRef = useRef<HTMLInputElement | null>(null);
  const calendarPopoverRef = useRef<HTMLDivElement | null>(null);
  const peopleInputRef = useRef<HTMLButtonElement | null>(null);
  const peopleDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Close calendar if click outside
      if (
        showCalendar &&
        calendarPopoverRef.current &&
        !calendarPopoverRef.current.contains(e.target as Node) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
      // Close people picker if click outside
      if (
        showPeoplePicker &&
        peopleDropdownRef.current &&
        !peopleDropdownRef.current.contains(e.target as Node) &&
        peopleInputRef.current &&
        !peopleInputRef.current.contains(e.target as Node)
      ) {
        setShowPeoplePicker(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCalendar, showPeoplePicker]);
  // Only calculate selectedPackage and calculatedPrice if packageOptions are loaded
  const baseAgeCats: AgeCategory[] = [
    { label: 'Adult', min: 13, max: null, price: experience?.price || 0 },
    { label: 'Child', min: 4, max: 12, price: Math.max((experience?.price || 0) * 0.8, 0) },
    { label: 'Infant', min: 0, max: 3, price: 0 },
  ];
  // If the selected package contains its own age categories, prefer those
  const rawAgeCats: AgeCategory[] = (selectedPackage as any)?.age_categories ?? (experience as any)?.age_categories ?? baseAgeCats;
  const ageCategories: AgeCategory[] = [...rawAgeCats].sort((a, b) => (b.min ?? 0) - (a.min ?? 0));
  const defaultPeople: Record<string, number> = {};
  ageCategories.forEach((cat: AgeCategory) => {
    defaultPeople[cat.label.toLowerCase()] = 0;
  });
  const selectedPkgId = selectedPackage?.id;
  const people = selectedPkgId && peopleCounts[selectedPkgId] ? peopleCounts[selectedPkgId] : defaultPeople;
  const totalPeople = Object.values(people).reduce((sum, val) => sum + val, 0);
  // Fetch start/end times when date + package chosen
  useEffect(() => {
    async function loadStartTimes() {
      if (!selectedPackage) {
        setStartTimes([]);
        setSelectedStartTime('');
        return;
      }
      const times = await getStartEndTimesForPackageOption(selectedPackage.id);
      setStartTimes(times);
      setSelectedStartTime(times[0]?.start_time || '');
    }
    loadStartTimes();
  }, [selectedPackage]);

  // Calculate total price based on current selections (only when a date is selected)
  const calculatedPrice = selectedPackage
    ? ageCategories.reduce((sum, cat) => {
        const catKey = cat.label.toLowerCase();
        const count = people[catKey] ?? 0;
        return sum + (count * (cat.price || 0));
      }, 0)
    : 0;

  // Minimum package price (used when no date selected and no specific package selected)
  const minPackagePrice = packageOptions.length > 0 ? Math.min(...packageOptions.map(pkg => {
    const cats: AgeCategory[] = (pkg as any).age_categories ?? [];
    if (cats.length === 0) return experience?.price || 0;
    const highestAgePrice = [...cats].sort((a, b) => (b.min ?? 0) - (a.min ?? 0))[0]?.price;
    const fallbackPrice = experience?.price ?? 0;
    return highestAgePrice ?? fallbackPrice;
    
  })) : (experience?.price || 0);

  // Determine the price to display in the summary section
  const summaryPrice = !selectedDate
    ? (selectedPackage ? ageCategories[0]?.price || 0 : minPackagePrice)
    : calculatedPrice;
  const displayPrice = selectedDate && summaryPrice === 0 ? '-' : summaryPrice.toFixed(2);

  // When switching package, reset people counts for that package
  const handleSelectPackage = (idx: number) => {
    setSelectedPackageIndex(idx);
    const pkgId = packageOptions[idx]?.id;
    setPeopleCounts(prev => ({
      ...prev,
      [pkgId]: defaultPeople
    }));
  };

  // Update handleClearPeople to clear package selection and all people counts
  const handleClearPeople = () => {
    setSelectedPackageIndex(null);
    setPeopleCounts({});
    setSelectedDate('');
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p className="text-lg">Loading experience details...</p>
      </div>
    )
  }
  if (error || !experience) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Experience not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/experiences")}>Back to Experiences</Button>
        </div>
      </div>
    )
  }
  // Now safe to use experience
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main content (Overview, then Package Options) */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-8">
              {/* Mobile Carousel */}
              <div className="block md:hidden relative h-[350px]">
                {images.length > 0 ? (
                  <div className="relative h-full">
                    <img
                      src={images[selectedImageIndex]}
                      alt={experience.title}
                      className="rounded-lg w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                          onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}
                        >
                          <ChevronDown className="rotate-90 w-6 h-6" />
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                          onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                        >
                          <ChevronDown className="-rotate-90 w-6 h-6" />
                        </button>
                      </>
                    )}
                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Desktop Gallery */}
              <div className="hidden md:flex flex-row gap-4 h-[350px]">
                {/* Thumbnails */}
                <div className="flex flex-col gap-2 w-24 min-w-[6rem] h-full">
                  {images.length > 0 ? images.map((img: string, idx: number) => (
                    <img
                      key={img}
                      src={img}
                      alt={`Gallery thumbnail ${idx + 1}`}
                      className={`rounded cursor-pointer border object-cover w-20 h-20 ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setSelectedImageIndex(idx)}
                    />
                  )) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                {/* Main Image */}
                <div className="flex-1 relative h-full">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={experience.title}
                      className="rounded-lg w-full h-full object-cover"
                    />
                  ) : (
                    <div className="rounded-lg w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                  {/* Arrows for gallery navigation if more than 1 image */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                        onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}
                      >
                        <ChevronDown className="rotate-90 w-6 h-6" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                        onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                      >
                        <ChevronDown className="-rotate-90 w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Hidden tab bar for measurement, always rendered */}
            <div ref={tabBarRef} className="invisible h-0 overflow-hidden">
              <div className="flex border-b mx-auto h-16 items-center">
                {[
                  { key: "overview", label: "Overview" },
                  { key: "packageoptions", label: "Package options" },
                  { key: "cancellation", label: "Cancellation Policy" },
                  { key: "reviews", label: "Reviews" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className="px-6 py-4 font-medium border-b-2 border-transparent text-gray-500 h-16 flex items-center"
                    style={{ outline: 'none' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Sticky Tab Bar: only show after scrolling past Overview */}
            {showStickyTabs && (
              <div
                className="fixed top-0 left-0 right-0 z-[100] bg-white transition-shadow shadow-md h-16 flex items-center"
                style={{ marginTop: 0 }}
              >
                <div className="flex border-b mx-auto h-16 items-center">
                  {[
                    { key: "overview", label: "Overview" },
                    { key: "packageoptions", label: "Package options" },
                    { key: "cancellation", label: "Cancellation Policy" },
                    { key: "reviews", label: "Reviews" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => scrollToSection(tab.key)}
                      className={`px-6 py-4 font-medium border-b-2 transition-colors duration-200 h-16 flex items-center ${activeTab === tab.key ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                      style={{ outline: 'none' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Main Content (sections) */}
            <div className="mt-8">
              {/* Overview always open */}
              <section ref={overviewRef} id="overview" className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="mb-4">{experience.description}</p>
              </section>
              {/* Package Options Section */}
              <section className="mb-8" ref={packageOptionsRef}>
                <div className="bg-white rounded-lg p-6 shadow relative">
                  <h2 className="text-xl font-bold mb-4">Package options</h2>
                  {/* Check Availability Button and Date Picker */}
                  <div className="mb-4 relative">
                    <h5 className="text-grey-300 mb-3">Please select a date</h5>
                    <button
                      ref={dateButtonRef}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 ${selectedDate ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                      onClick={() => setShowCalendar((prev) => !prev)}
                      type="button"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      {selectedDate ? formatDisplayDate(selectedDate) : 'Check availability'}
                    </button>
                    {showCalendar && (
                      <div ref={calendarRef} className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border p-2" style={{ minWidth: '18rem' }}>
                        <Calendar
                          selected={selectedDate ? new Date(selectedDate) : undefined}
                          onDayClick={(date: Date | undefined) => {
                            setSelectedDate(date ? formatDate(date) : '');
                            setShowCalendar(false);
                          }}
                          disabled={(date: Date) => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            // Disable if before today
                            if (date < today) return true;
                            // Disable if in unavailableDates
                            if (unavailableDates.includes(formatDate(date))) return true;
                            // Disable if unavailableDays includes this day
                            if (unavailableDays.length > 0 && unavailableDays.includes(date.getDay())) return true;
                            return false;
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {selectedDate && startTimes.length > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <select
                        className="border rounded px-2 py-1"
                        value={selectedStartTime}
                        onChange={(e) => setSelectedStartTime(e.target.value)}
                      >
                        {startTimes.map((t) => (
                          <option key={t.id} value={t.start_time}>
                            {t.start_time.slice(0,5)}{t.end_time ? ` - ${t.end_time.slice(0,5)}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Clear button */}
                  <button
                    className="absolute top-6 right-6 text-blue-500 hover:text-blue-700 text-sm font-medium border border-blue-100 bg-blue-50 rounded px-3 py-1"
                    onClick={handleClearPeople}
                    type="button"
                  >
                    Clear All
                  </button>
                  {/* Package Type Selector */}
                  <div className="mb-4 flex flex-col gap-2">
                  <h5 className="text-grey-300 mb-1">Package type</h5>
                    {packageOptions.map((pkg, idx) => (
                      <button
                        key={pkg.id}
                        className={`inline-flex self-start items-center rounded px-4 py-2 border text-left transition-colors duration-150 ${
                          selectedPackageIndex === idx
                            ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold'
                            : 'bg-white border-gray-300'
                        }`}
                        onClick={() => handleSelectPackage(idx)}
                        style={{ minWidth: 0 }}
                      >
                        <div className="font-bold">{pkg.name}</div>
                      </button>
                    ))}
                  </div>
                  {/* People selectors and actions only if a package is selected */}
                  {selectedPackage && (
                    <>
                      {/* Show message if no date selected */}
                      {/* Show message if date or time not selected */}
                      {(!selectedDate || !selectedStartTime) && (
                        <div className="mb-4 text-sm text-blue-600 font-medium">Please choose a date and start time before selecting participants.</div>
                      )}
                      {/* Dynamic Quantity Selectors */}
                      <div className="mb-4">
                        {ageCategories.map((cat: AgeCategory, idx: number) => {
                          const catKey = cat.label.toLowerCase();
                          const value = people[catKey] ?? (idx === 0 ? 1 : 0);
                          return (
                            <div className="mb-2" key={cat.label + idx}>
                              <div className="flex items-center justify-between">
                                <span className="flex flex-col">
                                      <span>{cat.label}{typeof cat.min === 'number' ? ` (${cat.min}${cat.max !== null ? `-${cat.max}` : '+'})` : ''}</span>
                                      <span className="text-sm font-semibold text-orange-600">US$ {cat.price?.toFixed(2)}</span>
                                    </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="rounded border px-2"
                                    onClick={() => setPeopleCounts(prev => ({
                                      ...prev,
                                      [selectedPkgId!]: {
                                        ...people,
                                        [catKey]: Math.max(idx === 0 ? 1 : 0, value - 1)
                                      }
                                    }))}
                                    disabled={value <= (idx === 0 ? 1 : 0) || !selectedDate || !selectedStartTime}
                                  >-</button>
                                  <span>{value}</span>
                                  <button
                                    type="button"
                                    className="rounded border px-2"
                                    onClick={() => setPeopleCounts(prev => ({
                                      ...prev,
                                      [selectedPkgId!]: {
                                        ...people,
                                        [catKey]: totalPeople < maxPeople ? value + 1 : value
                                      }
                                    }))}
                                    disabled={totalPeople >= maxPeople || !selectedDate || !selectedStartTime}
                                  >+</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="text-xs text-gray-500">You can select up to {maxPeople} for this package</div>
                      </div>
                      {/* Price and Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-2xl font-bold">US$ {displayPrice}</div>
                        <div className="flex gap-2">
                          <Button variant="secondary" disabled={!selectedDate}>Add to cart</Button>
                          <Button 
                            disabled={!selectedDate}
                            onClick={() => {
                              router.push(`/experiences/${id}/book?date=${selectedDate}`);
                            }}
                          >
                            Book now
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
              {/* Package Details Card OUTSIDE the package options card */}
              {selectedPackage && (
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-2">What's Included</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 ? (
                        selectedPackage.inclusions.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li>Not provided</li>
                      )}
                    </ul>
                    <h4 className="mt-4 font-semibold mb-2">What's Not Included</h4>
            <ul className="list-disc pl-6 space-y-1">
              {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 ? (
                selectedPackage.exclusions.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>Not provided</li>
              )}
            </ul>
            {additionalInfoLines.length > 0 && (
              <div ref={additionalRef} id="additional" className="mt-4">
                <h4 className="font-semibold mb-2">Additional Info</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {additionalInfoLines.map((line: string, idx: number) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {packageItinerarySteps && packageItinerarySteps.length > 0 && (
              <>
                <h4 className="mt-4 font-semibold mb-2">Itinerary</h4>
                <div className="relative">
                  {/* Timeline vertical line through icons */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-100 z-0" />
                  <div className="flex flex-col">
                    {/* Departure marker */}
                    <div className="flex items-start mb-2 relative z-10">
                      <div className="flex flex-col items-center" style={{ width: '3rem' }}>
                        <div className="relative z-10 flex items-center justify-center" style={{ width: '2rem', height: '2rem' }}>
                          <MapPin className="w-5 h-5 text-blue-500 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="font-bold text-base text-blue-900 ml-2">Departure</div>
                    </div>
                    {packageItinerarySteps.map((step, idx) => (
                      <div key={idx} className="flex items-start mb-6 relative z-10">
                        <div className="flex flex-col items-center" style={{ width: '3rem' }}>
                          <div className="relative z-10 flex items-center justify-center" style={{ width: '2rem', height: '2rem' }}>
                            <Map className="w-5 h-5 text-blue-500 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 ml-2">
                          <div className="font-bold text-base mb-1">{step.title}</div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                            {step.duration && (
                              <span className="flex items-center gap-1">{step.duration}</span>
                            )}
                          </div>
                          <div className="text-gray-700 text-sm whitespace-pre-line mb-2">{step.description}</div>
                        </div>
                      </div>
                    ))}
                    {/* Return marker */}
                    <div className="flex items-start relative z-10">
                      <div className="flex flex-col items-center" style={{ width: '3rem' }}>
                        <div className="relative z-10 flex items-center justify-center" style={{ width: '2rem', height: '2rem' }}>
                          <MapPin className="w-5 h-5 text-blue-500 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="font-bold text-base text-blue-900 ml-2">Return</div>
                    </div>
                  </div>
                </div>
              </>
            )}
                    
                    <h4 className="mt-4 font-semibold mb-2">Meeting and Pickup</h4>
                    <div className="mb-2">
                      <p className="font-semibold">Address:</p>
                      <p className="mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>{selectedPackage.meeting_point_address || 'Not provided'}</span>
                      </p>
                      {selectedPackage.meeting_point_lat && selectedPackage.meeting_point_lng ? (
                        <iframe
                          title="Meeting Point Map"
                          width="100%"
                          height="200"
                          className="rounded border mb-4"
                          style={{ minHeight: 150 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPackage.meeting_point_lng-0.005}%2C${selectedPackage.meeting_point_lat-0.005}%2C${selectedPackage.meeting_point_lng+0.005}%2C${selectedPackage.meeting_point_lat+0.005}&layer=mapnik&marker=${selectedPackage.meeting_point_lat}%2C${selectedPackage.meeting_point_lng}`}
                        />
                      ) : (
                        <div className="w-full h-[150px] bg-gray-200 rounded flex items-center justify-center text-gray-500 mb-4">Map Unavailable</div>
                      )}
                      {selectedPackage.meeting_point_details && (
                        <div className="mt-2 text-gray-700">{selectedPackage.meeting_point_details}</div>
                      )}
                    </div>

                  </div>
                </div>
              )}
              <Accordion
                type="multiple"
                defaultValue={["cancellation"]}
                className="mb-8"
              >
                
                <AccordionItem value="cancellation" ref={cancellationRef} id="cancellation">
                  <AccordionTrigger>
                    <h3 className="text-2xl font-bold mb-4">Cancellation Policy</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    {cancellationRules.map((rule, idx) => (
                      <p key={idx} className="mb-2">Cancel at least {rule.hours_before} hours before start for a {rule.refund_percent}% refund.</p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <section ref={reviewsRef} id="reviews" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <ul className="space-y-8">
                {reviews.map((review) => (
                  <li key={review.id} className="border-b pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <div className="font-semibold text-lg mb-1">
                      {review.comment.split('. ')[0] + (review.comment.includes('.') ? '.' : '')}
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                      {review.user_name}, {review.date}
                    </div>
                    <div className="text-gray-800 mb-2">
                      {review.comment}
                    </div>
                  </li>
                ))}
              </ul>
          )}
              </section>
            </div>
          </div>
          {/* Right: Sticky Card with minimum price and select options button */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[72px]">
              <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
                <div className="text-2xl font-bold mb-2">From US$ {minPackagePrice.toFixed(2)}</div>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 text-base"
                  onClick={() => packageOptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  Select options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}