"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Globe, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { LanguageSelector } from "./language-selector"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth/auth-provider"

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                  href="/itineraries"
                  className={cn(
                    "hover:text-foreground/80",
                    pathname?.startsWith("/itineraries") ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  {t("itineraries")}
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
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Globe className="h-6 w-6" />
          <span className="font-bold inline-block">TravelMind</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
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
                <Link href="/itineraries" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                      pathname?.startsWith("/itineraries") ? "bg-accent/50" : "",
                    )}
                  >
                    {t("itineraries")}
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
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {isSearchOpen ? (
              <form className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("search_placeholder")}
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                />
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="hidden md:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">{t("search")}</span>
              </Button>
            )}
          </div>
          <LanguageSelector />
          <Button variant="ghost" size="icon" asChild>
            <Link href={user ? "/profile" : "/login"}>
              <User className="h-5 w-5" />
              <span className="sr-only">{user ? t("profile") : t("login")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
