import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Bell, Lock, Palette, Globe } from "lucide-react"

export default function StudentSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Settings"}</h1>
          <p className="text-muted-foreground">{"Manage your account settings and preferences"}</p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Notifications"}</h3>
                <p className="text-sm text-muted-foreground">{"Manage your notification preferences"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Email Notifications"}</p>
                  <p className="text-sm text-muted-foreground">{"Receive updates via email"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Course Updates"}</p>
                  <p className="text-sm text-muted-foreground">{"New lessons and assignments"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Live Session Reminders"}</p>
                  <p className="text-sm text-muted-foreground">{"Get notified before sessions start"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Assignment Deadlines"}</p>
                  <p className="text-sm text-muted-foreground">{"Reminders for pending submissions"}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Security"}</h3>
                <p className="text-sm text-muted-foreground">{"Update your password and security settings"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{"Current Password"}</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{"New Password"}</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{"Confirm New Password"}</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>{"Update Password"}</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Appearance"}</h3>
                <p className="text-sm text-muted-foreground">{"Customize how Saakra looks"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Dark Mode"}</p>
                  <p className="text-sm text-muted-foreground">{"Use dark theme"}</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Language & Region"}</h3>
                <p className="text-sm text-muted-foreground">{"Set your language and timezone"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{"Language"}</Label>
                <Input id="language" defaultValue="English" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{"Timezone"}</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata (IST)" />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
