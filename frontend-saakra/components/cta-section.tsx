import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12 md:p-20">
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>{"Limited Time Offer"}</span>
            </div>

            <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
              {"Ready to Start Your "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {"Success Journey?"}
              </span>
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
              {
                "Join thousands of students who are transforming their careers with practical skills and AI-powered learning. Start your first course today for free."
              }
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="group min-w-[200px]">
                  {"Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-[200px] bg-transparent">
                {"Talk to Advisor"}
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {"No credit card required • Start learning in 2 minutes"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
