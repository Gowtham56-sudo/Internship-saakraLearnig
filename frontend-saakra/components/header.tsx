import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">{"Saakra Learning"}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {"Courses"}
            </Link>
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {"Features"}
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {"About"}
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {"Pricing"}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                {"Sign In"}
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">{"Get Started"}</Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
