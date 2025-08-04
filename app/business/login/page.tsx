"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

export default function BusinessLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First sign in using auth provider
      const { success, error } = await signIn(email, password)

      if (!success || error) {
        throw error || new Error("Sign in failed")
      }

      // Check if user is a business account
      const user = (await supabase.auth.getUser()).data.user
      if (!user?.id) throw new Error("User not found")

      const { data: profileData, error: profileError } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        throw profileError
      }

      if (!profileData) {
        toast({
          title: "Not a business account",
          description: "This account is not registered as a business. Please use a business account.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // Just check business_profiles and redirect
      console.log("User is a business account")
      toast({
        title: "Login successful!",
        description: "Welcome back to your business dashboard.",
      })

      console.log("redirecting to business dashboard")
      // Redirect to business dashboard
      router.push("/business/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to your business account to manage your tours</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/business/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have a business account?{" "}
                <Link href="/business/register" className="text-primary hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
