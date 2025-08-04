"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Globe, User, Heart, Calendar, Award, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { LanguageSelector } from "./language-selector"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const isBusinessUser = user?.user_metadata?.user_type === 'business'
  
  // Check if we're on an experience detail page
  const isExperienceDetailPage = pathname?.match(/^\/experiences\/[^\/]+$/)

  console.log("user: ", user)
  console.log("isBusinessUser: " + isBusinessUser)

  return (
    <header className={cn(
      "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      !isExperienceDetailPage && "sticky top-0 z-50"
    )}>
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              {!isBusinessUser && (
                <>
                  <Link
                    href="/experiences"
                    className={cn(
                      "hover:text-foreground/80",
                      pathname?.startsWith("/experiences") ? "text-foreground" : "text-foreground/60",
                    )}
                  >
                    {t("experiences")}
                  </Link>
                  {user && (
                    <Link
                      href="/bookings"
                      className={cn(
                        "hover:text-foreground/80",
                        pathname?.startsWith("/bookings") ? "text-foreground" : "text-foreground/60",
                      )}
                    >
                      My Bookings
                    </Link>
                  )}
                  <Link
                    href="/business"
                    className={cn(
                      "hover:text-foreground/80 font-semibold text-primary",
                      pathname?.startsWith("/business") ? "text-primary" : "text-primary/80",
                    )}
                  >
                    {t("for_business")}
                  </Link>
                </>
              )}
              {isBusinessUser && (
                <Link
                  href="/business/dashboard"
                  className={cn(
                    "hover:text-foreground/80",
                    pathname?.startsWith("/business/dashboard") ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <img src="/noBgLogo.png" alt="BTLE Logo" className="h-16 w-auto" />
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {!isBusinessUser && (
              <>
                <NavigationMenuItem>
                  <Link href="/experiences" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        pathname?.startsWith("/experiences") ? "bg-accent/50" : "",
                      )}
                    >
                      {t("experiences")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {user && (
                  <NavigationMenuItem>
                    <Link href="/bookings" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                          pathname?.startsWith("/bookings") ? "bg-accent/50" : "",
                        )}
                      >
                        My Bookings
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <Link href="/business" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 font-semibold text-primary",
                        pathname?.startsWith("/business") ? "bg-accent/50" : "",
                      )}
                    >
                      {t("for_business")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
            {isBusinessUser && (
              <NavigationMenuItem>
                <Link href="/business/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                      pathname?.startsWith("/business/dashboard") ? "bg-accent/50" : "",
                    )}
                  >
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSelector />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isBusinessUser ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/business/dashboard" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rewards" className="flex items-center cursor-pointer">
                        <Award className="mr-2 h-4 w-4" />
                        <span>Rewards</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">{t("login")}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
