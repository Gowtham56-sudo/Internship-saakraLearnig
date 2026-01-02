import { TrainerHeader } from "@/components/trainer/trainer-header"
import { TrainerStats } from "@/components/trainer/trainer-stats"
import { MyCourses } from "@/components/trainer/my-courses"
import { UpcomingSessions } from "@/components/trainer/upcoming-sessions"
import { RecentSubmissions } from "@/components/trainer/recent-submissions"
import { StudentProgress } from "@/components/trainer/student-progress"
import TrainerWelcome from "@/components/trainer/welcome-user"

export default function TrainerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <TrainerWelcome />
        </div>

        <TrainerStats />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <MyCourses />
            <RecentSubmissions />
          </div>
          <div className="space-y-8">
            <UpcomingSessions />
            <StudentProgress />
          </div>
        </div>
      </main>
    </div>
  )
}
