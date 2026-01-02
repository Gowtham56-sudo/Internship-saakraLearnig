"use client"

import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Settings,
  Play,
  Edit,
  Trash2,
  PlusCircle,
  ChevronRight,
  Trophy,
  Youtube,
  Upload,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AddModuleDialog } from "@/components/trainer/add-module-dialog"
import { CreateQuizDialog } from "@/components/trainer/create-quiz-dialog"
import { useToast } from "@/hooks/use-toast"

interface CourseModule {
  id: number
  title: string
  videos: number
  duration: string
  completed: boolean
  videoList?: Array<{ type: "youtube" | "upload"; url?: string; title: string }>
}

export default function CourseDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  const [modules, setModules] = useState<CourseModule[]>([])
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const id = params.id
        if (!id) return
        const api = (await import("@/lib/api")).default
        const c = await api(`/api/courses/${id}`)
        if (!mounted) return
        setCourse(c)
        setModules(
          Array.isArray(c.modules)
            ? c.modules.map((m: any, idx: number) => ({
                id: idx + 1,
                title: m.title || m.name || `Module ${idx + 1}`,
                videos: (m.videos && m.videos.length) || 0,
                duration: m.duration || "",
                completed: false,
                videoList: m.videos || [],
              }))
            : []
        )

        // fetch enrolled students (trainer/admin view)
        try {
          const sres = await api(`/api/courses/${id}/students`)
          if (mounted && sres && Array.isArray(sres.students)) setStudents(sres.students)
        } catch (e) {
          console.warn("Failed to load students for course", e)
        }
      } catch (err: any) {
        // apiFetch throws structured errors like {status, body}
        try {
          console.error("CourseDetail: failed to load course", JSON.stringify(err))
        } catch (_) {
          console.error("CourseDetail: failed to load course", err)
        }
        // Attempt unauthenticated fallback to public endpoint if auth failure
        const status = err && err.status
        if (status === 401 || status === 403) {
          try {
            const api = (await import("@/lib/api")).default
            const pub = await api(`/api/courses/public/${params.id}`)
            if (mounted) {
              setCourse(pub)
              setModules(Array.isArray(pub.modules) ? pub.modules.map((m: any, idx: number) => ({ id: idx + 1, title: m.title || m.name || `Module ${idx + 1}`, videos: (m.videos && m.videos.length) || 0, duration: m.duration || "", completed: false, videoList: m.videos || [] })) : [])
              setLoadError(null)
            }
          } catch (pe) {
            console.error("Public fallback failed", pe)
            if (mounted) setLoadError("Failed to load course (permission required)")
          }
        } else {
          if (mounted) setLoadError("Failed to load course")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [params.id])

  const handleAddModule = (moduleData: {
    title: string
    description: string
    videos: Array<{ type: "youtube" | "upload"; url?: string; title: string }>
  }) => {
    const newModule: CourseModule = {
      id: modules.length + 1,
      title: moduleData.title,
      videos: moduleData.videos.length,
      duration: `${moduleData.videos.length * 45}min`, // Estimate duration
      completed: false,
      videoList: moduleData.videos,
    }
    setModules([...modules, newModule])
  }

  const handleDeleteModule = (id: number) => {
    setModules(modules.filter((m) => m.id !== id))
    toast({
      title: "Module Deleted",
      description: "The module has been removed from the course.",
    })
  }

  

  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Courses</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{loading ? "Loading..." : course?.title}</span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3">{course?.level || "Course"}</Badge>
              <h1 className="mb-2 text-3xl font-bold">{loading ? "Loading..." : course?.title}</h1>
              <p className="text-muted-foreground">{course?.description}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(course && course.students && course.students.length) || course?.students || 0}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(course && course.modules && course.modules.length) || course?.modules || modules.length}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course?.videos || modules.reduce((acc, m) => acc + (m.videos || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course?.assignments || 0}</p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Course Description</h3>
                  <p className="mb-4 text-muted-foreground">{course?.description || (loadError ? loadError : "")}</p>

                <h4 className="mb-3 font-semibold">What students will learn:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Build modern web applications with React</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Create RESTful APIs with Node.js and Express</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Work with databases and authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Deploy applications to production</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Course Progress</h3>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Progress</span>
                  <span className="font-semibold">{course?.avgProgress ?? 0}%</span>
                </div>
                <Progress value={course?.avgProgress ?? 0} className="mb-6" />

                <div className="space-y-4">
                    <div>
                    <p className="text-2xl font-bold">{course?.students?.length ?? course?.students ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">38</p>
                    <p className="text-sm text-muted-foreground">Active This Week</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Assignments Submitted</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Course Modules</h3>
                <AddModuleDialog onAddModule={handleAddModule} />
              </div>

              <div className="space-y-3">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{module.videos} videos</span>
                          <span>{module.duration}</span>
                        </div>
                        {module.videoList && module.videoList.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {module.videoList.map((video, vidIndex) => (
                              <div key={vidIndex} className="flex items-center gap-1 text-xs text-muted-foreground">
                                {video.type === "youtube" ? (
                                  <Youtube className="h-3 w-3 text-red-500" />
                                ) : (
                                  <Upload className="h-3 w-3" />
                                )}
                                <span>{video.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {module.completed && <Badge variant="secondary">Completed</Badge>}
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteModule(module.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p>No modules added yet. Click "Add Module" to get started.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Enrolled Students</h3>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">Last active: {student.lastActive}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{(student.progress?.completedPercentage ?? student.progress ?? 0)}%</span>
                        </div>
                        <Progress value={student.progress?.completedPercentage ?? student.progress ?? 0} />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-4 bg-transparent">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assignments</h3>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold">Build a Todo App with React</h4>
                    <Badge>12 submissions</Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Create a functional todo application using React hooks
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm">Review Submissions</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold">API Integration Project</h4>
                    <Badge>8 submissions</Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">Build a frontend that consumes a RESTful API</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm">Review Submissions</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quizzes & Assessments</h3>
                <CreateQuizDialog courseId={course?.id} />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">React Hooks Assessment</h4>
                    </div>
                    <Badge>35 attempts</Badge>
                  </div>
                  <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                    <span>10 questions</span>
                    <span>30 minutes</span>
                    <span>70% passing score</span>
                  </div>
                  <div className="mb-3 rounded-lg bg-muted p-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Average Score</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit Quiz
                    </Button>
                    <Button size="sm">View Results</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">State Management Quiz</h4>
                    </div>
                    <Badge>42 attempts</Badge>
                  </div>
                  <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                    <span>15 questions</span>
                    <span>45 minutes</span>
                    <span>75% passing score</span>
                  </div>
                  <div className="mb-3 rounded-lg bg-muted p-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Average Score</span>
                      <span className="font-semibold">82%</span>
                    </div>
                    <Progress value={82} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit Quiz
                    </Button>
                    <Button size="sm">View Results</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
