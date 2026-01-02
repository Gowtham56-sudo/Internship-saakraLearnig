"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Clock, Users, BookOpen, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiFetch from "@/lib/api"

function EnrollButton({ courseId }: { courseId: string | number }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(false)

  const handleEnroll = async () => {
    if (enrolled) return
    setLoading(true)
    try {
      await apiFetch("/api/courses/enroll", { method: "POST", body: JSON.stringify({ courseId }) })
      setEnrolled(true)
      toast({ title: "Enrolled", description: "You have been enrolled in the course." })
      // refresh to show updated dashboard / my-courses
      try {
        if (typeof window !== 'undefined') window.location.reload()
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error("Enroll failed", err)
      toast({ title: "Enrollment failed", description: err?.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleEnroll} disabled={loading || enrolled}>
      {enrolled ? "Enrolled" : loading ? "Enrolling…" : "Enroll Now"}
    </Button>
  )
}

export function CourseBrowser() {
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await (await import("@/lib/api")).default("/api/public/courses")
        if (mounted) setCourses(Array.isArray(data) ? data : [])
      } catch (err: any) {
        if (mounted) setError(err?.body?.error || err?.body || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading courses…</div>
  if (error) return <div>Error loading courses: {error}</div>
  if (!courses || courses.length === 0) return <div>No courses found.</div>

  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for courses, skills, or topics..."
            className="h-12 pl-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">{"All Courses"}</TabsTrigger>
          <TabsTrigger value="10th">{"10th Standard"}</TabsTrigger>
          <TabsTrigger value="12th">{"12th Standard"}</TabsTrigger>
          <TabsTrigger value="college">{"College"}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute right-3 top-3 bg-background/90 text-foreground">{course.price}</Badge>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold line-clamp-1">{course.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                  <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{(course.students ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{Array.isArray(course.modules) ? course.modules.length : typeof course.modules === 'number' ? course.modules : 0} modules</span>
                    </div>
                  </div>

                    <EnrollButton courseId={course.id} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="10th">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.level === "10th Standard")
              .map((course) => (
                <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">
                      {course.level}
                    </Badge>
                    <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>
                    <EnrollButton courseId={course.id} />
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="12th">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.level === "12th Standard")
              .map((course) => (
                <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">
                      {course.level}
                    </Badge>
                    <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>
                    <EnrollButton courseId={course.id} />
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="college">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((course) => course.level === "College")
              .map((course) => (
                <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">
                      {course.level}
                    </Badge>
                    <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>
                    <EnrollButton courseId={course.id} />
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
