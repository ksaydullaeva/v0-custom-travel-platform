"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calendar, Package, Plus, Settings, Users, LogOut, Inbox, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { BusinessToursList } from "@/components/business/tours-list"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/lib/i18n"
import { AnalyticsCharts } from "@/components/business/analytics-charts"

// Update the BusinessAnalytics interface
interface BusinessAnalytics {
  totalTours: number
  activeBookings: number
  totalRevenue: number
  totalCustomers: number
  charts: {
    revenue: {
      labels: string[]
      data: number[]
    }
    bookings: {
      labels: string[]
      data: number[]
    }
    demographics: {
      labels: string[]
      data: number[]
    }
  }
}

export default function BusinessDashboardPage() {
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<BusinessAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const [formData, setFormData] = useState({
    languages: [""],
  })
  const { t } = useTranslation()

  useEffect(() => {
    const checkAuth = async () => {
      console.log("checking auth")
      try {
        // Wrap getUser in a Promise with setTimeout
        const userData = await new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await supabase.auth.getUser()
              resolve(result)
            } catch (err) {
              reject(err)
            }
          }, 0)
        })

        const { data: { user }, error } = userData as any

        if (error || !user) {
          console.log("No user found, redirecting to login")
          router.push("/business/login")
          return
        }

        console.log("fetching profile")
        // Wrap profile fetch in a Promise with setTimeout
        const profileResult = await new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await supabase
                .from("business_profiles")
                .select("*")
                .eq("id", user.id)
                .single()
              resolve(result)
            } catch (err) {
              reject(err)
            }
          }, 0)
        })

        const { data: profileData, error: profileError } = profileResult as any

        if (profileError) {
          throw profileError
        }

        setBusinessProfile(profileData)
      } catch (error: any) {
        console.error("Error in checkAuth:", error)
        toast({
          title: "Error",
          description: "Failed to load business profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        console.log("set loading false")
        setIsLoading(false)
      }
    }

    // Call the existing deferred checkAuth logic
    setTimeout(() => {
      checkAuth()
    }, 0)

    // Update the fetchAnalytics function
    const fetchAnalytics = async () => {
      setIsAnalyticsLoading(true)
      try {
        const response = await fetch('/api/business/analytics?range=30') // Fetch last 30 days of data
        if (!response.ok) {
          throw new Error(`Error fetching analytics: ${response.statusText}`)
        }
        const data: BusinessAnalytics = await response.json()
        setAnalyticsData(data)
      } catch (error: any) {
        console.error('Frontend error fetching analytics:', error)
        toast({
          title: "Analytics Error",
          description: error.message || "Failed to load dashboard analytics.",
          variant: "destructive",
        })
      } finally {
        setIsAnalyticsLoading(false)
      }
    }

    // Defer fetching analytics data as well
    setTimeout(() => {
      fetchAnalytics()
    }, 0)
  }, [router, supabase, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/business/login")
  }

  if (isLoading || isAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!businessProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need a business account to access this page.</p>
        <Button asChild>
          <Link href="/business/register">Register a Business Account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{businessProfile.business_name}</h1>
            <p className="text-muted-foreground">{t("business_dashboard")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t("dashboard")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/tours">
                      <Package className="mr-2 h-4 w-4" />
                      {t("tours")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("bookings")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/customers">
                      <Users className="mr-2 h-4 w-4" />
                      {t("customers")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/messages">
                      <Inbox className="mr-2 h-4 w-4" />
                      {t("messages")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/payments">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("payments")}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/business/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("settings")}
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("overview")}</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_tours")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData ? analyticsData.totalTours : '...'}</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("active_bookings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData ? analyticsData.activeBookings : '...'}</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_revenue")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analyticsData !== null ? analyticsData.totalRevenue.toFixed(2) : '...'}</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_customers")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData ? analyticsData.totalCustomers : '...'}</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Add the charts section after the stats cards */}
            {analyticsData && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t("analytics")}</h2>
                <AnalyticsCharts
                  revenueData={analyticsData.charts.revenue}
                  bookingsData={analyticsData.charts.bookings}
                  customerDemographics={analyticsData.charts.demographics}
                />
              </div>
            )}

            <Tabs defaultValue="tours">
              <TabsList>
                <TabsTrigger value="tours">{t("recent_tours")}</TabsTrigger>
                <TabsTrigger value="bookings">{t("recent_bookings")}</TabsTrigger>
              </TabsList>
              <TabsContent value="tours" className="mt-4">
                <BusinessToursList />
              </TabsContent>
              <TabsContent value="bookings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("recent_bookings")}</CardTitle>
                    <CardDescription>{t("no_bookings_yet")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("no_bookings_found")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("bookings_will_appear_here")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
