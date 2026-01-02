import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Settings"}</h1>
          <p className="text-muted-foreground">{"Manage platform settings and configurations"}</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">{"Platform Information"}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">{"Platform Name"}</Label>
                <Input id="platform-name" defaultValue="Saakra Learning" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">{"Support Email"}</Label>
                <Input id="support-email" type="email" defaultValue="support@saakra.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{"Timezone"}</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata (IST)" />
              </div>
            </div>
            <Button className="mt-6">{"Save Changes"}</Button>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">{"Platform Features"}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Course Enrollment"}</p>
                  <p className="text-sm text-muted-foreground">{"Allow new student enrollments"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"AI Assessment"}</p>
                  <p className="text-sm text-muted-foreground">{"Enable AI-powered assessments"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Live Sessions"}</p>
                  <p className="text-sm text-muted-foreground">{"Enable live video sessions"}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">{"Notification Settings"}</h3>
            <p className="text-sm text-muted-foreground">{"Configure platform-wide notification preferences"}</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">{"Security Settings"}</h3>
            <p className="text-sm text-muted-foreground">{"Manage security and access controls"}</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
