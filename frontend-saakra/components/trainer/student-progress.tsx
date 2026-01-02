"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown } from "lucide-react"
import apiFetch from "@/lib/api"

export function StudentProgress() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await apiFetch("/api/auth/me")
        const all = await apiFetch("/api/courses")
        const uid = me?.uid
        const trainerCourses = Array.isArray(all) ? all.filter((c: any) => c.trainerId === uid) : []

        if (trainerCourses.length === 0) {
          if (mounted) setStudents([])
          return
        }

        // pick first course to show student progress
        const courseId = trainerCourses[0].id
        const res = await apiFetch(`/api/courses/${courseId}/students`)
        const list = res?.students || []

        if (!mounted) return
        // Deduplicate returned students by id/email to avoid duplicate React keys
        const seen = new Set()
        const uniqueList: any[] = []
        for (const s of list) {
          const key = String(s.id || s.uid || s.userId || s.email || JSON.stringify(s))
          if (seen.has(key)) continue
          seen.add(key)
          uniqueList.push(s)
        }

        // attach a safe progress value if present
        const prepared = uniqueList.map((s: any, idx: number) => ({
          id: s.id || idx,
          name: s.name || s.email || "Student",
          avatar: s.avatar || "/diverse-students-studying.png",
          course: trainerCourses[0].title,
          progress: s.progress?.completedPercentage || s.progress || 0,
          trend: s.progressTrend || "up",
          change: s.progressChange || "+0%",
        }))

        setStudents(prepared)
      } catch (err) {
        console.error("StudentProgress: failed to load", err)
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
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{"Top Performers"}</h2>
        <p className="text-sm text-muted-foreground">{"This week's progress leaders"}</p>
      </div>

      <div className="space-y-4">
        {students.length === 0 && <div className="text-muted-foreground">No student progress available.</div>}
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {index + 1}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{student.name}</p>
                <div className="flex items-center gap-1 text-xs">
                  {student.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={student.trend === "up" ? "text-green-500" : "text-red-500"}>{student.change}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{student.course}</p>
              <Progress value={student.progress} className="mt-2 h-1.5" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
