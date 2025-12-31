
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'trainer' | 'admin';
  avatar?: string;
  status?: 'active' | 'suspended' | 'pending';
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  category: string;
  description: string;
  upcomingDeadline?: string;
}

export interface Activity {
  id: string;
  type: 'submission' | 'grade' | 'announcement';
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  gpa: number;
  completedCourses: number;
  totalHours: number;
  attendance: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Assessment {
  id: string;
  title: string;
  courseId: string;
  duration: number; // minutes
  questions: Question[];
  status: 'pending' | 'completed';
  score?: number;
}

export interface Project {
  id: string;
  title: string;
  courseId: string;
  deadline: string;
  status: 'todo' | 'submitted' | 'graded';
  description: string;
  grade?: string;
}
