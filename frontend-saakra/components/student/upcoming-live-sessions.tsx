"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Users } from "lucide-react"
import apiFetch from "@/lib/api"

export function UpcomingLiveSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSessions() {
    setLoading(true)
    try {
      const data = await apiFetch("/api/sessions")
      // API returns array of sessions; each may include trainerName
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load sessions", err)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{"Live Sessions"}</h2>
        <Button variant="ghost" size="sm">
          {"View All"}
        </Button>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-muted-foreground">Loading sessions...</div>}
        {!loading && sessions.length === 0 && <div className="text-muted-foreground">No upcoming sessions.</div>}

        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg border border-border/50 p-4">
            <Badge variant="secondary" className="mb-2">
              {session.course}
            </Badge>
            <h3 className="mb-2 font-semibold">{session.title}</h3>
            <p className="mb-3 text-sm text-muted-foreground">{session.trainerName || session.trainerId || session.trainer}</p>

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
                <span>{session.attendees} registered</span>
              </div>
            </div>

            <Button size="sm" className="w-full">
              <Video className="mr-2 h-4 w-4" />
              {"Join Session"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
