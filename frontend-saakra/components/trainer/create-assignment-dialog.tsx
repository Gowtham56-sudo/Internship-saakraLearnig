"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiFetch from "@/lib/api"
import { useEffect } from "react"

export function CreateAssignmentDialog({ courseId, onCreated }: { courseId?: string; onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(courseId)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please enter assignment title", variant: "destructive" })
      return
    }

    const finalCourseId = courseId || selectedCourseId
    if (!finalCourseId) {
      toast({ title: "Missing course", description: "Please select a course for this assignment", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        courseId: finalCourseId,
        title,
        type: "assignment",
        description,
        dueDate: dueDate || null,
      }

      await apiFetch("/api/assessments/create", { method: "POST", body: JSON.stringify(payload) })

      toast({ title: "Assignment Created", description: `${title} created successfully` })
      setOpen(false)
      setTitle("")
      setDescription("")
      setDueDate("")
      if (typeof onCreated === "function") onCreated()
    } catch (err: any) {
      console.error("CreateAssignment failed", err)
      toast({ title: "Create failed", description: err?.message || String(err), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // load trainer courses when dialog opens (only when no courseId prop provided)
    if (!open) return
    if (courseId) {
      setSelectedCourseId(courseId)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const all = await apiFetch("/api/courses")
        if (cancelled) return
        setCourses(Array.isArray(all) ? all : [])
        if (all && all.length > 0) setSelectedCourseId(all[0].id || all[0].docId || all[0].courseId)
      } catch (e) {
        // ignore - courses may require auth
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, courseId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!courseId && (
            <div>
              <Label>Course</Label>
              {courses.length === 0 ? (
                <div className="text-sm text-muted-foreground">Loading courses...</div>
              ) : (
                <select
                  className="w-full rounded-md border p-2"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map((c: any) => (
                    <option key={c.id || c.docId || c.courseId} value={c.id || c.docId || c.courseId}>
                      {c.title || c.name || c.courseName || `Course ${c.id || c.docId || c.courseId}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
