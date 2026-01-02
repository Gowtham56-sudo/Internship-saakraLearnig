"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, BookOpen, Video, TrendingUp } from "lucide-react"
import apiFetch from "@/lib/api"

export function TrainerStats() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await apiFetch("/api/auth/me")
        const analytics = await apiFetch("/api/analytics/user")
        const courses = await apiFetch("/api/courses")

        const uid = me?.uid
        const trainerCourses = Array.isArray(courses)
          ? courses.filter((c: any) => c.trainerId === uid)
          : []

        const computed = [
          {
            icon: Users,
            label: "Active Students",
            value: analytics?.courses?.totalEnrolled || 0,
            trend: "",
            color: "text-blue-500",
          },
          {
            icon: BookOpen,
            label: "Courses Teaching",
            value: trainerCourses.length || 0,
            trend: "",
            color: "text-green-500",
          },
          {
            icon: Video,
            label: "Sessions This Week",
            value: 0,
            trend: "",
            color: "text-primary",
          },
          {
            icon: TrendingUp,
            label: "Avg. Rating",
            value: analytics?.assessments?.averageScore || 0,
            trend: "",
            color: "text-accent",
          },
        ]

        if (!mounted) return
        setStats(computed)
      } catch (err) {
        console.error("TrainerStats: failed to load", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">Loading...</div>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
              </div>
              <div className={`rounded-lg bg-muted/50 p-2.5 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
