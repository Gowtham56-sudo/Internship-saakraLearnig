"use client"

import { DashboardHeader } from "@/components/student/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import apiFetch, { setDemoTokenForUser } from "@/lib/api"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [quiz, setQuiz] = useState<{
    id: string | string[]
    title: string
    course: string
    totalQuestions: number
    duration: string
    passingScore: number
    questions: { id: number | string; question: string; options: string[]; correctAnswer: number }[]
  }>(() => ({
    id: params.id,
    title: "Assessment",
    course: "",
    totalQuestions: 0,
    duration: "30 min",
    passingScore: 70,
    questions: [],
  }))

  const courseId = searchParams.get("courseId")
  const moduleIndex = searchParams.get("moduleIndex")

  // Load quiz data from module (saved in localStorage) when available; fallback to default sample
  useEffect(() => {
    // try to load from course modules cache
    if (courseId) {
      const savedModules = localStorage.getItem(`course-${courseId}-modules`)
      if (savedModules) {
        try {
          const modules = JSON.parse(savedModules)
          const target =
            modules.find((m: any) => String(m.id) === String(params.id)) ||
            (moduleIndex != null ? modules[Number(moduleIndex)] : null)

          if (target && target.quiz && Array.isArray(target.quiz.questions)) {
            const qList = target.quiz.questions.map((q: any, idx: number) => ({
              id: q.id ?? idx + 1,
              question: q.question || `Question ${idx + 1}`,
              options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Option A", "Option B"],
              correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            }))

            setQuiz({
              id: params.id,
              title: target.title || "Assessment",
              course: target.course || "",
              totalQuestions: qList.length,
              duration: target.duration || "30 min",
              passingScore: target.quiz.passingScore ?? 70,
              questions: qList,
            })
            return
          }
        } catch (e) {
          console.warn("Failed to parse modules cache for quiz", e)
        }
      }
    }

    // fallback sample quiz
    setQuiz({
      id: params.id,
      title: "React Hooks Assessment",
      course: "Full Stack Web Development",
      totalQuestions: 3,
      duration: "30 min",
      passingScore: 70,
      questions: [
        {
          id: 1,
          question: "What is the purpose of useState hook in React?",
          options: [
            "To manage component state",
            "To handle side effects",
            "To create context",
            "To optimize performance",
          ],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Which hook is used to perform side effects in React?",
          options: ["useState", "useEffect", "useContext", "useMemo"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "What does useEffect cleanup function do?",
          options: [
            "Initializes state",
            "Cleans up resources before component unmounts",
            "Updates props",
            "Renders components",
          ],
          correctAnswer: 1,
        },
      ],
    })
  }, [courseId, moduleIndex, params.id])

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex.toString(),
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer.toString()) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / quiz.questions.length) * 100)

    let modulesCache: any[] | null = null

    if (courseId) {
      const savedScores = localStorage.getItem(`course-${courseId}-quiz-scores`)
      const scores = savedScores ? JSON.parse(savedScores) : {}
      scores[String(params.id)] = score
      localStorage.setItem(`course-${courseId}-quiz-scores`, JSON.stringify(scores))

      const savedModules = localStorage.getItem(`course-${courseId}-modules`)
      if (savedModules) {
        try {
          modulesCache = JSON.parse(savedModules)
        } catch (e) {
          modulesCache = null
        }
      }

      if (score >= quiz.passingScore && moduleIndex && modulesCache) {
        const idx = Number(moduleIndex)
        if (modulesCache[idx]) {
          modulesCache[idx].completed = true
          localStorage.setItem(`course-${courseId}-modules`, JSON.stringify(modulesCache))
        }
      }

      // Persist to backend progress
      try {
        const completedIds = Array.isArray(modulesCache)
          ? modulesCache.filter((m: any) => m && m.completed).map((m: any) => String(m.id))
          : []
        const total = Array.isArray(modulesCache) ? modulesCache.length : quiz.questions.length || 1
        const pct = total > 0 ? Math.round((completedIds.length / total) * 100) : score

        let token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("saakra_auth_token") || window.localStorage.getItem("saakra_demo_token")
            : null
        if (!token) {
          token = setDemoTokenForUser("student")
        }

        await apiFetch(`/api/progress/update`, {
          method: "POST",
          authToken: token || undefined,
          body: JSON.stringify({
            courseId,
            percentage: pct,
            completed: pct === 100,
            completedModuleIds: completedIds,
          }),
        })
      } catch (e) {
        console.warn("Failed to persist progress", e)
      }
    }

    setShowResults(true)

    toast({
      title: score >= quiz.passingScore ? "Quiz Passed!" : "Quiz Completed",
      description: `You scored ${score}%. ${correctAnswers} out of ${quiz.questions.length} correct.`,
    })
  }

  if (showResults) {
    const correctAnswers = quiz.questions.filter(
      (question, index) => answers[index] === question.correctAnswer.toString(),
    ).length
    const score = Math.round((correctAnswers / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl p-8 text-center">
            <div className="mb-6">
              {passed ? (
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
              )}
            </div>

            <h1 className="mb-2 text-3xl font-bold">{passed ? "Congratulations!" : "Quiz Completed"}</h1>
            <p className="mb-8 text-muted-foreground">
              {passed ? "You have successfully passed the assessment" : "Keep practicing to improve your score"}
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-3xl font-bold text-primary">{score}%</p>
                <p className="text-sm text-muted-foreground">Your Score</p>
              </Card>
              <Card className="p-4">
                <p className="text-3xl font-bold text-primary">
                  {correctAnswers}/{quiz.questions.length}
                </p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </Card>
              <Card className="p-4">
                <p className="text-3xl font-bold text-primary">{quiz.passingScore}%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </Card>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() =>
                  courseId ? router.push(`/student/course/${courseId}`) : router.push("/student/dashboard")
                }
              >
                {courseId ? "Back to Course" : "Back to Dashboard"}
              </Button>
              {!passed && (
                <Button variant="outline" className="w-full bg-transparent" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl p-6 text-center">
            <p className="text-lg font-semibold">No questions available for this assessment.</p>
            <p className="mt-2 text-sm text-muted-foreground">Please contact your trainer to add questions.</p>
            <Button
              className="mt-6"
              onClick={() =>
                courseId ? router.push(`/student/course/${courseId}`) : router.push("/student/dashboard")
              }
            >
              {courseId ? "Back to Course" : "Back to Dashboard"}
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <Link href={courseId ? `/student/course/${courseId}` : "/student/dashboard"}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {courseId ? "Back to Course" : "Back to Dashboard"}
          </Button>
        </Link>

        <div className="mx-auto max-w-3xl">
          {/* Quiz Header */}
          <Card className="mb-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-sm text-muted-foreground">{quiz.course}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} />
            </div>
          </Card>

          {/* Question Card */}
          <Card className="mb-6 p-8">
            <Badge variant="secondary" className="mb-4">
              Question {currentQuestion + 1}
            </Badge>
            <h2 className="mb-6 text-xl font-semibold">{currentQ.question}</h2>

            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion, Number.parseInt(value))}
            >
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 rounded-lg border p-4 hover:border-primary">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentQuestion
                      ? "bg-primary"
                      : answers[index] !== undefined
                        ? "bg-primary/50"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
