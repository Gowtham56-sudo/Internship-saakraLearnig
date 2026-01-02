"use client"

import { useState } from "react"
import apiFetch from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function CreateQuizDialog({ courseId }: { courseId?: string }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [quizTitle, setQuizTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [passingScore, setPassingScore] = useState("70")
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    try {
      const payload: any = {
        courseId: courseId || "",
        title: quizTitle,
        type: "quiz",
        totalQuestions: questions.length,
        passingScore: Number(passingScore || 70),
        questions,
      }

      await apiFetch("/api/assessments/create", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      toast({
        title: "Quiz Created",
        description: `${quizTitle} has been created with ${questions.length} questions.`,
      })
      setOpen(false)
      // Reset form
      setQuizTitle("")
      setDuration("")
      setPassingScore("70")
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }])
    } catch (err: any) {
      console.error("CreateQuiz failed", err)
      toast({ title: "Create failed", description: err?.message || String(err), variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                placeholder="e.g., React Hooks Assessment"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  placeholder="70"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Questions</Label>
              <Button size="sm" variant="outline" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Label className="mt-2">Question {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeQuestion(qIndex)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="Enter your question"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                />

                <div className="space-y-2">
                  <Label className="text-sm">Options (select correct answer)</Label>
                  <RadioGroup
                    value={q.correctAnswer.toString()}
                    onValueChange={(value) => updateQuestion(qIndex, "correctAnswer", Number.parseInt(value))}
                  >
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                        <Input
                          placeholder={`Option ${oIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Quiz</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
