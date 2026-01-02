"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { ReviewSubmissionDialog } from "./review-submission-dialog"

export function RecentSubmissions() {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const me = await (await import("@/lib/api")).default("/api/auth/me")
        // For now, fetch recent submissions for trainer via analytics endpoint
        const data = await (await import("@/lib/api")).default(`/api/analytics/user/${me.uid}`)
        // Try to build submissions from recent events or assessments
        const recent = data?.recentSubmissions || []
        if (!mounted) return
        setSubmissions(recent)
      } catch (err) {
        console.error("RecentSubmissions: failed to load", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleReview = (submission: any) => {
    setSelectedSubmission(submission)
    setReviewDialogOpen(true)
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{"Recent Submissions"}</h2>
          <Button variant="outline" size="sm" asChild>
            <a href="/trainer/assignments">{"View All"}</a>
          </Button>
        </div>

        <div className="space-y-4">
            {loading && <div>Loading...</div>}
            {!loading && submissions.length === 0 && <div className="text-muted-foreground">No recent submissions.</div>}
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={submission.studentAvatar || submission.avatar || "/placeholder.svg"} alt={submission.studentName || submission.student || submission.name} />
                  <AvatarFallback>{(submission.studentName || submission.student || submission.name || "?").charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{submission.studentName || submission.student || submission.name}</h3>
                      <p className="text-sm text-muted-foreground">{submission.assignment || submission.title || submission.activity}</p>
                    </div>
                    <Badge variant={submission.status === "pending" ? "secondary" : "default"}>{submission.status || "pending"}</Badge>
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{submission.course || submission.courseTitle || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{submission.submittedAt || submission.timestamp || "-"}</span>
                    </div>
                  </div>

                  {submission.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {"View"}
                      </Button>
                      <Button size="sm" onClick={() => handleReview(submission)}>
                        {"Review"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </Card>

      {selectedSubmission && (
        <ReviewSubmissionDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          submission={selectedSubmission}
        />
      )}
    </>
  )
}
