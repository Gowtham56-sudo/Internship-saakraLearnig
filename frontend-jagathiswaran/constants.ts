
import { Course, Activity, DashboardStats, Assessment, Project, User } from './types';

// Mock data for development/demo purposes only
// In production, replace these with API calls
export const MOCK_USERS: User[] = [];

export const MOCK_COURSES: Course[] = [];

export const MOCK_ACTIVITIES: Activity[] = [];

export const MOCK_STATS: DashboardStats = {
  gpa: 3.85,
  completedCourses: 12,
  totalHours: 240,
  attendance: 98
};

export const MOCK_ASSESSMENTS: Assessment[] = [];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Building a Scalable Chat App',
    courseId: '1',
    deadline: '2023-11-15',
    status: 'todo',
    description: 'Use WebSockets and React to build a real-time communication platform.'
  },
  {
    id: 'p2',
    title: 'UX Portfolio Case Study',
    courseId: '3',
    deadline: '2023-10-20',
    status: 'graded',
    description: 'Document your research process for a mobile wellness application.',
    grade: 'A+'
  }
];
