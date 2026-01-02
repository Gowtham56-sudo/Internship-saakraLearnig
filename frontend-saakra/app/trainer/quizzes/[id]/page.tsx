"use client"

import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Trophy, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function QuizResultsPage() {
  const params = useParams()

  const quiz = {
    id: params.id,
    title: "React Hooks Assessment",
    course: "Full Stack Web Development",
    totalQuestions: 10,
    duration: "30 min",
    passingScore: 70,
    attempts: 35,
    avgScore: 78,
  }

  const studentResults = [
    {
      id: 1,
      name: "Rahul Sharma",
      avatar: "/diverse-students-studying.png",
      score: 90,
      correctAnswers: 9,
      timeSpent: "25 min",
      status: "passed",
      attemptedAt: "2 hours ago",
    },
    {
      id: 2,
      name: "Priya Patel",
      avatar: "/diverse-students-studying.png",
      score: 85,
      correctAnswers: 8,
      timeSpent: "28 min",
      status: "passed",
      attemptedAt: "5 hours ago",
    },
    {
      id: 3,
      name: "Amit Kumar",
      avatar: "/diverse-students-studying.png",
      score: 65,
      correctAnswers: 6,
      timeSpent: "22 min",
      status: "failed",
      attemptedAt: "1 day ago",
    },
    {
      id: 4,
      name: "Sneha Reddy",
      avatar: "/diverse-students-studying.png",
      score: 95,
      correctAnswers: 10,
      timeSpent: "27 min",
      status: "passed",
      attemptedAt: "1 day ago",
    },
  ]

  const passRate = Math.round(
    (studentResults.filter((s) => s.status === "passed").length / studentResults.length) * 100,
  )

  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />

      <main className="container mx-auto px-4 py-8">
        <Link href="/trainer/courses/1">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.course}</p>
            </div>
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">{quiz.attempts}</p>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">{quiz.avgScore}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">{passRate}%</p>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">{quiz.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
          </Card>
        </div>

        {/* Student Results */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Student Results</h3>

          <div className="space-y-4">
            {studentResults.map((student) => (
              <div key={student.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">Attempted {student.attemptedAt}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:w-2/3">
                    <div className="flex items-center gap-2">
                      {student.status === "passed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="text-lg font-bold">{student.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {student.correctAnswers}/{quiz.totalQuestions} correct
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{student.timeSpent}</p>
                        <p className="text-xs text-muted-foreground">Time spent</p>
                      </div>
                    </div>

                    <Badge
                      variant={student.status === "passed" ? "default" : "secondary"}
                      className="self-start lg:self-center"
                    >
                      {student.status === "passed" ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={student.score} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
