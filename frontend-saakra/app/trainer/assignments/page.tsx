"use client"

import { useState, useEffect } from "react"
import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Clock, CheckCircle, AlertCircle, PlusCircle } from "lucide-react"
import { ReviewSubmissionDialog } from "@/components/trainer/review-submission-dialog"
import { CreateAssignmentDialog } from "@/components/trainer/create-assignment-dialog"
import apiFetch from "@/lib/api"

export default function TrainerAssignmentsPage() {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAssignments() {
    setLoading(true)
    try {
      const me = await apiFetch("/api/auth/me")
      const all = await apiFetch("/api/courses")
      const trainerId = me?.uid
      const trainerCourses = Array.isArray(all) ? all.filter((c: any) => c.trainerId === trainerId) : []

      const agg: any[] = []
      for (const c of trainerCourses) {
        try {
          const res = await apiFetch(`/api/assessments/course/${c.id}`)
          const list = res && Array.isArray(res.assessments) ? res.assessments : []
          list.filter((a: any) => a.type === "assignment").forEach((a: any) => agg.push({ ...a, course: c.title }))
        } catch (e) {
          console.warn("Failed to load assessments for course", c.id, e)
        }
      }

      setAssignments(agg)

      // Recent submissions: load recent assessment_submissions via optimized endpoint
      try {
        const recent = await apiFetch("/api/optimization/assessments/recent?limit=10")
        const subs = Array.isArray(recent?.data) ? recent.data : []

        // collect unique userIds and assessmentIds
        const userIds = Array.from(new Set(subs.map((s: any) => s.userId).filter(Boolean)))
        const assessmentIds = Array.from(new Set(subs.map((s: any) => s.assessmentId).filter(Boolean)))

        // fetch user profiles (fall back per-user)
        const userMap: Record<string, any> = {}
        await Promise.all(
          userIds.map(async (uid: string) => {
            try {
              const u = await apiFetch(`/api/users/${uid}`)
              userMap[uid] = u?.name || u?.displayName || "Unknown"
            } catch (e) {
              userMap[uid] = "Unknown"
            }
          })
        )

        // fetch assessment titles
        const assessmentMap: Record<string, any> = {}
        await Promise.all(
          assessmentIds.map(async (aid: string) => {
            try {
              const a = await apiFetch(`/api/assessments/${aid}`)
              assessmentMap[aid] = a?.title || "Assignment"
            } catch (e) {
              assessmentMap[aid] = "Assignment"
            }
          })
        )

        const recentMapped = subs.map((s: any) => ({
          id: s.id,
          studentName: userMap[s.userId] || "Unknown",
          assignment: assessmentMap[s.assessmentId] || s.assessmentId,
          submittedAt: new Date(s.submittedAt).toLocaleString(),
          status: s.passed ? "graded" : "pending",
        }))

        setRecentSubmissions(recentMapped)
      } catch (e) {
        console.warn("Failed to load recent submissions", e)
        setRecentSubmissions([])
      }
    } catch (err) {
      console.error("Failed to load assignments", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  const handleReview = (submission: any) => {
    setSelectedSubmission(submission)
    setReviewDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Manage and review student submissions</p>
          </div>
          <CreateAssignmentDialog onCreated={loadAssignments} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Active Assignments</h2>
              <div className="space-y-4">
                {loading && <div className="text-muted-foreground">Loading assignments...</div>}
                {!loading && assignments.length === 0 && <div className="text-muted-foreground">No assignments found.</div>}
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      </div>
                      <Badge variant="secondary">{assignment.pending ?? 0} pending</Badge>
                    </div>

                    <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Due{" "}
                          {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>
                          {assignment.submissions ?? 0}/{assignment.totalStudents ?? 0} submitted
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{assignment.pending ?? 0} to review</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{assignment.reviewed ?? 0} reviewed</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" asChild>
                        <a href={`/trainer/assignments/${assignment.id}`}>Review Submissions</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Recent Submissions</h2>
              <div className="space-y-4">
                {recentSubmissions.length === 0 && <div className="text-muted-foreground">No recent submissions.</div>}
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>{submission.studentName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Badge variant={submission.status === "pending" ? "secondary" : "default"} className="text-xs">
                        {submission.status}
                      </Badge>
                    </div>
                    <p className="mb-1 text-sm font-medium">{submission.studentName}</p>
                    <p className="mb-2 text-xs text-muted-foreground">{submission.assignment}</p>
                    <p className="text-xs text-muted-foreground">{submission.submittedAt}</p>
                    {submission.status === "pending" && (
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-transparent"
                        variant="outline"
                        onClick={() => handleReview(submission)}
                      >
                        Review Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{recentSubmissions.filter(s => s.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{recentSubmissions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{assignments.length}</p>
                  <p className="text-sm text-muted-foreground">Active Assignments</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {selectedSubmission && (
        <ReviewSubmissionDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          submission={selectedSubmission}
        />
      )}
    </div>
  )
}
