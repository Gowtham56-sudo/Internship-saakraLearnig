"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Mail, Phone, MapPin, Calendar, Users, BookOpen } from "lucide-react"
import apiFetch from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProfileForm() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>({})
  const [form, setForm] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    apiFetch("/api/auth/me")
      .then((res: any) => {
        if (!mounted) return
        const p = res.user || {}
        setProfile(p)
        // initialize editable form fields, split name into first/last
        const nameParts = (p.name || "").split(" ")
        setForm({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: p.phone || "",
          city: p.city || "",
          state: p.state || "",
          bio: p.bio || "",
          education: p.education || "",
          experience: p.experience || "",
        })
      })
      .catch((err: any) => {
        console.error("ProfileForm: failed to fetch /api/auth/me", err)
        if (mounted) setProfile(null)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    try {
      const updates: any = {}
      const name = `${(form.firstName || "").trim()} ${(form.lastName || "").trim()}`.trim()
      if (name) updates.name = name
      if (form.phone !== undefined) updates.phone = form.phone
      if (form.city !== undefined) updates.city = form.city
      if (form.state !== undefined) updates.state = form.state
      if (form.bio !== undefined) updates.bio = form.bio
      if (form.education !== undefined) updates.education = form.education
      if (form.experience !== undefined) updates.experience = form.experience

      if (Object.keys(updates).length === 0) {
        toast({ title: "Nothing to save", description: "No changes detected" })
        return
      }

      setLoading(true)
      const res = await apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(updates) })
      // backend returns { message, user }
      if (res?.user) {
        setProfile(res.user)
        const nameParts = (res.user.name || "").split(" ")
        setForm((f: any) => ({ ...f, firstName: nameParts[0] || "", lastName: nameParts.slice(1).join(" ") || "" }))
      }
      toast({ title: "Profile saved", description: "Your profile was updated" })
    } catch (err: any) {
      console.error("Profile save failed", err)
      toast({ title: "Save failed", description: err?.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Card className="p-6">Loading...</Card>

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar || "/placeholder-user.jpg"} alt={profile.name || "User"} />
                <AvatarFallback>{(profile.name && profile.name.charAt(0)) || "U"}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-10 w-10 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="mt-4 text-2xl font-bold">{profile.name || ""}</h2>
            <p className="text-sm text-muted-foreground">{profile.role || ""}</p>
            <div className="mt-6 w-full space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email || ""}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone || ""}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.institution || ""}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-semibold">{"Training Stats"}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm">{"Courses Created"}</span>
              </div>
              <span className="font-semibold">{profile.coursesCreated || ""}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">{"Students Trained"}</span>
              </div>
              <span className="font-semibold">{profile.studentsTrained || ""}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">{"Professional Information"}</h3>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{"First Name"}</Label>
                <Input
                  id="firstName"
                  value={form.firstName || ""}
                  onChange={(e) => setForm((s: any) => ({ ...s, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{"Last Name"}</Label>
                <Input
                  id="lastName"
                  value={form.lastName || ""}
                  onChange={(e) => setForm((s: any) => ({ ...s, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{"Email"}</Label>
              <Input id="email" type="email" value={profile.email || ""} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{"Phone Number"}</Label>
              <Input id="phone" type="tel" value={form.phone || ""} onChange={(e) => setForm((s: any) => ({ ...s, phone: e.target.value }))} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">{"City"}</Label>
                <Input id="city" value={form.city || ""} onChange={(e) => setForm((s: any) => ({ ...s, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{"State"}</Label>
                <Input id="state" value={form.state || ""} onChange={(e) => setForm((s: any) => ({ ...s, state: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="specialization">{"Specialization"}</Label>
                <Input id="specialization" value={form.education || profile.specialization || ""} onChange={(e) => setForm((s: any) => ({ ...s, education: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">{"Years of Experience"}</Label>
              <Input
                id="experience"
                type="number"
                value={form.experience ?? profile.experience ?? ""}
                onChange={(e) => setForm((s: any) => ({ ...s, experience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{"Professional Bio"}</Label>
              <Textarea id="bio" value={form.bio || ""} onChange={(e) => setForm((s: any) => ({ ...s, bio: e.target.value }))} rows={4} />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              <Button variant="outline">{"Cancel"}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
