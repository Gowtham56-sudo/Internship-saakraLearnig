"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Mail, Phone, MapPin, Calendar, BookOpen, Award } from "lucide-react"
import apiFetch, { setAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    apiFetch("/api/auth/me")
      .then((res: any) => {
        if (!mounted) return
        setProfile(res.user || null)
      })
      .catch((err: any) => {
        console.error("StudentProfilePage: failed to fetch /api/auth/me", err)
        if (mounted) setProfile(null)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="p-6">Loading profile…</div>

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Profile"}</h1>
          <p className="text-muted-foreground">{"Manage your personal information and preferences"}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile?.avatar || "/diverse-students-studying.png"} alt={profile?.name || "User"} />
                    <AvatarFallback>{(profile?.name && profile.name.split(" ").map((n: string) => n[0]).slice(0,2).join("") ) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-10 w-10 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{profile?.name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{profile?.role || "Student"}</p>
                <div className="mt-6 w-full space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.email || ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone || ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{(profile?.city && profile?.state) ? `${profile.city}, ${profile.state}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h3 className="mb-4 font-semibold">{"Learning Stats"}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">{"Courses Enrolled"}</span>
                  </div>
                  <span className="font-semibold">{profile?.coursesEnrolled ?? "0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm">{"Certificates Earned"}</span>
                  </div>
                  <span className="font-semibold">{profile?.certificates ?? "0"}</span>
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
                    <Input id="firstName" value={(profile?.name && profile.name.split(" ")[0]) || ""} onChange={(e) => setProfile({...profile, name: `${e.target.value} ${profile?.name?.split(" ").slice(1).join(" ")}`})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{"Last Name"}</Label>
                    <Input id="lastName" value={(profile?.name && profile.name.split(" ").slice(1).join(" ")) || ""} onChange={(e) => setProfile({...profile, name: `${profile?.name?.split(" ")[0] || ""} ${e.target.value}`})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{"Email"}</Label>
                  <Input id="email" type="email" value={profile?.email || ""} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{"Phone Number"}</Label>
                  <Input id="phone" type="tel" value={profile?.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">{"City"}</Label>
                    <Input id="city" value={profile?.city || ""} onChange={(e) => setProfile({...profile, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{"State"}</Label>
                    <Input id="state" value={profile?.state || ""} onChange={(e) => setProfile({...profile, state: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">{"Current Education Level"}</Label>
                  <Input id="education" value={profile?.education || ""} onChange={(e) => setProfile({...profile, education: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{"Bio"}</Label>
                  <Textarea id="bio" value={profile?.bio || ""} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={4} />
                </div>

                <div className="flex gap-3">
                  <Button onClick={async () => {
                    try {
                      const updates: any = {
                        name: profile?.name,
                        phone: profile?.phone,
                        city: profile?.city,
                        state: profile?.state,
                        bio: profile?.bio,
                        education: profile?.education,
                      }
                      const resp = await apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(updates) })
                      toast({ title: "Profile saved", description: resp?.message || "Saved" })
                      setProfile(resp.user)
                    } catch (err: any) {
                      console.error("Failed to save profile", err)
                      toast({ title: "Save failed", description: err?.body?.error || String(err) })
                    }
                  }}>{"Save Changes"}</Button>
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
