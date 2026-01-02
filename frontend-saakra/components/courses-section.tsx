"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import apiFetch from "@/lib/api"

export function CoursesSection() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiFetch("/api/public/courses")
      .then((data) => {
        if (!mounted) return
        const list = Array.isArray(data) ? data : []
        setCourses(list)
      })
      .catch((err) => {
        console.error("CoursesSection: failed to load courses", err)
        if (mounted) setCourses([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="courses" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            {"Courses Designed for "}
            <span className="text-primary">{"Every Stage"}</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
            {
              "From foundational skills to advanced technical expertise, we have pathways for students at every education level."
            }
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {loading && <div className="col-span-3 text-center text-muted-foreground">Loading courses...</div>}
          {!loading && courses.length === 0 && (
            <div className="col-span-3 text-center text-muted-foreground">No courses available right now.</div>
          )}

          {!loading && courses.map((course) => (
            <Card
              key={course.level}
              className="relative overflow-hidden border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50`} />

              <div className="mb-4">
                <Badge variant="secondary" className="mb-3">
                  {course.level || course.category || "Course"}
                </Badge>
                <h3 className="mb-3 text-2xl font-bold text-foreground">{course.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{course.description || "Explore this course to learn more."}</p>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{(course.students && course.students.length) || course.enrolledCount || 0} enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{Array.isArray(course.modules) ? course.modules.length : 0} modules</span>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                {(Array.isArray(course.modules) ? course.modules.slice(0, 4) : []).map((module: any, idx: number) => (
                  <div key={module?.id || module?.title || idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-foreground">{module?.title || module}</span>
                  </div>
                ))}
              </div>

              <Link href={`/student/course/${course.id}`}>
                <Button className="group w-full">
                  {"Explore Course"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
