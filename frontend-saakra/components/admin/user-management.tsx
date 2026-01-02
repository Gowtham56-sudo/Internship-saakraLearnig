"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, UserPlus } from "lucide-react"
import apiFetch from "@/lib/api"

export function UserManagement() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch("/api/users")
      .then((res) => {
        if (!mounted) return
        setUsers(Array.isArray(res) ? res : [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.body ?? err?.message ?? "Failed to load users")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const { students, trainers } = useMemo(() => {
    const filtered = users.filter((u) => {
      const term = query.trim().toLowerCase()
      if (!term) return true
      return (
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.id || "").toLowerCase().includes(term)
      )
    })

    return {
      students: filtered.filter((u) => (u.role || "").toLowerCase() === "student"),
      trainers: filtered.filter((u) => (u.role || "").toLowerCase() === "trainer"),
    }
  }, [users, query])

  return (
    <Card className="p-6">
      <Tabs defaultValue="students" className="w-full">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{"User Management"}</h2>
          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="students">{"Students"}</TabsTrigger>
              <TabsTrigger value="trainers">{"Trainers"}</TabsTrigger>
            </TabsList>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              {"Add User"}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && <div className="p-4 text-sm text-muted-foreground">Loading users...</div>}
        {error && <div className="p-4 text-sm text-red-600">Error loading users: {String(error)}</div>}

        <TabsContent value="students" className="space-y-4">
          <div className="rounded-lg border">
            <div className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
              <div>{"User"}</div>
              <div>{"Email"}</div>
              <div>{"Courses"}</div>
              <div>{"Progress"}</div>
              <div>{"Status"}</div>
              <div></div>
            </div>
            {students.length === 0 && !loading && (
              <div className="p-4 text-sm text-muted-foreground">No students found.</div>
            )}
            {students.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 border-b p-4 text-sm last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback>{(student.name || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.name || "Student"}</span>
                </div>
                <div className="flex items-center text-muted-foreground">{student.email || "-"}</div>
                <div className="flex items-center">{student.courses?.length ?? student.enrollmentsCount ?? 0}</div>
                <div className="flex items-center">{student.progress?.completedPercentage ?? 0}%</div>
                <div className="flex items-center">
                  <Badge variant="default">{student.status || "active"}</Badge>
                </div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{"View Profile"}</DropdownMenuItem>
                      <DropdownMenuItem>{"View Courses"}</DropdownMenuItem>
                      <DropdownMenuItem>{"Send Message"}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">{"Suspend User"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trainers" className="space-y-4">
          <div className="rounded-lg border">
            <div className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
              <div>{"Trainer"}</div>
              <div>{"Email"}</div>
              <div>{"Courses"}</div>
              <div>{"Students"}</div>
              <div>{"Rating"}</div>
              <div></div>
            </div>
            {trainers.length === 0 && !loading && (
              <div className="p-4 text-sm text-muted-foreground">No trainers found.</div>
            )}
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 border-b p-4 text-sm last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trainer.avatar || "/placeholder.svg"} alt={trainer.name} />
                    <AvatarFallback>{(trainer.name || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{trainer.name || "Trainer"}</span>
                </div>
                <div className="flex items-center text-muted-foreground">{trainer.email || "-"}</div>
                <div className="flex items-center">{trainer.courses?.length ?? trainer.courseCount ?? 0}</div>
                <div className="flex items-center">{trainer.students ?? trainer.studentCount ?? 0}</div>
                <div className="flex items-center">{trainer.rating ?? "-"}</div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{"View Profile"}</DropdownMenuItem>
                      <DropdownMenuItem>{"View Courses"}</DropdownMenuItem>
                      <DropdownMenuItem>{"Performance Report"}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">{"Remove Trainer"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
