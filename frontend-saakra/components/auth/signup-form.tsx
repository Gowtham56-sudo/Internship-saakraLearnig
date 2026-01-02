"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "Account created successfully",
        description: "Welcome to Saakra Learning! Redirecting to your dashboard...",
      })

      // Redirect to student dashboard after signup
      router.push("/student/dashboard")
    }, 1500)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">{"First Name"}</Label>
            <Input id="first-name" placeholder="Rahul" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">{"Last Name"}</Label>
            <Input id="last-name" placeholder="Sharma" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{"Email"}</Label>
          <Input id="email" type="email" placeholder="rahul@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="education-level">{"Education Level"}</Label>
          <Select required>
            <SelectTrigger id="education-level">
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10th">{"10th Standard"}</SelectItem>
              <SelectItem value="12th">{"12th Standard"}</SelectItem>
              <SelectItem value="college">{"College Student"}</SelectItem>
              <SelectItem value="graduate">{"Graduate"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{"Password"}</Label>
          <Input id="password" type="password" placeholder="Create a strong password" required />
          <p className="text-xs text-muted-foreground">{"Must be at least 8 characters long"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">{"Confirm Password"}</Label>
          <Input id="confirm-password" type="password" placeholder="Re-enter your password" required />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Card>
  )
}
