import { AdminHeader } from "@/components/admin/admin-header"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Analytics"}</h1>
          <p className="text-muted-foreground">{"Detailed platform analytics and insights"}</p>
        </div>
        <AnalyticsCharts />
      </main>
    </div>
  )
}
