"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, Bell, Settings, LogOut, User, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebaseClient"
import apiFetch from "@/lib/api"

export function TrainerHeader() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let mounted = true
    apiFetch("/api/auth/me")
      .then((res: any) => {
        if (!mounted) return
        // prefer backend profile, but if backend name is an email prefer firebase client displayName
        const fromApi = res?.user || null
        const current = auth.currentUser

        if (fromApi && (fromApi.name || fromApi.email)) {
          let displayName = fromApi.name
          // if backend returned an email as name, use client displayName when available
          if (displayName && displayName.includes("@") && current?.displayName) {
            displayName = current.displayName
          }

          setUser({
            name: displayName || (current ? current.displayName || undefined : undefined),
            email: fromApi.email || (current ? current.email || undefined : undefined),
            avatar: fromApi.avatar || undefined,
          })
          return
        }

        setUser(fromApi || (current ? { name: current.displayName || undefined, email: current.email || undefined } : null))
      })
      .catch((err: any) => {
        console.error("TrainerHeader: /api/auth/me failed", err)
        const current = auth.currentUser
        if (mounted && current) {
          setUser({ name: current.displayName || undefined, email: current.email || undefined, avatar: current.photoURL || undefined })
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  if (!mounted) {
    // Avoid hydration mismatches by rendering only on client
    return null
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("saakra_auth_token")
      window.localStorage.removeItem("saakra_demo_token")
    }
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">{"Saakra"}</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/trainer/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                {"Dashboard"}
              </Link>
              <Link
                href="/trainer/courses"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"My Courses"}
              </Link>
              <Link
                href="/trainer/students"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Students"}
              </Link>
              <Link
                href="/trainer/assignments"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Assignments"}
              </Link>
              <Link
                href="/trainer/schedule"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Schedule"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {"New Session"}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        auth.currentUser?.photoURL || user?.avatar || "/placeholder-user.jpg"
                      }
                      alt={user?.name || "Trainer"}
                    />
                    <AvatarFallback>
                      {(user?.name || "")
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("") || "PS"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || "Account"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/trainer/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    {"Profile"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trainer/settings" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {"Settings"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {"Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
