"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, Search, Bell, Settings, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import apiFetch from "@/lib/api"

export function DashboardHeader() {
  const router = useRouter()

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    apiFetch("/api/auth/me")
      .then((res: any) => {
        if (!mounted) return
        setUser(res.user || null)
      })
      .catch((err: any) => {
        console.error("DashboardHeader: /api/auth/me failed", err)
      })
    return () => {
      mounted = false
    }
  }, [])

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
              <Link href="/student/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                {"Dashboard"}
              </Link>
              <Link
                href="/student/courses"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"My Courses"}
              </Link>
              <Link
                href="/student/browse"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Browse"}
              </Link>
              <Link
                href="/student/certificates"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Certificates"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search courses..." className="w-64 pl-9" />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar || "/diverse-students-studying.png"} alt={user?.name || "Student"} />
                      <AvatarFallback>
                        {(() => {
                          const n = user?.name || user?.email || "RS"
                          if (!n) return "RS"
                          const parts = String(n).split(/\s+/)
                          if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
                          return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase()
                        })()}
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
                  <Link href="/student/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    {"Profile"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/student/settings" className="flex cursor-pointer items-center">
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
