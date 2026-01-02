"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Download, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import apiFetch from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ReviewSubmissionPage() {
  const params = useParams()
  const id = params?.id
  const [submissions, setSubmissions] = useState<any[]>([])
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const [aRes, sRes] = await Promise.all([
          apiFetch(`/api/assessments/${id}`),
          apiFetch(`/api/assessments/${id}/submissions`),
        ])

        if (!mounted) return
        setAssignment(aRes || null)
        setSubmissions((sRes && sRes.submissions) || [])
      } catch (e) {
        console.error("Failed to load assignment or submissions", e)
        setAssignment(null)
        setSubmissions([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  const current = submissions[selectedIndex] || submissions[0]

  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trainer/assignments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assignments
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold">{assignment?.title || "Assignment"}</h1>
                  <p className="text-muted-foreground">{assignment?.type || "Assignment"}</p>
                </div>
                <Badge>{current ? (current.status || (current.reviewed ? "Reviewed" : "Pending")) : "No Submissions"}</Badge>
              </div>

              {loading && <div>Loading...</div>}

              {!loading && !current && (
                <div className="text-muted-foreground">No submissions yet for this assignment.</div>
              )}

              {!loading && current && (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={current.avatar || "/diverse-students-studying.png"} />
                      <AvatarFallback>{(current.studentName || current.userId || "?").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{current.studentName || current.userId}</p>
                      <p className="text-sm text-muted-foreground">{new Date(current.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <ReviewSubmissionForm
                    submission={current}
                    onSubmit={async (payload) => {
                      try {
                        await apiFetch(`/api/assessments/${id}/submissions/${current.id}/review`, {
                          method: "POST",
                          body: JSON.stringify(payload),
                        })
                        toast({ title: "Updated", description: "Submission review saved." })
                        setSubmissions((prev) =>
                          prev.map((s) =>
                            s.id === current.id
                              ? { ...s, ...payload, reviewed: true, status: payload.status || s.status }
                              : s
                          )
                        )
                      } catch (e: any) {
                        toast({ title: "Update failed", description: e?.message || "Please try again" , variant: "destructive" })
                      }
                    }}
                  />
                </>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Assignment Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max Score</p>
                  <p className="font-medium">{assignment?.totalQuestions || 100} points</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submissions</p>
                  <p className="font-medium">{submissions.length}/{assignment?.totalStudents || "-"} students</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Submission Files</h3>
              <div className="space-y-2">
                {(current?.files || []).length === 0 && <div className="text-muted-foreground">No files attached.</div>}
                {(current?.files || []).map((f: any) => (
                  <Button key={f.name} variant="outline" className="w-full justify-start bg-transparent" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    {f.name}
                    <Download className="ml-auto h-4 w-4" />
                  </Button>
                ))}
                {current?.submissionUrl && (
                  <Button asChild variant="outline" className="w-full justify-start" size="sm">
                    <a href={current.submissionUrl} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Open submission link
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function ReviewSubmissionForm({ submission, onSubmit }: { submission?: any; onSubmit: (payload: any) => Promise<void> }) {
  const [score, setScore] = useState(submission?.score || "")
  const [feedback, setFeedback] = useState(submission?.feedback || "")
  const [saving, setSaving] = useState(false)

  const handleDecision = async (approved: boolean) => {
    if (!feedback.trim()) {
      alert("Please provide feedback")
      return
    }
    setSaving(true)
    await onSubmit({
      status: approved ? "approved" : "rejected",
      feedback: feedback.trim(),
      score: score === "" ? null : Number(score),
      passed: approved,
    })
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold">Student Notes</h3>
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          {submission?.submissionText || "No notes provided."}
        </div>
      </div>

      <div>
        <Label htmlFor="score">Score (out of 100)</Label>
        <Input
          id="score"
          type="number"
          min="0"
          max="100"
          placeholder="Enter score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Provide detailed feedback on the submission..."
          rows={6}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => handleDecision(true)} className="flex-1" disabled={saving}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve & Submit
        </Button>
        <Button onClick={() => handleDecision(false)} variant="destructive" className="flex-1" disabled={saving}>
          <XCircle className="mr-2 h-4 w-4" />
          Reject & Return
        </Button>
      </div>
    </div>
  )
}
