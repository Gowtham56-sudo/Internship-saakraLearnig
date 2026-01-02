"use client"

import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video, MapPin, Plus } from "lucide-react"
import { ScheduleSessionDialog } from "@/components/trainer/schedule-session-dialog"
import { UpdateOfficeHoursDialog } from "@/components/trainer/update-office-hours-dialog"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function TrainerSchedulePage() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showOfficeHoursDialog, setShowOfficeHoursDialog] = useState(false)
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const { toast } = useToast()
  const [sessions, setSessions] = useState<any[]>([])

  const loadSessions = async () => {
    try {
      const list = await (await import("@/lib/api")).default("/api/sessions")
      setSessions(Array.isArray(list) ? list : [])
    } catch (e) {
      console.error("Failed to load sessions", e)
      setSessions([])
    }
  }

  useState(() => {
    // placeholder to keep linter happy; real load in useEffect
  })

  // load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const handleJoinSession = (sessionId: number) => {
    toast({
      title: "Joining Session",
      description: "Redirecting to the live session...",
    })
    // In production, this would redirect to the actual video session
  }

  const handleEditSession = (sessionId: number) => {
    setEditingSession(sessionId)
    setShowScheduleDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{"My Schedule"}</h1>
            <p className="text-muted-foreground">{"Manage your live sessions and office hours"}</p>
          </div>
          <Button onClick={() => { setEditingSession(null); setShowScheduleDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {"Schedule Session"}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {"All"}
              </Button>
              <Button variant="ghost" size="sm">
                {"This Week"}
              </Button>
              <Button variant="ghost" size="sm">
                {"This Month"}
              </Button>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="font-semibold">{session.title}</h3>
                        <Badge variant="secondary">{session.status}</Badge>
                      </div>

                      <p className="mb-4 text-sm text-muted-foreground">{session.course || session.courseId}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {session.date ? new Date(session.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            }) : "Date not set"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{session.startTime || "Time not set"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{session.students} students enrolled</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {session.type === "online" ? (
                            <>
                              <Video className="h-4 w-4" />
                              <span>{"Online Session"}</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              <span>{"In-Person Session"}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col">
                      <Button size="sm" onClick={() => handleJoinSession(session.id)}>
                        {"Join Session"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingSession(session.id); setShowScheduleDialog(true); }}>
                        {"Edit"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">{"Quick Stats"}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{sessions.length}</p>
                  <p className="text-sm text-muted-foreground">{"Sessions listed"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{sessions.filter(s => s.status === "scheduled").length}</p>
                  <p className="text-sm text-muted-foreground">{"Upcoming sessions"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{sessions.reduce((acc, s) => acc + (s.maxStudents || 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">{"Total seats"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">{"Office Hours"}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{"Monday"}</span>
                  <span>{"2:00 PM - 4:00 PM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{"Wednesday"}</span>
                  <span>{"3:00 PM - 5:00 PM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{"Friday"}</span>
                  <span>{"1:00 PM - 3:00 PM"}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full bg-transparent"
                onClick={() => setShowOfficeHoursDialog(true)}
              >
                {"Update Hours"}
              </Button>
            </Card>
          </div>
        </div>

        <ScheduleSessionDialog
          open={showScheduleDialog}
          onOpenChange={(open) => { setShowScheduleDialog(open); if (!open) setEditingSession(null); }}
          sessionId={editingSession}
          onSaved={loadSessions}
        />
        <UpdateOfficeHoursDialog open={showOfficeHoursDialog} onOpenChange={setShowOfficeHoursDialog} />
      </main>
    </div>
  )
}
