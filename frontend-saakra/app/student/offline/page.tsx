"use client"

import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Wifi, WifiOff, CheckCircle, HardDrive } from "lucide-react"
import { useState } from "react"

export default function OfflineLearningPage() {
  const [downloadedCourses] = useState([
    { id: 1, title: "Web Development Basics", size: "450 MB", videos: 12, downloaded: true },
    { id: 2, title: "Python for Beginners", size: "380 MB", videos: 10, downloaded: true },
  ])

  const [availableCourses] = useState([
    { id: 3, title: "Data Structures", size: "520 MB", videos: 15, downloaded: false },
    { id: 4, title: "Machine Learning", size: "680 MB", videos: 18, downloaded: false },
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Offline Learning</h1>
          </div>
          <p className="text-muted-foreground">Download courses to learn without internet connection</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Storage Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">830 MB</div>
              <p className="text-sm text-muted-foreground">2 courses downloaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">Online</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Ready to download new content</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Downloaded Courses</CardTitle>
            <CardDescription>Access these courses anytime, even without internet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {downloadedCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.videos} videos • {course.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Open Course
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available for Download</CardTitle>
            <CardDescription>Download courses to access them offline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.videos} videos • {course.size}
                      </p>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
