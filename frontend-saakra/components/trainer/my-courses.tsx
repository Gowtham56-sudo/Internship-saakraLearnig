"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, Video, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import apiFetch from "@/lib/api"

export function MyCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await apiFetch("/api/auth/me")
        const all = await apiFetch("/api/courses")
        const uid = me?.uid
        const trainerCourses = Array.isArray(all) ? all.filter((c: any) => c.trainerId === uid) : []
        if (!mounted) return
        setCourses(trainerCourses)
      } catch (err) {
        console.error("MyCourses: failed to load", err)
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{"My Courses"}</h2>
        <Button variant="outline" size="sm" asChild>
          <a href="/trainer/courses">{"View All"}</a>
        </Button>
      </div>

      <div className="space-y-4">
        {courses.length === 0 && <div className="text-muted-foreground">No courses found.</div>}
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <div className="flex gap-4">
              <div className="overflow-hidden rounded-lg w-32 h-20">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {course.level || "Course"}
                    </Badge>
                    <h3 className="font-semibold">{course.title}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{"Edit Course"}</DropdownMenuItem>
                      <DropdownMenuItem>{"View Students"}</DropdownMenuItem>
                      <DropdownMenuItem>{"Schedule Session"}</DropdownMenuItem>
                      <DropdownMenuItem>{"Course Settings"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.students?.length || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {course.completedModules || 0}/
                      {Array.isArray(course.modules) ? course.modules.length : typeof course.modules === 'number' ? course.modules : 0} modules
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />
                    <span>{course.nextSession || "TBD"}</span>
                  </div>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <Progress value={course.avgProgress || 0} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">{course.avgProgress || 0}% avg</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/trainer/courses/${course.id}`}>{"View Details"}</a>
                  </Button>
                  <Button size="sm">{"Start Session"}</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
