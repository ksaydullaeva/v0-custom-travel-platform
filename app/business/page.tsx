import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Globe, BarChart3, CreditCard } from "lucide-react"
import agenciesData from "@/lib/data/agencies.json"
import { AgencyLogos } from "@/components/business/agency-logos"

export default function BusinessPage() {
  const agencies = agenciesData.agencies

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">BTLE for Business</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Expand your reach and grow your travel agency business by listing your tours on our platform
        </p>
        <div className="mt-8">
          <Link href="/business/register">
            <Button size="lg" className="mr-4">
              Register Your Agency
            </Button>
          </Link>
          <Link href="/business/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <Globe className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Global Reach</CardTitle>
            <CardDescription>Connect with travelers from around the world</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Showcase your tours to a global audience of travelers looking for authentic experiences.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Powerful Analytics</CardTitle>
            <CardDescription>Track performance and optimize your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get detailed insights on how your tours are performing and make data-driven decisions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Secure Payments</CardTitle>
            <CardDescription>Receive payments directly to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our secure payment system ensures you get paid on time, every time.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-1" />
                <p>
                  <span className="font-semibold">Register your agency</span> - Create an account and complete your
                  business profile
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-1" />
                <p>
                  <span className="font-semibold">Add your tours</span> - Create detailed listings for all your tour
                  offerings
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-1" />
                <p>
                  <span className="font-semibold">Manage bookings</span> - Receive and confirm bookings through your
                  dashboard
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0 mt-1" />
                <p>
                  <span className="font-semibold">Get paid</span> - Receive payments directly to your account
                </p>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/business/register">
                <Button>Get Started Today</Button>
              </Link>
            </div>
          </div>
          <div className="bg-background rounded-lg p-6 shadow-lg">
            <img
              src="/dashboard_screen.png?height=300&width=500"
              alt="Business dashboard preview"
              className="rounded-md w-full"
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-6">Join Hundreds of Travel Agencies</h2>
        <AgencyLogos agencies={agencies} />
      </div>

      <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Join our platform today and start reaching more travelers worldwide.
        </p>
        <Link href="/business/register">
          <Button size="lg" variant="secondary">
            Register Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
