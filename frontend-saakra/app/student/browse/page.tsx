import { DashboardHeader } from "@/components/student/dashboard-header"
import { CourseBrowser } from "@/components/student/course-browser"

export default function BrowseCoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Browse Courses"}</h1>
          <p className="text-muted-foreground">
            {"Discover new skills and advance your career with our expert-led courses."}
          </p>
        </div>
        <CourseBrowser />
      </main>
    </div>
  )
}
