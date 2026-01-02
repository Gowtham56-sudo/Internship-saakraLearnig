"use client"

import { DashboardHeader } from "@/components/student/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Award, Download, Share2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import apiFetch, { setAuthToken } from "@/lib/api"

export default function CertificatePage() {
  const params = useParams()
  const { toast } = useToast()
  const [certificateData, setCertificateData] = useState<any>(null)

  useEffect(() => {
    // Load certificate record for this user's course from backend
    let mounted = true
    apiFetch("/api/certificates/user")
      .then((res: any) => {
        if (!mounted) return
        const certs = res?.certificates || []
        const found = certs.find((c: any) => String(c.courseId) === String(params.courseId))
        if (found) {
          setCertificateData({
            courseName: found.courseTitle || "",
            studentName: found.userId || "",
            completionDate: new Date(found.issuedDate).toLocaleDateString(),
            score: found.score ?? 0,
            totalModules: found.totalModules ?? 0,
            certificateId: found.id,
            fileUrl: found.fileUrl,
          })
        }
      })
      .catch(() => {
        // fallback: keep existing client-side behavior
        const savedModules = localStorage.getItem(`course-${params.courseId}-modules`)
        const savedScores = localStorage.getItem(`course-${params.courseId}-quiz-scores`)

        if (savedModules && savedScores) {
          const modules = JSON.parse(savedModules)
          const scores = JSON.parse(savedScores)

          const quizModules = modules.filter((m: any) => m.type === "quiz")
          const averageScore =
            quizModules.length > 0
              ? Math.round(
                  quizModules.reduce((acc: number, m: any) => acc + (scores[m.quizId] || 0), 0) / quizModules.length,
                )
              : 0

          setCertificateData({
            courseName: "Full Stack Web Development",
            studentName: "Student Name",
            completionDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            score: averageScore,
            totalModules: modules.length,
            certificateId: `SAAKRA-${params.courseId}-${Date.now()}`,
          })
        }
      })

    return () => {
      mounted = false
    }
  }, [params.courseId])

  const handleDownload = () => {
    // Secure download: fetch binary from backend proxy endpoint
    if (!certificateData?.certificateId) {
      toast({ title: "No certificate", description: "Certificate not found" })
      return
    }

    const certId = certificateData.certificateId
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('saakra_auth_token') || window.localStorage.getItem('saakra_demo_token') : null

    fetch(`/api/assessments/certificate/${certId}/download`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Download failed')
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${certId}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast({ title: 'Downloaded', description: 'Certificate saved' })
      })
      .catch((err) => {
        console.error('Certificate download failed', err)
        toast({ title: 'Download failed', description: String(err) })
      })
  }

  const handleShare = () => {
    toast({
      title: "Share Certificate",
      description: "Share link copied to clipboard",
    })
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl p-8 text-center">
            <p className="text-muted-foreground">Loading certificate...</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <Link href={`/student/course/${params.courseId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Button>
        </Link>

        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold">Certificate of Completion</h1>
            <p className="text-muted-foreground">Congratulations on completing your course!</p>
          </div>

          {/* Certificate */}
          <Card className="relative mb-6 overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-background to-primary/5 p-12">
            {/* Decorative corners */}
            <div className="absolute left-4 top-4 h-12 w-12 border-l-4 border-t-4 border-primary/30" />
            <div className="absolute right-4 top-4 h-12 w-12 border-r-4 border-t-4 border-primary/30" />
            <div className="absolute bottom-4 left-4 h-12 w-12 border-b-4 border-l-4 border-primary/30" />
            <div className="absolute bottom-4 right-4 h-12 w-12 border-b-4 border-r-4 border-primary/30" />

            <div className="text-center">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Award className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>

              {/* Certificate Header */}
              <h2 className="mb-2 text-4xl font-bold text-primary">Certificate of Completion</h2>
              <p className="mb-8 text-muted-foreground">This certifies that</p>

              {/* Student Name */}
              <h3 className="mb-8 text-3xl font-bold">{certificateData.studentName}</h3>

              {/* Achievement Text */}
              <p className="mb-2 text-muted-foreground">has successfully completed</p>
              <h4 className="mb-8 text-2xl font-semibold text-primary">{certificateData.courseName}</h4>

              {/* Details */}
              <div className="mb-8 flex justify-center gap-12 text-sm">
                <div>
                  <p className="font-semibold">Completion Date</p>
                  <p className="text-muted-foreground">{certificateData.completionDate}</p>
                </div>
                <div>
                  <p className="font-semibold">Final Score</p>
                  <p className="text-muted-foreground">{certificateData.score}%</p>
                </div>
                <div>
                  <p className="font-semibold">Total Modules</p>
                  <p className="text-muted-foreground">{certificateData.totalModules}</p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground">Certificate ID: {certificateData.certificateId}</p>
              </div>

              {/* Signature Section */}
              <div className="mt-8 flex justify-center gap-16">
                <div className="text-center">
                  <div className="mb-2 h-px w-40 bg-border" />
                  <p className="text-sm font-semibold">Course Instructor</p>
                  <p className="text-xs text-muted-foreground">Saakra Learning</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 h-px w-40 bg-border" />
                  <p className="text-sm font-semibold">Platform Director</p>
                  <p className="text-xs text-muted-foreground">Saakra Learning</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleDownload}>
              <Download className="mr-2 h-5 w-5" />
              Download Certificate
            </Button>
            <Button size="lg" variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" />
              Share Certificate
            </Button>
          </div>

          {/* Info */}
          <Card className="mt-6 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <Award className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h4 className="mb-1 font-semibold">Certificate Verification</h4>
                <p className="text-sm text-muted-foreground">
                  This certificate can be verified using the Certificate ID. Share this certificate with employers to
                  showcase your skills and achievements on the Saakra Learning platform.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
