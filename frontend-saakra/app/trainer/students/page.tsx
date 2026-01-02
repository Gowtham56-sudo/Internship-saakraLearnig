"use client"

import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Search, Mail, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import apiFetch from "@/lib/api"

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await apiFetch("/api/auth/me")
        const all = await apiFetch("/api/courses")
        const trainerId = me?.uid
        const trainerCourses = Array.isArray(all) ? all.filter((c: any) => c.trainerId === trainerId) : []

        const studentMap = new Map()
        for (const c of trainerCourses) {
          try {
            const res = await apiFetch(`/api/courses/${c.id}/students`)
            const list = res && Array.isArray(res.students) ? res.students : []
            list.forEach((s: any) => {
              if (!studentMap.has(s.id)) {
                studentMap.set(s.id, { ...s, course: c.title })
              }
            })
          } catch (e) {
            console.warn("Failed to load students for course", c.id, e)
          }
        }

        if (!mounted) return
        setStudents(Array.from(studentMap.values()))
      } catch (err) {
        console.error("TrainerStudents: failed to load", err)
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
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{"My Students"}</h1>
            <p className="text-muted-foreground">{"Monitor and support your students' learning journey"}</p>
          </div>
          <Button>{"Export Report"}</Button>
        </div>

        <Card className="mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search students by name, email, or course..." className="pl-9" />
          </div>
        </Card>

        <div className="space-y-4">
          {loading && <div className="text-muted-foreground">Loading students...</div>}
          {!loading && students.length === 0 && <div className="text-muted-foreground">No students found.</div>}
          {students.map((student) => (
            <Card key={student.id} className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-user.jpg" alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold">{student.name}</h3>
                      {student.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <Badge variant="secondary" className="mt-2">{student.course || "—"}</Badge>
                  </div>
                </div>

                <div className="flex-1 space-y-3 lg:max-w-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{"Progress"}</span>
                    <span className="font-medium">{(student.progress?.completedPercentage ?? student.progress ?? 0)}%</span>
                  </div>
                  <Progress value={student.progress?.completedPercentage ?? student.progress ?? 0} />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{"Assignments"}</span>
                    <span className="font-medium">
                      {student.assignments?.completed ?? 0}/{student.assignments?.total ?? 0}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {"Last active: "}
                    {student.lastActive || "—"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    {"Email"}
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {"Message"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
