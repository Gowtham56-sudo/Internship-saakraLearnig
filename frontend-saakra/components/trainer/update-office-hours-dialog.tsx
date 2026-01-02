"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface UpdateOfficeHoursDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateOfficeHoursDialog({ open, onOpenChange }: UpdateOfficeHoursDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const days = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Office Hours Updated",
        description: "Your office hours have been successfully updated.",
      })
      setIsSubmitting(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Office Hours</DialogTitle>
          <DialogDescription>Set your availability for student consultations and questions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={day.id} />
                    <Label htmlFor={day.id} className="font-medium">
                      {day.label}
                    </Label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`${day.id}-start`} className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
                      <Input id={`${day.id}-start`} type="time" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${day.id}-end`} className="text-xs text-muted-foreground">
                        End Time
                      </Label>
                      <Input id={`${day.id}-end`} type="time" className="h-9" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Hours"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
