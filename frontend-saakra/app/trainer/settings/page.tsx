import { TrainerHeader } from "@/components/trainer/trainer-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Bell, Lock, Video, Calendar } from "lucide-react"

export default function TrainerSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Settings"}</h1>
          <p className="text-muted-foreground">{"Manage your trainer account settings"}</p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Notifications"}</h3>
                <p className="text-sm text-muted-foreground">{"Manage notification preferences"}</p>
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
                  <p className="font-medium">{"New Enrollments"}</p>
                  <p className="text-sm text-muted-foreground">{"Get notified when students enroll"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Assignment Submissions"}</p>
                  <p className="text-sm text-muted-foreground">{"Alerts for new submissions"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Session Reminders"}</p>
                  <p className="text-sm text-muted-foreground">{"Reminders before scheduled sessions"}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Session Preferences"}</h3>
                <p className="text-sm text-muted-foreground">{"Configure live session settings"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDuration">{"Default Session Duration (minutes)"}</Label>
                <Input id="defaultDuration" type="number" defaultValue="60" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Auto-record Sessions"}</p>
                  <p className="text-sm text-muted-foreground">{"Automatically record all live sessions"}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Allow Q&A During Sessions"}</p>
                  <p className="text-sm text-muted-foreground">{"Students can ask questions in real-time"}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Availability"}</h3>
                <p className="text-sm text-muted-foreground">{"Set your working hours"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">{"Start Time"}</Label>
                  <Input id="startTime" type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">{"End Time"}</Label>
                  <Input id="endTime" type="time" defaultValue="18:00" />
                </div>
              </div>
              <Button>{"Update Availability"}</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{"Security"}</h3>
                <p className="text-sm text-muted-foreground">{"Update your password"}</p>
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
        </div>
      </main>
    </div>
  )
}
