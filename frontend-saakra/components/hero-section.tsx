import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>{"AI-Powered Skill Development"}</span>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {"Transform Your Future with "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {"Industry-Ready Skills"}
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed md:text-xl">
            {
              "Bridge the gap between academic education and career success. Learn practical skills through AI-guided courses, expert trainers, and real-world projects."
            }
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="group min-w-[180px]">
                {"Start Learning Free"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[180px] bg-transparent">
              <Play className="mr-2 h-4 w-4" />
              {"Watch Demo"}
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{"10,000+"}</div>
              <div className="text-sm text-muted-foreground">{"Active Students"}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{"50+"}</div>
              <div className="text-sm text-muted-foreground">{"Expert Trainers"}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{"95%"}</div>
              <div className="text-sm text-muted-foreground">{"Completion Rate"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
