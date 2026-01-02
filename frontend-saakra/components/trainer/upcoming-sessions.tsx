"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video } from "lucide-react"
import apiFetch from "@/lib/api"

export function UpcomingSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const list = await apiFetch("/api/sessions")
        if (!mounted) return
        const arr = Array.isArray(list) ? list : []
        // sort by date/time descending
        const normalized = arr
          .map((s: any) => ({
            ...s,
            date: s.date || "TBD",
            time: s.startTime || s.time || "TBD",
            duration: s.duration || "60 min",
            registered: s.maxStudents || 0,
            status: s.status || "scheduled",
          }))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setSessions(normalized)
      } catch (err) {
        console.error("UpcomingSessions: failed to load", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Card className="p-6">Loading...</Card>

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{"Upcoming Sessions"}</h2>
        <Button variant="ghost" size="sm" asChild>
          <a href="/trainer/schedule">{"View All"}</a>
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 && <div className="text-muted-foreground">No upcoming sessions.</div>}
        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg border border-border/50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>{session.status}</Badge>
            </div>

            <h3 className="mb-1 font-semibold">{session.title}</h3>
            <p className="mb-3 text-sm text-muted-foreground">{session.course}</p>

            <div className="mb-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {session.date}, {session.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{session.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>{session.registered} registered</span>
              </div>
            </div>

            <Button size="sm" className="w-full" variant={session.status === "confirmed" ? "default" : "outline"}>
              <Video className="mr-2 h-4 w-4" />
              {session.status === "confirmed" ? "Start Session" : "Review Details"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
