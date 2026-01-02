"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Video, FileText, Settings } from "lucide-react"
import { CreateCourseDialog } from "@/components/trainer/create-course-dialog"
import apiFetch from "@/lib/api"

export function CourseManagement() {
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
        console.error("CourseManagement: failed to load courses", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Tabs defaultValue="active" className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">Active Courses</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <CreateCourseDialog />
          </div>

          <TabsContent value="active">
            <div className="grid gap-6 md:grid-cols-2">
              {loading && <div className="col-span-2">Loading...</div>}
              {!loading && courses.length === 0 && (
                <div className="col-span-2 text-muted-foreground">No courses found.</div>
              )}

              {courses
                .filter((course) => (course.status || "published") === "published")
                .map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute right-3 top-3 bg-background/90">{course.status || "published"}</Badge>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <Badge variant="secondary" className="mb-2">
                          {course.level || "Course"}
                        </Badge>
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{(course.students && course.students.length) || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{(course.modules && course.modules.length) || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Video className="h-4 w-4" />
                          <span>{course.videos || 0} videos</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{course.assignments || 0} assignments</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg. Progress</span>
                          <span className="font-medium">{course.avgProgress || 0}%</span>
                        </div>
                        <Progress value={course.avgProgress || 0} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent" asChild>
                          <a href={`/trainer/courses/${course.id}`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </a>
                        </Button>
                        <Button className="flex-1" asChild>
                          <a href={`/trainer/courses/${course.id}`}>View Details</a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="draft">
            <div className="grid gap-6 md:grid-cols-2">
              {courses
                .filter((course) => (course.status || "published") === "draft")
                .map((course) => (
                  <Card key={course.id} className="overflow-hidden opacity-75">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute right-3 top-3 bg-background/90" variant="secondary">
                        {course.status || "draft"}
                      </Badge>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <Badge variant="secondary" className="mb-2">
                          {course.level || "Course"}
                        </Badge>
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{(course.modules && course.modules.length) || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Video className="h-4 w-4" />
                          <span>{course.videos || 0} videos</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Edit
                        </Button>
                        <Button className="flex-1">Publish</Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No archived courses yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
