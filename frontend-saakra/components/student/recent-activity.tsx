"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Video, FileText, Award } from "lucide-react"
import { useEffect, useState } from "react"
import apiFetch from "@/lib/api"

export function RecentActivity() {
  const [activities, setActivities] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    apiFetch("/api/dashboard")
      .then((res: any) => {
        if (!mounted) return
        setActivities(Array.isArray(res?.activities) ? res.activities : [])
      })
      .catch((err: any) => {
        console.error("RecentActivity: /api/dashboard failed", err)
        if (mounted) setError(err?.body?.error || err?.body || String(err))
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Card className="p-6">Loading activity…</Card>
  if (error) return <Card className="p-6">Error loading activity: {error}</Card>
  if (!activities || activities.length === 0) return <Card className="p-6">No recent activity.</Card>

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">{"Recent Activity"}</h2>

      <div className="space-y-4">
        {activities.map((activity: any, idx: number) => {
          const Icon = activity.type === "video" ? Video : activity.type === "certificate" ? Award : activity.type === "assignment" ? FileText : CheckCircle2
          const color = activity.type === "video" ? "text-blue-500" : activity.type === "certificate" ? "text-primary" : activity.type === "assignment" ? "text-accent" : "text-green-500"
          const formatTimestamp = (t: any) => {
            if (!t) return ""
            // Firestore Timestamp { _seconds, _nanoseconds }
            if (typeof t === "object" && t._seconds != null) {
              try {
                return new Date(t._seconds * 1000).toLocaleString()
              } catch (e) {
                return String(t)
              }
            }
            // ISO string or plain date string
            if (typeof t === "string") return new Date(t).toLocaleString()
            // JS Date
            if (t instanceof Date) return t.toLocaleString()
            return String(t)
          }

          return (
            <div key={activity.id || idx} className="flex gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.content || activity.title}</p>
                <p className="text-sm text-muted-foreground">{formatTimestamp(activity.timestamp || activity.time)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
