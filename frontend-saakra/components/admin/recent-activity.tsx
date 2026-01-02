"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { UserPlus, BookOpen, Award, AlertCircle } from "lucide-react"
import apiFetch from "@/lib/api"

export function RecentActivity() {
  const [activities, setActivities] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch("/api/analytics/recent?limit=8")
      .then((res) => {
        if (!mounted) return
        setActivities(res.data || [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load activities")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Card className="p-6">Loading activities...</Card>
  if (error) return <Card className="p-6 text-sm text-red-600">Error: {String(error)}</Card>

  const pickIcon = (item: any) => {
    if (item.type === "certificate") return Award
    if (item.type === "enrollment") return BookOpen
    if (item.type === "engagement") return UserPlus
    return AlertCircle
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{"Recent Activity"}</h2>
        <p className="text-sm text-muted-foreground">{"Latest platform events"}</p>
      </div>

      <div className="space-y-4">
        {activities && activities.length === 0 && <div className="text-sm text-muted-foreground">No recent activity.</div>}
        {activities?.map((activity) => {
          const Icon = pickIcon(activity)
          const title = activity.eventType || activity.type || (activity.title || '')
          const desc = activity.eventData ? JSON.stringify(activity.eventData) : activity.description || activity.courseId || ''
          const time = activity.timestamp || activity.issuedDate || activity.enrolledAt || ''

          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
                <p className="mt-1 text-xs text-muted-foreground">{time ? new Date(time).toLocaleString() : ''}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
