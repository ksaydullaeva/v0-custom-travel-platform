"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/api/auth"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get a user-friendly error message
function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return "An unknown error occurred"

  // Map error codes to user-friendly messages
  switch (error.message) {
    case "Invalid login credentials":
      return "The email or password you entered is incorrect"
    case "Email not confirmed":
      return "Please verify your email address before logging in"
    case "Password should be at least 6 characters":
      return "Your password must be at least 6 characters long"
    case "User already registered":
      return "An account with this email already exists"
    default:
      return error.message
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()
  const router = useRouter()
  const { toast } = useToast()

  // Create user profile via server API
  const createUserProfile = async (userId: string, email: string, fullName: string) => {
    try {
      const response = await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          fullName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error creating profile via API:", errorData)
        return null
      }

      const data = await response.json()
      return data.profile
    } catch (error) {
      console.error("Error creating profile:", error)
      return null
    }
  }

  // Fetch user profile with better error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      // First check if profile exists
      const { data, error, count } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact" })
        .eq("id", userId)

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      // Handle case when no profile is found
      if (count === 0 || !data || data.length === 0) {
        console.log("No profile found for user, creating one via API...")

        // Create a profile if none exists using the server API
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user

        if (user) {
          const newProfile = await createUserProfile(userId, user.email || "", user.user_metadata?.full_name || "")

          if (newProfile) {
            setProfile(newProfile as UserProfile)
            return newProfile
          }
        }

        return null
      }

      // Normal case - profile found
      const profile = data[0] as unknown as UserProfile
      setProfile(profile)
      return profile
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id)
    }
  }

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession()

        setSession(activeSession)
        setUser(activeSession?.user || null)
        console.log("user", activeSession?.user);

        if (activeSession?.user) {
          await fetchUserProfile(activeSession.user.id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsLoading(false)
      }
    }

      // Defer the initial session check
    setTimeout(() => {
      checkSession();
    }, 0);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setTimeout(() => {
        setSession(newSession)
        setUser(newSession?.user || null)

        if (newSession?.user) {
          fetchUserProfile(newSession.user.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)

        // Refresh the page to update server-side data
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          router.refresh()
        }
      }, 0)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("signIn")
      // Supabase handles password verification securely
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log("auth data: ", data)
      if (error) {
        const errorMessage = getAuthErrorMessage(error)

        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        })

        return { success: false, error }
      }

      // Fetch the user profile after successful sign in
      if (data.user) {
        console.log("fetching user profile")
        setTimeout(() => {
          fetchUserProfile(data.user.id)
          console.log("fetched user profile")
        }, 0)
      }

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      })

      // Redirect to home page after successful login
      router.push("/")
      router.refresh()

      return { success: true, error: null }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })

      return { success: false, error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Supabase handles password hashing securely
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        const errorMessage = getAuthErrorMessage(error)

        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        })

        return { success: false, error }
      }

      // Create user profile via server API
      if (data.user) {
        await createUserProfile(data.user.id, email, fullName)
      }

      // Check if session is available (user is automatically logged in)
      if (data.session) {
        setSession(data.session)
        setUser(data.user)

        toast({
          title: "Account created successfully",
          description: "Welcome to Btle!",
        })

        // Redirect to experiences page after successful signup
        router.push("/experiences")
        router.refresh()
      } else {
        // If email confirmation is required, session might not be available
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account",
        })
      }

      return { success: true, error: null }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })

      return { success: false, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      // Clear local state
      setUser(null)
      setSession(null)
      setProfile(null)

      toast({
        title: "Signed out successfully",
      })

      // Force a hard navigation to home page
      window.location.href = "/"
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
