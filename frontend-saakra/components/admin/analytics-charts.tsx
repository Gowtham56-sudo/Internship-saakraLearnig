"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import apiFetch from "@/lib/api"

export function AnalyticsCharts() {
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([apiFetch("/api/analytics/admin"), apiFetch("/api/courses")])
      .then(([analyticsRes, coursesRes]) => {
        if (!mounted) return
        setAnalytics(analyticsRes)
        setCourses(Array.isArray(coursesRes) ? coursesRes : [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load analytics")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const courseNameMap = useMemo(() => {
    const map = new Map<string, string>()
    courses.forEach((course) => {
      if (course?.id) {
        map.set(course.id, course.title || "Untitled course")
      }
    })
    return map
  }, [courses])

  if (loading) return <Card className="p-6">Loading analytics...</Card>
  if (error) return <Card className="p-6 text-sm text-red-600">Error loading analytics: {String(error)}</Card>

  const topCourses = analytics?.courseMetrics?.topCompletedCourses || []
  const enrollmentData = topCourses.map((c: any) => ({
    course: courseNameMap.get(c.courseId) ?? c.courseId,
    enrolled: typeof c.total === "number" ? c.total : c.totalEnrollments || 0,
  }))

  const completionData = topCourses.map((c: any) => ({
    course: courseNameMap.get(c.courseId) ?? c.courseId,
    completionRate: c.completionRate || 0,
  }))

  const assessmentMetrics = analytics?.assessmentMetrics || {}
  const assessmentData = [
    { label: "Avg Score", value: assessmentMetrics.averageAssessmentScore || 0 },
    { label: "Pass Rate", value: assessmentMetrics.averagePassRate || 0 },
    { label: "Submissions", value: assessmentMetrics.totalAssessmentSubmissions || 0 },
  ]

  const enrollmentTotal = analytics?.overview?.totalCourseEnrollments ?? 0
  const completionAverage = analytics?.courseMetrics?.averageCompletionRate ?? 0
  const certificateMetrics = analytics?.certificateMetrics || {}

  return (
    <Card className="p-6">
      <Tabs defaultValue="enrollment" className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{"Platform Analytics"}</h2>
          <TabsList>
            <TabsTrigger value="enrollment">{"Enrollment"}</TabsTrigger>
            <TabsTrigger value="completion">{"Completion"}</TabsTrigger>
            <TabsTrigger value="assessments">{"Assessments"}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="enrollment" className="space-y-4">
          <div className="h-[300px]">
            {enrollmentData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No enrollment data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="course" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">{"Enrolled"}</span>
                                <span className="text-sm font-bold">{payload[0].value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="enrolled" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{"Total enrollments"}</span>
            <span className="font-semibold">{enrollmentTotal}</span>
          </div>
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <div className="h-[300px]">
            {completionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No completion data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="course" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">{"Completion"}</span>
                                <span className="text-sm font-bold">{payload[0].value}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{"Average completion rate"}</span>
            <span className="font-semibold">{completionAverage}%</span>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">{payload[0].payload.label}</span>
                              <span className="text-sm font-bold">{payload[0].value}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{"Certificates"}</span>
            <span className="font-semibold">
              {(certificateMetrics.totalIssued || 0).toLocaleString()} total • {(certificateMetrics.activeCount || 0).toLocaleString()} active
            </span>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
