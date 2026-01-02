"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Upload, Youtube, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface AddModuleDialogProps {
  onAddModule?: (data: {
    title: string
    description: string
    videos: Array<{ type: "youtube" | "upload"; url?: string; title: string }>
  }) => void
}

export function AddModuleDialog({ onAddModule }: AddModuleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [moduleData, setModuleData] = useState({
    title: "",
    description: "",
  })

  const [videos, setVideos] = useState<Array<{ type: "youtube" | "upload"; url?: string; file?: File; title: string }>>(
    [],
  )
  const [currentVideo, setCurrentVideo] = useState({ type: "youtube" as "youtube" | "upload", url: "", title: "" })

  const handleAddVideo = () => {
    if (currentVideo.type === "youtube" && currentVideo.url && currentVideo.title) {
      setVideos([...videos, { type: "youtube", url: currentVideo.url, title: currentVideo.title }])
      setCurrentVideo({ type: "youtube", url: "", title: "" })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideos([...videos, { type: "upload", file, title: currentVideo.title || file.name }])
      setCurrentVideo({ type: "youtube", url: "", title: "" })
    }
  }

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!moduleData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a module title",
        variant: "destructive",
      })
      return
    }

    if (videos.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one video to the module",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      if (onAddModule) {
        onAddModule({
          title: moduleData.title,
          description: moduleData.description,
          videos: videos.map((v) => ({
            type: v.type,
            url: v.url,
            title: v.title,
          })),
        })
      }

      toast({
        title: "Module Added",
        description: `Module "${moduleData.title}" has been added with ${videos.length} video(s).`,
      })

      setOpen(false)
      setModuleData({ title: "", description: "" })
      setVideos([])
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>
            Create a new module and add video lessons from YouTube or upload your own.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Module Title</Label>
                <Input
                  id="module-title"
                  placeholder="e.g., Introduction to JavaScript"
                  value={moduleData.title}
                  onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  placeholder="What will students learn in this module?"
                  value={moduleData.description}
                  onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Module Videos</Label>
                <p className="text-sm text-muted-foreground">Add video lessons from YouTube or upload recordings</p>
              </div>

              <Tabs defaultValue="youtube" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="youtube" onClick={() => setCurrentVideo({ ...currentVideo, type: "youtube" })}>
                    <Youtube className="mr-2 h-4 w-4" />
                    YouTube Link
                  </TabsTrigger>
                  <TabsTrigger value="upload" onClick={() => setCurrentVideo({ ...currentVideo, type: "upload" })}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title">Lesson Title</Label>
                    <Input
                      id="lesson-title"
                      placeholder="e.g., Variables and Data Types"
                      value={currentVideo.title}
                      onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yt-url">YouTube URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="yt-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={currentVideo.url}
                        onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                      />
                      <Button type="button" onClick={handleAddVideo}>
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="upload-lesson-title">Lesson Title</Label>
                    <Input
                      id="upload-lesson-title"
                      placeholder="e.g., Variables and Data Types"
                      value={currentVideo.title}
                      onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lesson-file">Upload Video File</Label>
                    <Input id="lesson-file" type="file" accept="video/*" onChange={handleFileUpload} />
                    <p className="text-xs text-muted-foreground">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
                  </div>
                </TabsContent>
              </Tabs>

              {videos.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Videos ({videos.length})</Label>
                  <div className="space-y-2">
                    {videos.map((video, index) => (
                      <Card key={index} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          {video.type === "youtube" ? (
                            <Youtube className="h-5 w-5 text-red-500" />
                          ) : (
                            <Upload className="h-5 w-5 text-primary" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{video.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {video.type === "youtube" ? "YouTube Video" : "Uploaded Video"}
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVideo(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
