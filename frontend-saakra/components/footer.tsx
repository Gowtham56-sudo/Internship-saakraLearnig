import Link from "next/link"
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">{"Saakra Learning"}</span>
            </Link>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              {
                "Empowering students with AI-assisted skill development and industry-ready training for a successful career."
              }
            </p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{"Courses"}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"10th Standard"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"12th Standard"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"College Courses"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"All Programs"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{"Resources"}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Documentation"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Blog"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Success Stories"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Help Center"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{"Company"}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"About Us"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Careers"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Contact"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  {"Privacy Policy"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>
            {"© 2025 Saakra Learning. All rights reserved. Empowering the next generation of skilled professionals."}
          </p>
        </div>
      </div>
    </footer>
  )
}
