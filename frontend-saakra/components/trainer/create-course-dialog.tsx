"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Upload, Youtube, X, Video, FileQuestion, ArrowRight, ArrowLeft, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Module {
  id: string
  title: string
  description: string
  type: "video" | "quiz"
  videoType?: "youtube" | "upload"
  videoUrl?: string
  videoFile?: File
  duration?: string
  quiz?: {
    title: string
    passingScore: number
    questions: Array<{
      id: string
      question: string
      options: string[]
      correctAnswer: number
    }>
  }
}

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    level: "",
    category: "",
    thumbnail: null as File | null,
  })

  const [modules, setModules] = useState<Module[]>([])

  // Module creation state
  const [currentModule, setCurrentModule] = useState<Partial<Module>>({
    type: "video",
  })

  // Quiz creation state
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      id: string
      question: string
      options: string[]
      correctAnswer: number
    }>
  >([])

  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  })

  const handleAddModule = () => {
    if (currentModule.type === "video") {
      if (currentModule.title && (currentModule.videoUrl || currentModule.videoFile)) {
        const newModule: Module = {
          id: Date.now().toString(),
          title: currentModule.title,
          description: currentModule.description || "",
          type: "video",
          videoType: currentModule.videoType,
          videoUrl: currentModule.videoUrl,
          videoFile: currentModule.videoFile,
          duration: currentModule.duration || "10 min",
        }
        setModules([...modules, newModule])
        setCurrentModule({ type: "video" })
        toast({
          title: "Module Added",
          description: "Video module has been added successfully.",
        })
      } else {
        toast({
          title: "Missing Information",
          description: "Please provide module title and video content.",
          variant: "destructive",
        })
      }
    } else if (currentModule.type === "quiz") {
      if (currentModule.title && quizQuestions.length > 0) {
        const newModule: Module = {
          id: Date.now().toString(),
          title: currentModule.title,
          description: currentModule.description || "",
          type: "quiz",
          quiz: {
            title: currentModule.title,
            passingScore: 70,
            questions: quizQuestions,
          },
        }
        setModules([...modules, newModule])
        setCurrentModule({ type: "video" })
        setQuizQuestions([])
        toast({
          title: "Quiz Added",
          description: "Quiz module has been added successfully.",
        })
      } else {
        toast({
          title: "Missing Information",
          description: "Please provide quiz title and at least one question.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every((opt) => opt.trim())) {
      setQuizQuestions([
        ...quizQuestions,
        {
          id: Date.now().toString(),
          ...currentQuestion,
        },
      ])
      setCurrentQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      })
      toast({
        title: "Question Added",
        description: "Quiz question has been added.",
      })
    } else {
      toast({
        title: "Invalid Question",
        description: "Please fill in all fields for the question.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
  }

  const handleRemoveQuestion = (id: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== id))
  }

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCurrentModule({
        ...currentModule,
        videoFile: file,
        title: currentModule.title || file.name.replace(/\.[^/.]+$/, ""),
      })
    }
  }

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.description || !courseData.level || !courseData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all course details.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const form = new FormData()
      form.append("title", courseData.title)
      form.append("description", courseData.description)
      form.append("level", courseData.level)
      form.append("category", courseData.category)

      // Attach thumbnail if provided
      if (courseData.thumbnail) {
        form.append("thumbnail", courseData.thumbnail)
      }

      // Prepare modules payload and append any files
      const modulesForSend = modules.map((m) => {
        const copy: any = { ...m }
        if (m.type === "video" && m.videoFile) {
          // include file name to let server match uploaded buffer
          copy.videoFileName = m.videoFile.name
        }
        // remove File object before sending modules JSON
        delete copy.videoFile
        return copy
      })

      form.append("modules", JSON.stringify(modulesForSend))

      // append module files
      modules.forEach((m) => {
        if (m.type === "video" && m.videoFile) {
          form.append("moduleFiles", m.videoFile, m.videoFile.name)
        }
      })

      // Auth header
      const token = (typeof window !== "undefined" && (window.localStorage.getItem("saakra_auth_token") || window.localStorage.getItem("saakra_demo_token"))) || null

      const resp = await fetch(`${API_BASE}/api/courses/add`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })

      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || json.message || "Failed to create course")

      toast({ title: "Course Created", description: `Your course "${courseData.title}" has been created.` })
      setOpen(false)

      // Reset form
      setCourseData({ title: "", description: "", level: "", category: "", thumbnail: null })
      setModules([])
      setStep(1)

      // optionally reload or navigate
      window.location.reload()
    } catch (err: any) {
      console.error("CreateCourse failed", err)
      toast({ title: "Create failed", description: err.message || String(err), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Create New Course {step === 1 ? "- Basic Details" : step === 2 ? "- Add Modules" : "- Review"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Fill in the course details to get started."}
            {step === 2 && "Add video lessons and quiz assessments to your course."}
            {step === 3 && "Review your course before creating."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Basic Course Info */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Full Stack Web Development"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Education Level</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(value) => setCourseData({ ...courseData, level: value })}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10th">10th Standard</SelectItem>
                    <SelectItem value="12th">12th Standard</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={courseData.category}
                  onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile Development</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Course Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.files?.[0] || null })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Add Modules */}
        {step === 2 && (
          <div className="space-y-6 py-4">
            <Tabs
              defaultValue="video"
              value={currentModule.type}
              onValueChange={(value) => setCurrentModule({ type: value as "video" | "quiz" })}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video">
                  <Video className="mr-2 h-4 w-4" />
                  Video Module
                </TabsTrigger>
                <TabsTrigger value="quiz">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Quiz Module
                </TabsTrigger>
              </TabsList>

              {/* Video Module */}
              <TabsContent value="video" className="space-y-4">
                <div className="space-y-2">
                  <Label>Module Title</Label>
                  <Input
                    placeholder="e.g., Introduction to React Hooks"
                    value={currentModule.title || ""}
                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Brief description of this module..."
                    value={currentModule.description || ""}
                    onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <Tabs
                  defaultValue="youtube"
                  value={currentModule.videoType}
                  onValueChange={(value) =>
                    setCurrentModule({ ...currentModule, videoType: value as "youtube" | "upload" })
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="youtube">
                      <Youtube className="mr-2 h-4 w-4" />
                      YouTube Link
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="youtube" className="space-y-3">
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={currentModule.videoUrl || ""}
                        onChange={(e) => setCurrentModule({ ...currentModule, videoUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (Optional)</Label>
                      <Input
                        placeholder="e.g., 15 min"
                        value={currentModule.duration || ""}
                        onChange={(e) => setCurrentModule({ ...currentModule, duration: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-3">
                    <div className="space-y-2">
                      <Label>Upload Video File</Label>
                      <Input type="file" accept="video/*" onChange={handleVideoFileUpload} />
                      <p className="text-xs text-muted-foreground">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
                      {currentModule.videoFile && (
                        <p className="text-sm text-green-600">Selected: {currentModule.videoFile.name}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button type="button" onClick={handleAddModule} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Video Module
                </Button>
              </TabsContent>

              {/* Quiz Module */}
              <TabsContent value="quiz" className="space-y-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input
                    placeholder="e.g., React Hooks Assessment"
                    value={currentModule.title || ""}
                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Brief description of this quiz..."
                    value={currentModule.description || ""}
                    onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <Card className="p-4 space-y-4">
                  <Label className="text-base">Add Questions</Label>

                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter your question..."
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options]
                            newOptions[index] = e.target.value
                            setCurrentQuestion({ ...currentQuestion, options: newOptions })
                          }}
                        />
                        <input
                          type="radio"
                          name="correct"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">Select the correct answer using the radio button</p>
                  </div>

                  <Button type="button" onClick={handleAddQuestion} variant="outline" className="w-full bg-transparent">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Question ({quizQuestions.length})
                  </Button>
                </Card>

                {quizQuestions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Questions Added ({quizQuestions.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {quizQuestions.map((q, index) => (
                        <Card key={q.id} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">
                                {index + 1}. {q.question}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Correct: {q.options[q.correctAnswer]}
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveQuestion(q.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleAddModule}
                  className="w-full"
                  disabled={quizQuestions.length === 0}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Quiz Module
                </Button>
              </TabsContent>
            </Tabs>

            {/* Modules List */}
            {modules.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-base">Course Modules ({modules.length})</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          {module.type === "video" ? (
                            <Video className="h-5 w-5 text-primary" />
                          ) : (
                            <FileQuestion className="h-5 w-5 text-purple-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {index + 1}. {module.title}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {module.type === "video"
                                  ? "Video"
                                  : `Quiz (${module.quiz?.questions.length} questions)`}
                              </Badge>
                              {module.type === "video" && module.videoType && (
                                <Badge variant="secondary" className="text-xs">
                                  {module.videoType === "youtube" ? "YouTube" : "Uploaded"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveModule(module.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <Card className="p-4 space-y-3">
              <div>
                <Label className="text-base">Course Title</Label>
                <p className="text-sm">{courseData.title}</p>
              </div>
              <div>
                <Label className="text-base">Description</Label>
                <p className="text-sm text-muted-foreground">{courseData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base">Level</Label>
                  <p className="text-sm">{courseData.level}</p>
                </div>
                <div>
                  <Label className="text-base">Category</Label>
                  <p className="text-sm">{courseData.category}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <Label className="text-base">Modules ({modules.length})</Label>
              <div className="mt-3 space-y-2">
                {modules.map((module, index) => (
                  <div key={module.id} className="flex items-center gap-2 text-sm">
                    {module.type === "video" ? (
                      <Video className="h-4 w-4 text-primary" />
                    ) : (
                      <FileQuestion className="h-4 w-4 text-purple-500" />
                    )}
                    <span>
                      {index + 1}. {module.title}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {module.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Course"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
