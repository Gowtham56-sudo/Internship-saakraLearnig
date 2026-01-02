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
import { GraduationCap, Bell, Settings, LogOut, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userAuth")
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
              <span className="text-xl font-semibold">{"Saakra Admin"}</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/admin/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                {"Dashboard"}
              </Link>
              <Link
                href="/admin/users"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Users"}
              </Link>
              <Link
                href="/admin/courses"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Courses"}
              </Link>
              <Link
                href="/admin/analytics"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Analytics"}
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {"Settings"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/admin-user.png" alt="Admin" />
                    <AvatarFallback>{"AD"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{"Admin User"}</p>
                    <p className="text-xs text-muted-foreground">{"admin@saakra.edu"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    {"Profile"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {"Settings"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex cursor-pointer items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    {"Security"}
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
