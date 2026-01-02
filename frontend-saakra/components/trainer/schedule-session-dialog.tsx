"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ScheduleSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string | null
  onSaved?: () => void
}

export function ScheduleSessionDialog({ open, onOpenChange, sessionId, onSaved }: ScheduleSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])

  const [courseId, setCourseId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [type, setType] = useState("online")
  const [maxStudents, setMaxStudents] = useState<string | number | undefined>(undefined)
  const [meetingLink, setMeetingLink] = useState("")

  const resetForm = () => {
    setCourseId(undefined)
    setTitle("")
    setDescription("")
    setDate("")
    setStartTime("")
    setDuration("60")
    setType("online")
    setMaxStudents(undefined)
    setMeetingLink("")
  }

  useEffect(() => {
    if (!open) return
    // load courses for selector
    ;(async () => {
      try {
        const all = await (await import("@/lib/api")).default("/api/courses")
        setCourses(Array.isArray(all) ? all : [])
        if (all && all.length > 0) setCourseId(all[0].id || all[0].docId || all[0].courseId)
      } catch (e) {
        // ignore
      }
    })()
  }, [open])

  useEffect(() => {
    // if editing, fetch session details
    if (!open || !sessionId) return
    let cancelled = false
    ;(async () => {
      try {
        const s = await (await import("@/lib/api")).default(`/api/sessions/${sessionId}`)
        if (cancelled) return
        setCourseId(s.courseId)
        setTitle(s.title || "")
        setDescription(s.description || "")
        setDate(s.date || "")
        setStartTime(s.startTime || "")
        setDuration(String(s.duration || "60"))
        setType(s.type || "online")
        setMaxStudents(s.maxStudents || undefined)
        setMeetingLink(s.meetingLink || "")
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, sessionId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!courseId) {
      toast({ title: "Missing course", description: "Please select a course", variant: "destructive" })
      return
    }
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please enter a title", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      const payload: any = {
        courseId,
        title,
        description,
        date,
        startTime,
        duration: Number(duration),
        type,
        maxStudents: maxStudents ? Number(maxStudents) : null,
        meetingLink: meetingLink || null,
      }

      if (sessionId) {
        await (await import("@/lib/api")).default(`/api/sessions/${sessionId}`, { method: "PUT", body: JSON.stringify(payload) })
        toast({ title: "Session Updated", description: "Session was updated successfully" })
      } else {
        await (await import("@/lib/api")).default("/api/sessions", { method: "POST", body: JSON.stringify(payload) })
        toast({ title: "Session Scheduled", description: "Your session has been scheduled." })
      }

      setIsSubmitting(false)
      onOpenChange(false)
      resetForm()
      if (typeof onSaved === "function") onSaved()
    } catch (err: any) {
      console.error("Schedule session failed", err)
      toast({ title: "Error", description: err?.message || String(err), variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sessionId ? "Edit Session" : "Schedule New Session"}</DialogTitle>
          <DialogDescription>
            {sessionId ? "Update the details of your live session." : "Create a new live session for your students."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <select
                id="course"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="">Choose a course</option>
                {courses.map((c) => (
                  <option key={c.id || c.docId || c.courseId} value={c.id || c.docId || c.courseId}>
                    {c.title || c.name || c.courseName || (c.id || c.docId || c.courseId)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input id="title" placeholder="e.g., React Hooks Deep Dive" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe what students will learn in this session..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input id="time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-md border p-2" required>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Session Type</Label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border p-2" required>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-students">Maximum Students</Label>
              <Input id="max-students" type="number" placeholder="50" min="1" max="100" value={String(maxStudents || "")} onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : undefined)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-link">Meeting Link (Optional)</Label>
              <Input id="meeting-link" type="url" placeholder="https://meet.google.com/..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : sessionId ? "Update Session" : "Schedule Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
