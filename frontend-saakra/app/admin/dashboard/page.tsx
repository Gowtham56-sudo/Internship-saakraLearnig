import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { UserManagement } from "@/components/admin/user-management"
import { RecentActivity } from "@/components/admin/recent-activity"
import { SystemHealth } from "@/components/admin/system-health"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Admin Dashboard"}</h1>
          <p className="text-muted-foreground">{"Monitor and manage the Saakra Learning platform."}</p>
        </div>

        <AdminStats />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <AnalyticsCharts />
            <UserManagement />
          </div>
          <div className="space-y-8">
            <SystemHealth />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
