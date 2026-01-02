import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Mail, Phone, MapPin, Calendar, Shield, Users } from "lucide-react"

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Admin Profile"}</h1>
          <p className="text-muted-foreground">{"Manage your administrator profile"}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="/admin-user.png" alt="Admin" />
                    <AvatarFallback>{"AD"}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-10 w-10 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{"Admin User"}</h2>
                <div className="mt-2 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{"Super Administrator"}</span>
                </div>
                <div className="mt-6 w-full space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{"admin@saakra.edu"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{"+91 98765 00000"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{"Hyderabad, Telangana"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{"Joined Nov 2024"}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h3 className="mb-4 font-semibold">{"Platform Stats"}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">{"Total Users"}</span>
                  </div>
                  <span className="font-semibold">{"1,234"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">{"Admin Actions"}</span>
                  </div>
                  <span className="font-semibold">{"89"}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold">{"Personal Information"}</h3>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{"First Name"}</Label>
                    <Input id="firstName" defaultValue="Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{"Last Name"}</Label>
                    <Input id="lastName" defaultValue="User" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{"Email"}</Label>
                  <Input id="email" type="email" defaultValue="admin@saakra.edu" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{"Phone Number"}</Label>
                  <Input id="phone" type="tel" defaultValue="+91 98765 00000" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">{"City"}</Label>
                    <Input id="city" defaultValue="Hyderabad" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{"State"}</Label>
                    <Input id="state" defaultValue="Telangana" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">{"Admin Role"}</Label>
                  <Input id="role" defaultValue="Super Administrator" disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{"About"}</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="Platform administrator managing Saakra Learning operations."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button>{"Save Changes"}</Button>
                  <Button variant="outline">{"Cancel"}</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
