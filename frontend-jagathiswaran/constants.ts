
import { Course, Activity, DashboardStats } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced React & TypeScript',
    instructor: 'Dr. Sarah Connor',
    progress: 75,
    image: 'https://picsum.photos/seed/react/400/250',
    category: 'Computer Science',
    description: 'Master the intricacies of high-performance web applications.',
    upcomingDeadline: 'Oct 24, 2023'
  },
  {
    id: '2',
    title: 'Neural Networks 101',
    instructor: 'Prof. Alan Turing',
    progress: 45,
    image: 'https://picsum.photos/seed/neural/400/250',
    category: 'Artificial Intelligence',
    description: 'A deep dive into the architecture of modern AI systems.'
  },
  {
    id: '3',
    title: 'User Experience Research',
    instructor: 'Emily Zhang',
    progress: 90,
    image: 'https://picsum.photos/seed/ux/400/250',
    category: 'Design',
    description: 'Quantitative and qualitative methods for better product design.',
    upcomingDeadline: 'Oct 28, 2023'
  },
  {
    id: '4',
    title: 'Distributed Systems',
    instructor: 'Kevin Mitnick',
    progress: 20,
    image: 'https://picsum.photos/seed/cloud/400/250',
    category: 'System Design',
    description: 'Learn how to scale applications across global infrastructure.'
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'submission',
    content: 'Assignment "Hook Patterns" submitted successfully.',
    timestamp: '2 hours ago'
  },
  {
    id: 'a2',
    type: 'grade',
    content: 'You received an A on your "UX Case Study".',
    timestamp: '5 hours ago'
  },
  {
    id: 'a3',
    type: 'announcement',
    content: 'New lecture available: "Async patterns in TS".',
    timestamp: 'Yesterday'
  }
];

export const MOCK_STATS: DashboardStats = {
  gpa: 3.85,
  completedCourses: 12,
  totalHours: 240,
  attendance: 98
};
