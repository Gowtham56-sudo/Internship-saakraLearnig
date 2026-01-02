import { DashboardHeader } from "@/components/student/dashboard-header"
import { CourseProgress } from "@/components/student/course-progress"

export default function StudentCoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"My Courses"}</h1>
          <p className="text-muted-foreground">{"Track your progress across all enrolled courses"}</p>
        </div>
        <CourseProgress />
      </main>
    </div>
  )
}
