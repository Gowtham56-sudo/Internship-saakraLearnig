"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react"
import apiFetch from "@/lib/api"

export function AdminStats() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch("/api/analytics/admin")
      .then((res) => {
        if (!mounted) return
        setData(res)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load stats")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="py-6">Loading stats...</div>
  if (error)
    return <div className="p-6 text-sm text-red-600">Error loading stats: {String(error)}</div>

  const overview = data?.overview || {}

  const stats = [
    { icon: Users, label: "Total Users", value: overview.totalUsers || 0 },
    { icon: GraduationCap, label: "Active Students", value: overview.totalCourseEnrollments || 0 },
    { icon: BookOpen, label: "Total Courses", value: overview.totalCourses || 0 },
    { icon: TrendingUp, label: "Certificates Issued", value: overview.totalCertificatesIssued || 0 },
  ]

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
                  <span className="text-3xl font-bold">{String(stat.value)}</span>
                </div>
              </div>
              <div className={`rounded-lg bg-muted/50 p-2.5`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
