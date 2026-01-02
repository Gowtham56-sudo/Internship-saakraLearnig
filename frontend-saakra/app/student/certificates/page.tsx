"use client"

import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Share2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<any[]>([])

  useEffect(() => {
    const earnedCertificates: any[] = []

    // Check each course for completion
    for (let i = 1; i <= 10; i++) {
      const savedModules = localStorage.getItem(`course-${i}-modules`)
      const savedScores = localStorage.getItem(`course-${i}-quiz-scores`)

      if (savedModules && savedScores) {
        const modules = JSON.parse(savedModules)
        const scores = JSON.parse(savedScores)

        const allCompleted = modules.every((m: any) => m.completed)
        const quizModules = modules.filter((m: any) => m.type === "quiz")
        const allQuizzesPassed = quizModules.every((m: any) => scores[m.quizId] >= 70)

        if (allCompleted && allQuizzesPassed) {
          const averageScore =
            quizModules.length > 0
              ? Math.round(
                  quizModules.reduce((acc: number, m: any) => acc + (scores[m.quizId] || 0), 0) / quizModules.length,
                )
              : 0

          earnedCertificates.push({
            id: i,
            course: "Full Stack Web Development",
            level: "College Level",
            completedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            score: `${averageScore}%`,
          })
        }
      }
    }

    setCertificates(earnedCertificates)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">View and download your course completion certificates</p>
        </div>

        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No Certificates Yet</h3>
            <p className="mb-6 text-muted-foreground">Complete courses and pass all quizzes to earn certificates</p>
            <Button onClick={() => router.push("/student/browse")}>Browse Courses</Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <Card key={cert.id} className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cert.course}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {cert.level}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{cert.completedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Score</span>
                    <span className="font-medium text-primary">{cert.score}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => router.push(`/student/certificate/${cert.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
