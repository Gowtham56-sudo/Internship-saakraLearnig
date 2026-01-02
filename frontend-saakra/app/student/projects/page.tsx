import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderGit2, Upload, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "E-commerce Website",
      course: "Full Stack Web Development",
      status: "Submitted",
      score: 92,
      feedback: "Excellent work! Great UI/UX implementation.",
      submittedDate: "2024-01-15",
      dueDate: "2024-01-20",
    },
    {
      id: 2,
      title: "Data Analysis Dashboard",
      course: "Data Science Fundamentals",
      status: "In Progress",
      score: null,
      feedback: null,
      submittedDate: null,
      dueDate: "2024-02-10",
    },
    {
      id: 3,
      title: "Mobile App Prototype",
      course: "React Native Development",
      status: "Not Started",
      score: null,
      feedback: null,
      submittedDate: null,
      dueDate: "2024-02-25",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-green-100 text-green-700"
      case "In Progress":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FolderGit2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Projects</h1>
          </div>
          <p className="text-muted-foreground">Submit and track your project-based evaluations</p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Project Completion Score</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've completed 1 out of 3 projects with an average score of 92%
                  </p>
                  <Progress value={33} className="h-2" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">92%</div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {project.title}
                      {getStatusIcon(project.status)}
                    </CardTitle>
                    <CardDescription>{project.course}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{project.dueDate}</span>
                  </div>

                  {project.submittedDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">{project.submittedDate}</span>
                    </div>
                  )}

                  {project.score !== null && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Score:</span>
                        <span className="text-2xl font-bold text-green-600">{project.score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Feedback:</strong> {project.feedback}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {project.status === "Not Started" && (
                      <Button className="flex-1">
                        <Upload className="mr-2 h-4 w-4" />
                        Start Project
                      </Button>
                    )}
                    {project.status === "In Progress" && (
                      <>
                        <Button className="flex-1">
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Project
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/student/projects/${project.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                      </>
                    )}
                    {project.status === "Submitted" && (
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Eye className="mr-2 h-4 w-4" />
                        View Submission
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
