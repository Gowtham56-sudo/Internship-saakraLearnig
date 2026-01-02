"use client"

import { DashboardHeader } from "@/components/student/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Trophy,
  Play,
  Award,
  CalendarClock,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import apiFetch, { setDemoTokenForUser } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string | number
  title: string
  duration: string
  type: "video" | "quiz" | "assignment" | "session"
  completed?: boolean
  videoUrl?: string
  quizId?: number
  description?: string
}

type Assessment = {
  id: string
  title: string
  type: string
  passingScore?: number
  totalQuestions?: number
}

type Session = {
  id: string
  title: string
  date?: string
  startTime?: string
  duration?: string
  type?: string
  meetingLink?: string | null
  status?: string
}

// Map API response to Module format
function normalizeModule(apiModule: any): Module {
  const rawType = apiModule.type || "video"
  const type: Module["type"] = rawType === "quiz" || rawType === "assignment" || rawType === "session" ? rawType : "video"
  return {
    id: apiModule.id,
    title: apiModule.title || "",
    duration: apiModule.duration || "0 min",
    type,
    completed: apiModule.completed || false,
    videoUrl: apiModule.videoUrl,
    quizId: apiModule.quizId,
    description: apiModule.description,
  }
}

export default function CourseLearningPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [quizScores, setQuizScores] = useState<{ [key: number]: number }>({})
  const [showCertificate, setShowCertificate] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [submissionUrl, setSubmissionUrl] = useState("")
  const [submittingAssessmentId, setSubmittingAssessmentId] = useState<string | null>(null)
  const [submittingModuleId, setSubmittingModuleId] = useState<string | number | null>(null)

  const currentModule = modules[currentModuleIndex]
  const completedCount = modules.filter((m) => m.completed).length
  const progressPercentage = Math.round((completedCount / modules.length) * 100)

  const allModulesCompleted = modules.every((m) => m.completed)
  const quizModules = modules.filter((m) => m.type === "quiz")
  const allQuizzesCompleted = quizModules.every((m) => m.completed)
  const courseFullyCompleted = allModulesCompleted && allQuizzesCompleted

  const averageQuizScore =
    quizModules.length > 0
      ? Math.round(quizModules.reduce((acc, m) => acc + (quizScores[m.quizId!] || 0), 0) / quizModules.length)
      : 0

  const syncProgress = async (mods: Module[]) => {
    if (!mods.length) return
    const completedIds = mods.filter((m) => m.completed).map((m) => String(m.id))
    const percentage = Math.round((completedIds.length / mods.length) * 100)
    try {
      console.log('Syncing progress', { courseId: params.id, percentage, completedIds })
      await apiFetch(`/api/progress/update`, {
        method: "POST",
        body: JSON.stringify({
          courseId: params.id,
          percentage,
          completed: percentage === 100,
          completedModuleIds: completedIds,
        }),
      })
      console.log('Progress synced')
    } catch (e) {
      console.warn("Failed to sync progress", e)
    }
  }

  useEffect(() => {
    const savedScores = localStorage.getItem(`course-${params.id}-quiz-scores`)
    if (savedScores) {
      setQuizScores(JSON.parse(savedScores))
    }

    // DISABLED: Don't use localStorage cache for modules - always fetch from backend
    // This ensures we get the latest data
    const savedModules = localStorage.getItem(`course-${params.id}-modules`)
    if (savedModules) {
      console.debug('Found cached modules, but will fetch fresh data from backend')
      // Remove old cache to force fresh fetch
      localStorage.removeItem(`course-${params.id}-modules`)
    }

    // Fetch course modules from backend
    const courseId = params.id
    console.log('=== FETCHING COURSE ===')
    console.log('Course ID:', courseId)
    console.log('API Base:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
    
    // Try protected endpoint first, then fall back to public
    apiFetch(`/api/courses/${courseId}`)
      .then((data) => {
        console.log('✅ Protected endpoint SUCCESS')
        console.log('Full response:', JSON.stringify(data, null, 2))
        const modules = data?.modules
        console.log('Modules field exists:', !!modules)
        console.log('Modules is array:', Array.isArray(modules))
        console.log('Modules length:', modules?.length || 0)
        
        if (modules && Array.isArray(modules)) {
          if (modules.length > 0) {
            console.log('🎯 Found', modules.length, 'modules, normalizing...')
            const normalized = modules.map(normalizeModule)
            console.log('Normalized modules:', normalized)
            setModules(normalized)
            setLoadingCourse(false)
          } else {
            console.warn('⚠️ Course has no modules yet (empty array)')
            setModules([])
            setLoadingCourse(false)
          }
        } else {
          console.warn('❌ No modules array in response, trying public endpoint')
          throw new Error('No modules array')
        }
      })
      .catch((err) => {
        console.log('❌ Protected endpoint FAILED:', err)
        console.log('Trying public endpoint...')
        
        apiFetch(`/api/courses/public/${params.id}`)
          .then((data) => {
            console.log('✅ Public endpoint SUCCESS')
            console.log('Full response:', JSON.stringify(data, null, 2))
            const modules = data?.modules
            console.log('Modules field exists:', !!modules)
            console.log('Modules is array:', Array.isArray(modules))
            console.log('Modules length:', modules?.length || 0)
            
            if (modules && Array.isArray(modules)) {
              if (modules.length > 0) {
                console.log('🎯 Found', modules.length, 'modules from public, normalizing...')
                const normalized = modules.map(normalizeModule)
                console.log('Normalized modules:', normalized)
                setModules(normalized)
              } else {
                console.warn('⚠️ Course has no modules yet (public, empty array)')
                setModules([])
              }
            } else {
              console.error('❌ No modules array found in public endpoint either')
              setModules([])
            }
            setLoadingCourse(false)
          })
          .catch((err2) => {
            console.error("❌ Public endpoint also FAILED:", err2)
            setModules([])
            setLoadingCourse(false)
          })
      })
  }, [params.id])

  // Load saved progress from backend once modules are available
  useEffect(() => {
    if (!modules.length || progressLoaded) return

    apiFetch(`/api/progress/current/${params.id}`)
      .then((data) => {
        const progress = data?.progress
        if (!progress) return

        const completedIds = Array.isArray(progress.completedModuleIds)
          ? progress.completedModuleIds.map(String)
          : []

        if (completedIds.length) {
          setModules((prev) =>
            prev.map((m) =>
              completedIds.includes(String(m.id))
                ? { ...m, completed: true }
                : m
            )
          )
        }

        if (progress.completedPercentage != null && modules.length > 0) {
          const approxIndex = Math.min(
            modules.length - 1,
            Math.max(
              0,
              Math.floor((Number(progress.completedPercentage) / 100) * modules.length)
            )
          )
          setCurrentModuleIndex(approxIndex)
        }
      })
      .catch((err) => {
        console.warn('Failed to load saved progress', err)
      })
      .finally(() => setProgressLoaded(true))
  }, [modules.length, modules, params.id, progressLoaded])

  // Load assessments (quiz/test/assignment/project) and sessions for this course
  useEffect(() => {
    apiFetch(`/api/assessments/course/${params.id}`)
      .then((data) => {
        const list = Array.isArray(data?.assessments) ? data.assessments : []
        setAssessments(list)
      })
      .catch((err) => {
        console.warn('Failed to load assessments', err)
      })

    apiFetch(`/api/sessions/course/${params.id}`)
      .then((data) => {
        const list = Array.isArray(data?.sessions) ? data.sessions : []
        setSessions(list)
      })
      .catch((err) => {
        console.warn('Failed to load sessions', err)
      })
  }, [params.id])

  useEffect(() => {
    localStorage.setItem(`course-${params.id}-modules`, JSON.stringify(modules))

    if (courseFullyCompleted && !showCertificate) {
      setShowCertificate(true)
      toast({
        title: "Congratulations!",
        description: "You've completed all modules and quizzes. Your certificate is ready!",
      })
    }
  }, [modules, courseFullyCompleted, params.id, showCertificate, toast])

  const goToModule = (index: number) => {
    setCurrentModuleIndex(index)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmitAssignment = async (assessmentId: string) => {
    if (!submissionText.trim() && !submissionUrl.trim()) {
      toast({ title: "Add details", description: "Include a link or some notes before submitting.", variant: "destructive" })
      return
    }

    // Require auth token before calling protected endpoint
    let token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("saakra_auth_token") || window.localStorage.getItem("saakra_demo_token")
        : null

    // Fall back to a demo token in local/dev so the protected endpoint works without a full auth flow.
    if (!token) {
      token = setDemoTokenForUser("student")
      toast({ title: "Using demo login", description: "Proceeding with a demo token for submission.", variant: "default" })
    }

    setSubmittingAssessmentId(assessmentId)
    setSubmittingModuleId(currentModule?.id ?? null)
    try {
      await apiFetch(`/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        authToken: token || undefined,
        body: JSON.stringify({
          assessmentId,
          submissionText: submissionText.trim() || undefined,
          submissionUrl: submissionUrl.trim() || undefined,
        }),
      })
      toast({ title: "Submitted", description: "Assignment submitted for review." })
      setOpenAssignmentId(null)
      setSubmissionText("")
      setSubmissionUrl("")

      // Mark the corresponding module complete (if this assessment aligns with the current module)
      if (currentModule && currentModule.type === "assignment") {
        const updatedModules = modules.map((m) =>
          String(m.id) === String(currentModule.id) ? { ...m, completed: true } : m
        )
        setModules(updatedModules)
        await syncProgress(updatedModules)
      }
    } catch (err: any) {
      console.error("Submit assignment failed", { err, status: err?.status, body: err?.body, message: err?.message })
      const detail =
        err?.body?.error ||
        err?.body?.message ||
        err?.message ||
        (err?.status ? `HTTP ${err.status} ${JSON.stringify(err.body || {})}` : null) ||
        (typeof err === "object" ? JSON.stringify(err) : String(err)) ||
        "Network error or backend unavailable. Check API server at NEXT_PUBLIC_API_URL."
      toast({ title: "Submit failed", description: detail, variant: "destructive" })
    } finally {
      setSubmittingAssessmentId(null)
      setSubmittingModuleId(null)
    }
  }

  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      goToModule(currentModuleIndex - 1)
    }
  }

  const goToNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      goToModule(currentModuleIndex + 1)
    }
  }

  const markModuleComplete = () => {
    const updatedModules = [...modules]
    updatedModules[currentModuleIndex].completed = true
    setModules(updatedModules)

    syncProgress(updatedModules)

    toast({
      title: "Module Completed!",
      description: `You've completed "${currentModule.title}"`,
    })

    setTimeout(() => {
      if (currentModuleIndex < modules.length - 1) {
        goToNextModule()
      }
    }, 1500)
  }

  const handleStartQuiz = () => {
    if (currentModule.type === "quiz" && currentModule.quizId) {
      router.push(`/student/quiz/${currentModule.quizId}?courseId=${params.id}&moduleIndex=${currentModuleIndex}`)
    }
  }

  const handleDownloadCertificate = () => {
    router.push(`/student/certificate/${params.id}`)
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-20 text-muted-foreground">Loading course...</div>
        </main>
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-20 text-muted-foreground">No modules found for this course.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Video/Quiz player */}
            <Card className="overflow-hidden">
              {currentModule.type === "video" ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    key={currentModule.id}
                    src={currentModule.videoUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : currentModule.type === "quiz" ? (
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
                    <h3 className="mb-2 text-2xl font-bold">Quiz Assessment</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Test your knowledge with this quiz</p>
                    <Button size="lg" onClick={handleStartQuiz}>
                      <Play className="mr-2 h-5 w-5" />
                      Start Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
                    <h3 className="mb-2 text-2xl font-bold">{currentModule.type === "assignment" ? "Assignment" : "Session"}</h3>
                    <p className="mb-6 text-sm text-muted-foreground">{currentModule.description || "Review the details below."}</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Module {currentModuleIndex + 1} of {modules.length}
                    </Badge>
                    <h1 className="text-2xl font-bold">{currentModule.title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {currentModule.type === "video"
                        ? "Watch the video and complete to unlock the next module"
                        : currentModule.type === "quiz"
                          ? "Complete this quiz to test your understanding"
                          : currentModule.type === "assignment"
                            ? "Work on this assignment and submit through the assignments section"
                            : "Attend this live/session and mark as done"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {currentModule.type === "video" && (
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentModule.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {completedCount} of {modules.length} completed
                      </span>
                    </div>
                  </div>

                  {!currentModule.completed && currentModule.type !== "quiz" && (
                    <Button onClick={markModuleComplete}>Mark as Complete</Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Tabs for content */}
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b px-6">
                  <TabsList className="h-auto bg-transparent p-0">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 data-[state=active]:border-primary"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-none border-b-2 data-[state=active]:border-primary">
                      Notes
                    </TabsTrigger>
                    <TabsTrigger
                      value="resources"
                      className="rounded-none border-b-2 data-[state=active]:border-primary"
                    >
                      Resources
                    </TabsTrigger>
                    <TabsTrigger
                      value="discussion"
                      className="rounded-none border-b-2 data-[state=active]:border-primary"
                    >
                      Discussion
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-semibold">What you'll learn</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          Understanding the useState hook for state management
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          Working with useEffect for side effects
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          Managing component lifecycle in functional components
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          Best practices for using React hooks
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-6">
                  <p className="text-sm text-muted-foreground">Take notes while learning...</p>
                </TabsContent>

                <TabsContent value="resources" className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">React Hooks Cheatsheet.pdf</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Join the discussion with your trainer and peers
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goToPreviousModule} disabled={currentModuleIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Module
              </Button>
              <Button onClick={goToNextModule} disabled={currentModuleIndex === modules.length - 1}>
                Next Module
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Course Progress</h3>
              <Progress value={progressPercentage} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedCount} of {modules.length} modules completed
              </p>

              {courseFullyCompleted && (
                <div className="mt-4 rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-primary">Certificate Ready!</h4>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Congratulations! You've completed all modules with an average score of {averageQuizScore}%
                  </p>
                  <Button onClick={handleDownloadCertificate} className="w-full">
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Course Modules</h3>
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => goToModule(index)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                      index === currentModuleIndex ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {module.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : module.type === "quiz" ? (
                          <Trophy className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${index === currentModuleIndex ? "text-primary" : ""}`}>
                            {module.title}
                          </p>
                          {module.type === "quiz" && (
                            <Badge variant="secondary" className="text-xs">
                              Quiz
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{module.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Assessments</h3>
              </div>
              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assessments yet.</p>
              ) : (
                <div className="space-y-2">
                  {assessments.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Passing {a.passingScore ?? 50}% • {a.totalQuestions ?? 0} questions
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {a.type}
                        </Badge>
                      </div>

                      {a.type === "assignment" || a.type === "project" ? (
                        <div className="space-y-2">
                          {openAssignmentId === a.id ? (
                            <div className="space-y-2">
                              <Input
                                placeholder="Submission link (GitHub, Drive, etc.)"
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                              />
                              <Textarea
                                placeholder="Notes or summary for the reviewer"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitAssignment(a.id)}
                                  disabled={submittingAssessmentId === a.id}
                                >
                                  {submittingAssessmentId === a.id ? "Submitting..." : "Submit assignment"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setOpenAssignmentId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setOpenAssignmentId(a.id)}>
                              Submit assignment
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          This assessment is a quiz/test. Start it from the quiz modules above.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Live Sessions</h3>
              </div>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.date || "TBD"} • {s.startTime || ""} • {s.duration || ""}
                          </p>
                          {s.meetingLink && (
                            <a
                              className="text-xs text-primary hover:underline"
                              href={s.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join session
                            </a>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {s.type || "session"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
