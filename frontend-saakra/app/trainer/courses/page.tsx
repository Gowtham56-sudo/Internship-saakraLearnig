import { TrainerHeader } from "@/components/trainer/trainer-header"
import { CourseManagement } from "@/components/trainer/course-management"

export default function TrainerCoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Course Management"}</h1>
          <p className="text-muted-foreground">{"Manage your course content, modules, and student progress."}</p>
        </div>
        <CourseManagement />
      </main>
    </div>
  )
}
