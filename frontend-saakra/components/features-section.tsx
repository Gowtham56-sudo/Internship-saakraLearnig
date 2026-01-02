import { Card } from "@/components/ui/card"
import { Brain, Video, Users, FileCheck, Rocket, Shield } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description:
        "Personalized learning paths with intelligent skill gap analysis and adaptive assessments tailored to your progress.",
    },
    {
      icon: Video,
      title: "Curated Video Content",
      description:
        "High-quality educational videos from YouTube, expertly selected and structured for comprehensive learning.",
    },
    {
      icon: Users,
      title: "Expert Trainers",
      description: "Live sessions, mentorship, and guidance from industry professionals who care about your success.",
    },
    {
      icon: FileCheck,
      title: "Real-World Projects",
      description: "Hands-on assignments and practical projects that prepare you for actual industry challenges.",
    },
    {
      icon: Rocket,
      title: "Career Readiness",
      description: "From resume building to interview prep, we prepare you for the complete job search journey.",
    },
    {
      icon: Shield,
      title: "Verified Certificates",
      description: "QR code-verified certificates that prove your skills and boost your employability.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            {"Everything You Need to "}
            <span className="text-primary">{"Succeed"}</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
            {
              "Our platform combines the best of AI technology, expert guidance, and practical learning to ensure your career success."
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
