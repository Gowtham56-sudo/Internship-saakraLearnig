import { Card } from "@/components/ui/card"
import { Users, Award, TrendingUp, Globe } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      label: "Students Empowered",
      value: "10,000+",
      description: "From rural and urban backgrounds",
    },
    {
      icon: Award,
      label: "Certifications Issued",
      value: "8,500+",
      description: "Industry-recognized credentials",
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: "95%",
      description: "Course completion & satisfaction",
    },
    {
      icon: Globe,
      label: "Regional Reach",
      value: "15+",
      description: "States across India",
    },
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className="border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 font-medium text-foreground">{stat.label}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.description}</div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
