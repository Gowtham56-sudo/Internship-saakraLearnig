"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import apiFetch from "@/lib/api"

export function LearningStats() {
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    apiFetch("/api/dashboard")
      .then((res: any) => {
        if (!mounted) return
        // backend returns stats under res.stats and enrolled courses under res.courses
        const incomingStats = res?.stats || {}
        const enrolledCount = Array.isArray(res?.courses) ? res.courses.length : incomingStats?.enrolledCount
        setStats({ ...incomingStats, enrolledCount })
      })
      .catch((err: any) => {
        console.error("LearningStats: /api/dashboard failed", err)
        if (mounted) setError(err?.body?.error || err?.body || String(err))
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading stats…</div>
  if (error) return <div>Error loading stats: {error}</div>

  const items = [
  { icon: BookOpen, label: "Courses Enrolled", value: stats?.enrolledCount ?? stats?.completedCourses ?? 0, trend: "" , color: "text-blue-500"},
    { icon: Clock, label: "Learning Hours", value: stats?.totalHours ?? 0, trend: "", color: "text-green-500"},
    { icon: Award, label: "Certificates Earned", value: stats?.certificates ?? 0, trend: "", color: "text-accent"},
    { icon: TrendingUp, label: "Overall Progress", value: `${Math.round(stats?.overallProgress ?? 0)}%`, trend: "", color: "text-primary"},
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.label === "Overall Progress" && <span className="text-sm text-muted-foreground">{"avg"}</span>}
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
