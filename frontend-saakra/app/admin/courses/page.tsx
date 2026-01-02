"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, BookOpen, TrendingUp } from "lucide-react"
import apiFetch from "@/lib/api"

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch("/api/courses")
      .then((res) => {
        if (!mounted) return
        setCourses(Array.isArray(res) ? res : [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load courses")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return courses
    return courses.filter((course) =>
      (course.title || "").toLowerCase().includes(term) || (course.level || "").toLowerCase().includes(term)
    )
  }, [courses, query])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{"Course Management"}</h1>
            <p className="text-muted-foreground">{"Manage all courses and curriculum"}</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {"Add Course"}
          </Button>
        </div>

        <Card className="mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </Card>

        {loading && <div className="p-4 text-sm text-muted-foreground">Loading courses...</div>}
        {error && <div className="p-4 text-sm text-red-600">Error loading courses: {String(error)}</div>}

        <div className="space-y-4">
          {!loading && filteredCourses.length === 0 && (
            <Card className="p-6 text-sm text-muted-foreground">No courses found.</Card>
          )}
          {filteredCourses.map((course) => {
            const studentCount = course.students ? course.students.length : 0
            const modulesCount = course.modules ? course.modules.length : 0
            const completionRate = course.completionRate || course.averageCompletion || 0
            return (
              <Card key={course.id} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{course.title || "Untitled course"}</h3>
                      <Badge variant={course.status === "published" || course.status === "active" ? "default" : "secondary"}>
                        {course.status || "draft"}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {"Trainer: "}
                      {course.trainerName || course.trainerId || "Not assigned"}
                    </p>
                    <Badge variant="outline">{course.level || ""}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-6 lg:w-96">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                      </div>
                      <p className="mt-1 text-2xl font-bold">{studentCount}</p>
                      <p className="text-xs text-muted-foreground">{"Students"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <p className="mt-1 text-2xl font-bold">{modulesCount}</p>
                      <p className="text-xs text-muted-foreground">{"Modules"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <p className="mt-1 text-2xl font-bold text-primary">{completionRate}%</p>
                      <p className="text-xs text-muted-foreground">{"Completion"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {"Edit"}
                    </Button>
                    <Button size="sm" variant="outline">
                      {"View Details"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
