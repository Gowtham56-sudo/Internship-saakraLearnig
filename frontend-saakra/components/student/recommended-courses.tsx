"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiFetch from "@/lib/api"

export function RecommendedCourses() {
  const [courses, setCourses] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [enrollingIds, setEnrollingIds] = useState<Record<string, boolean>>({})
  const [enrolledIds, setEnrolledIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await (await import("@/lib/api")).default("/api/public/courses")
        if (mounted) setCourses(Array.isArray(data) ? data.slice(0, 4) : [])
      } catch (err: any) {
        if (mounted) setError(err?.body?.error || err?.body || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Card className="p-6">Loading recommendations…</Card>
  if (error) return <Card className="p-6">Error: {error}</Card>
  if (!courses || courses.length === 0) return <Card className="p-6">No recommendations yet.</Card>

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{"Recommended"}</h2>
        <Button variant="ghost" size="sm">
          {"See More"}
        </Button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group rounded-lg border border-border/50 p-3 transition-colors hover:border-primary/50"
          >
            <div className="mb-2 overflow-hidden rounded-md">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="h-24 w-full object-cover"
              />
            </div>
            <Badge variant="secondary" className="mb-1 text-xs">
              {course.level}
            </Badge>
            <h3 className="mb-2 text-sm font-semibold">{course.title}</h3>
            <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span>{course.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{course.duration}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              onClick={async () => {
                if (enrolledIds[course.id]) return
                setEnrollingIds((s) => ({ ...s, [course.id]: true }))
                try {
                  await apiFetch("/api/courses/enroll", { method: "POST", body: JSON.stringify({ courseId: course.id }) })
                  setEnrolledIds((s) => ({ ...s, [course.id]: true }))
                  toast({ title: "Enrolled", description: `Enrolled in ${course.title}` })
                  try {
                    if (typeof window !== 'undefined') window.location.reload()
                  } catch (e) {
                    // ignore
                  }
                } catch (err: any) {
                  console.error("Enroll failed", err)
                  toast({ title: "Enrollment failed", description: err?.message || String(err) })
                } finally {
                  setEnrollingIds((s) => ({ ...s, [course.id]: false }))
                }
              }}
              disabled={!!enrollingIds[course.id] || !!enrolledIds[course.id]}
            >
              {enrolledIds[course.id] ? "Enrolled" : enrollingIds[course.id] ? "Enrolling…" : "Enroll Now"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
