"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, FileText, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReviewSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: {
    id: number
    studentName: string
    assignment: string
    submittedAt: string
  }
}

export function ReviewSubmissionDialog({ open, onOpenChange, submission }: ReviewSubmissionDialogProps) {
  const { toast } = useToast()
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleApprove = () => {
    if (!score || !feedback) {
      toast({
        title: "Missing Information",
        description: "Please provide both score and feedback",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Submission Approved",
      description: `${submission.studentName}'s submission has been graded with score: ${score}/100`,
    })
    setScore("")
    setFeedback("")
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!feedback) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for rejection",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Submission Rejected",
      description: `${submission.studentName}'s submission has been returned for revision`,
    })
    setScore("")
    setFeedback("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogDescription>{submission.assignment}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/diverse-students-studying.png" />
              <AvatarFallback>{submission.studentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{submission.studentName}</p>
              <p className="text-sm text-muted-foreground">Submitted {submission.submittedAt}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Student Work</h3>
            <div className="rounded-lg border p-4">
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">Project Description:</p>
                <p className="text-sm text-muted-foreground">
                  I have completed the assignment with all required features implemented. The code follows best
                  practices and includes proper documentation.
                </p>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">Technologies Used:</p>
                <div className="flex flex-wrap gap-2">
                  {["React", "JavaScript", "CSS"].map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Submission Files:</p>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  project-files.zip
                  <Download className="ml-auto h-4 w-4" />
                </Button>
              </div>
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
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleApprove} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Submit
            </Button>
            <Button onClick={handleReject} variant="destructive" className="flex-1">
              <XCircle className="mr-2 h-4 w-4" />
              Reject & Return
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
