import { DashboardHeader } from "@/components/student/dashboard-header"
import WelcomeUser from "@/components/student/welcome-user"
import { CourseProgress } from "@/components/student/course-progress"
import { LearningStats } from "@/components/student/learning-stats"
import { RecommendedCourses } from "@/components/student/recommended-courses"
import { UpcomingLiveSessions } from "@/components/student/upcoming-live-sessions"
import { RecentActivity } from "@/components/student/recent-activity"

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <WelcomeUser />
        </div>

        <LearningStats />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <CourseProgress />
            <RecentActivity />
          </div>
          <div className="space-y-8">
            <UpcomingLiveSessions />
            <RecommendedCourses />
          </div>
        </div>
      </main>
    </div>
  )
}
