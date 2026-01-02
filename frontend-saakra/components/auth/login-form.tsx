"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { setAuthToken } from "@/lib/api"
import { signIn as firebaseSignIn } from "@/lib/firebaseClient"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = (formData.get("email") as string) || ""
    const password = (formData.get("password") as string) || ""

    try {
      // Sign in with Firebase client SDK and get ID token
      const { token, uid } = await firebaseSignIn(email, password)

      // Persist token for api helper
      setAuthToken(token)

      // Tell backend about login so it can provision/read profile
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid }),
      })

      const body = await resp.json()
      if (!resp.ok) throw new Error(body?.error || JSON.stringify(body))

      toast({ title: "Login successful", description: `Welcome back` })

      // Redirect based on role returned from backend (fallback to active tab)
      const role = body.role || activeTab
      if (role === "student") router.push("/student/dashboard")
      else if (role === "trainer") router.push("/trainer/dashboard")
      else router.push("/admin/dashboard")
    } catch (err: any) {
      console.error(err)
      toast({ title: "Login failed", description: err?.message || String(err) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="student" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="student">{"Student"}</TabsTrigger>
        <TabsTrigger value="trainer">{"Trainer"}</TabsTrigger>
        <TabsTrigger value="admin">{"Admin"}</TabsTrigger>
      </TabsList>

      <TabsContent value="student">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-email">{"Email"}</Label>
              <Input name="email" id="student-email" type="email" placeholder="you@domain.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="student-password">{"Password"}</Label>
                <Button variant="link" className="h-auto p-0 text-xs" type="button">
                  {"Forgot password?"}
                </Button>
              </div>
              <Input name="password" id="student-password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Student"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="trainer">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trainer-email">{"Email"}</Label>
              <Input name="email" id="trainer-email" type="email" placeholder="you@domain.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="trainer-password">{"Password"}</Label>
                <Button variant="link" className="h-auto p-0 text-xs" type="button">
                  {"Forgot password?"}
                </Button>
              </div>
              <Input name="password" id="trainer-password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Trainer"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="admin">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">{"Email"}</Label>
              <Input name="email" id="admin-email" type="email" placeholder="you@domain.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password">{"Password"}</Label>
                <Button variant="link" className="h-auto p-0 text-xs" type="button">
                  {"Forgot password?"}
                </Button>
              </div>
              <Input name="password" id="admin-password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
