// TypeScript types for database schema

export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: "student" | "trainer" | "admin"
  education_level?: string
  avatar_url?: string
  created_at: Date
  updated_at: Date
}

export interface Course {
  id: string
  title: string
  description?: string
  level: "10th Standard" | "12th Standard" | "College"
  category: string
  duration?: string
  thumbnail_url?: string
  status: "draft" | "active" | "archived"
  trainer_id?: string
  created_at: Date
  updated_at: Date
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  duration?: number
  created_at: Date
  updated_at: Date
}

export interface CourseContent {
  id: string
  module_id: string
  title: string
  content_type: "video" | "assignment" | "quiz" | "reading"
  content_url?: string
  description?: string
  order_index: number
  created_at: Date
  updated_at: Date
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrollment_date: Date
  progress: number
  status: "active" | "completed" | "dropped"
  completed_at?: Date
}

export interface StudentProgress {
  id: string
  enrollment_id: string
  content_id: string
  completed: boolean
  completed_at?: Date
  time_spent: number
}

export interface AssignmentSubmission {
  id: string
  student_id: string
  content_id: string
  submission_url?: string
  submission_text?: string
  status: "pending" | "reviewed" | "approved" | "rejected"
  grade?: number
  feedback?: string
  submitted_at: Date
  reviewed_at?: Date
  reviewed_by?: string
}

export interface LiveSession {
  id: string
  course_id: string
  trainer_id: string
  title: string
  description?: string
  session_date: Date
  duration: number
  meeting_url?: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  created_at: Date
}

export interface SessionAttendance {
  id: string
  session_id: string
  student_id: string
  attended: boolean
  joined_at?: Date
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  certificate_number: string
  issue_date: Date
  qr_code_url?: string
  certificate_url?: string
}
