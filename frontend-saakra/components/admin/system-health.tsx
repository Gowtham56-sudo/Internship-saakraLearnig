"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Server, Database, Zap, Cloud } from "lucide-react"
import apiFetch from "@/lib/api"

export function SystemHealth() {
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch("/api/analytics/admin")
      .then((res) => {
        if (!mounted) return
        setAnalytics(res)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load system health")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Card className="p-6">Loading health metrics...</Card>
  if (error) return <Card className="p-6 text-sm text-red-600">Error: {String(error)}</Card>

  const courseMetrics = analytics?.courseMetrics || {}
  const assessmentMetrics = analytics?.assessmentMetrics || {}
  const certificateMetrics = analytics?.certificateMetrics || {}

  const activeCertPercent = certificateMetrics.totalIssued
    ? Math.round(((certificateMetrics.activeCount || 0) / certificateMetrics.totalIssued) * 100)
    : 0

  const statusForRate = (value: number) => {
    if (value >= 90) return "Excellent"
    if (value >= 70) return "Healthy"
    if (value > 0) return "Needs attention"
    return "No data"
  }

  const metrics = [
    {
      icon: Server,
      label: "Avg Completion",
      value: courseMetrics.averageCompletionRate || 0,
      status: statusForRate(courseMetrics.averageCompletionRate || 0),
      color: "text-green-500",
    },
    {
      icon: Database,
      label: "Assessment Pass",
      value: assessmentMetrics.averagePassRate || 0,
      status: statusForRate(assessmentMetrics.averagePassRate || 0),
      color: "text-blue-500",
    },
    {
      icon: Zap,
      label: "Avg Score",
      value: assessmentMetrics.averageAssessmentScore || 0,
      status: statusForRate(assessmentMetrics.averageAssessmentScore || 0),
      color: "text-accent",
    },
    {
      icon: Cloud,
      label: "Active Certificates",
      value: activeCertPercent,
      status: statusForRate(activeCertPercent),
      color: "text-primary",
    },
  ]

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{"System Health"}</h2>
        <p className="text-sm text-muted-foreground">{"Live platform metrics from Firebase"}</p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{metric.status}</span>
              </div>
              <Progress value={metric.value} className="h-2" />
              <div className="mt-1 text-right text-xs text-muted-foreground">{metric.value}%</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
