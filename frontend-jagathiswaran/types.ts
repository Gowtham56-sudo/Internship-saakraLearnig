
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
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
