"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import apiFetch from "@/lib/api"

type Course = {
  id: string | number
  title: string
  level?: string
  progress?: number
  currentModule?: string
  completedModules?: number
  totalModules?: number
  nextSession?: string
  thumbnail?: string
}

export function CourseProgress() {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        // Use dashboard endpoint so we show only enrolled courses for the student
        const data = await apiFetch("/api/dashboard")
        // backend returns courses in res.courses
        const my = Array.isArray(data?.courses) ? data.courses : []
        // Deduplicate courses by id to avoid duplicate React keys
        const uniqueById = Array.from(
          my.reduce((m, c) => {
            if (c && c.id != null && !m.has(String(c.id))) m.set(String(c.id), c)
            return m
          }, new Map())
          .values(),
        )
        if (mounted) setCourses(uniqueById)
      } catch (err: any) {
        console.error("Failed loading courses", err)
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

  if (loading) return <Card className="p-6">Loading courses…</Card>
  if (error) return <Card className="p-6">Error loading courses: {error}</Card>
  if (!courses || courses.length === 0)
    return <Card className="p-6">No courses found for your account.</Card>

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{"My Learning Path"}</h2>
        <Button variant="outline" size="sm">
          {"View All"}
        </Button>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative overflow-hidden rounded-lg sm:w-48">
                <img
                  src={(course.thumbnail as string) || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                    <PlayCircle className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {course.level}
                    </Badge>
                    <h3 className="font-semibold">{course.title}</h3>
                  </div>
                  <span className="text-sm font-medium text-primary">{course.progress ?? 0}%</span>
                </div>

                <p className="mb-3 text-sm text-muted-foreground">
                  {"Current: "}
                  <span className="text-foreground">{course.currentModule ?? "—"}</span>
                </p>

                <Progress value={course.progress ?? 0} className="mb-3 h-2" />

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {course.completedModules ?? 0}/{course.totalModules ?? 0} modules
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.nextSession ?? "—"}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/student/course/${course.id}`}>
                    <Button size="sm">{"Continue Learning"}</Button>
                  </Link>
                  <Link href={`/student/course/${course.id}`}>
                    <Button size="sm" variant="outline">
                      {"View Details"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
