// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('edu_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const apiCall = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<{ data?: T; error?: string; status: number }> => {
  try {
    const options: RequestInit = {
      method,
      headers: getHeaders(),
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle unauthorized
    if (response.status === 401) {
      localStorage.removeItem('edu_token');
      localStorage.removeItem('edu_user');
      window.location.hash = '#/login';
      return { error: 'Unauthorized. Please log in again.', status: 401 };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || data.error || 'API request failed',
        status: response.status,
      };
    }

    return { data: data.data || data, status: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    return { error: errorMessage, status: 500 };
  }
};

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    return apiCall('/auth/register', 'POST', { name, email, password });
  },

  // Login user
  login: async (uid: string) => {
    return apiCall('/auth/login', 'POST', { uid });
  },

  // Update user role (admin only)
  updateRole: async (uid: string, role: 'student' | 'trainer' | 'admin') => {
    return apiCall('/auth/update-role', 'PUT', { uid, role });
  },

  // Create trainer (admin only)
  createTrainer: async (name: string, email: string, password: string, phone?: string) => {
    return apiCall('/auth/create-trainer', 'POST', { name, email, password, phone });
  },

  // Create admin (admin only)
  createAdmin: async (name: string, email: string, password: string, phone?: string) => {
    return apiCall('/auth/create-admin', 'POST', { name, email, password, phone });
  },
};

// Course API calls
export const courseAPI = {
  // Get all courses
  getAllCourses: async () => {
    return apiCall('/courses');
  },

  // Add new course (trainer only)
  addCourse: async (title: string, description: string) => {
    return apiCall('/courses/add', 'POST', { title, description });
  },

  // Enroll in course (student only)
  enrollCourse: async (courseId: string) => {
    return apiCall('/courses/enroll', 'POST', { courseId });
  },

  // Get students in a course (trainer/admin)
  getCourseStudents: async (courseId: string) => {
    return apiCall(`/courses/${courseId}/students`);
  },
};



// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard data
  getDashboardData: async () => {
    return apiCall('/dashboard');
  },
};

// User API calls
export const userAPI = {
  // Get user profile
  getUser: async (uid: string) => {
    return apiCall(`/users/${uid}`);
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    return apiCall('/users');
  },
};

// Assessment API calls
export const assessmentAPI = {
  // Get assessments for a course
  getCourseAssessments: async (courseId: string) => {
    return apiCall(`/assessments/course/${courseId}`);
  },

  // Get specific assessment
  getAssessment: async (assessmentId: string) => {
    return apiCall(`/assessments/${assessmentId}`);
  },

  // Submit assessment/quiz
  submitAssessment: async (assessmentId: string, answers: any[]) => {
    return apiCall(`/assessments/${assessmentId}/submit`, 'POST', {
      answers,
    });
  },

  // Get user's assessment submission
  getUserSubmission: async (assessmentId: string) => {
    return apiCall(`/assessments/${assessmentId}/submission`);
  },

  // Get assessment analytics
  getAssessmentAnalytics: async (assessmentId: string) => {
    return apiCall(`/assessments/${assessmentId}/analytics`);
  },

  // Get user's submissions
  getUserSubmissions: async () => {
    return apiCall(`/assessments/user/submissions`);
  },

  // Create assessment (admin only)
  createAssessment: async (courseId: string, assessmentData: any) => {
    return apiCall('/assessments/create', 'POST', {
      courseId,
      ...assessmentData,
    });
  },
};

// Progress API calls
export const progressAPI = {
  // Get progress for a course
  getCourseProgress: async (courseId: string, userId?: string) => {
    const endpoint = userId
      ? `/progress/${userId}/${courseId}`
      : `/progress/current/${courseId}`;
    return apiCall(endpoint);
  },

  // Get all progress for user
  getUserProgress: async (userId?: string) => {
    const endpoint = userId ? `/progress/${userId}` : `/progress/user`;
    return apiCall(endpoint);
  },

  // Update progress
  updateProgress: async (courseId: string, progressData: any) => {
    return apiCall(`/progress/update/${courseId}`, 'PUT', progressData);
  },

  // Get progress analytics
  getProgressAnalytics: async (courseId: string, userId?: string) => {
    const endpoint = userId
      ? `/progress/${userId}/${courseId}/analytics`
      : `/progress/current/${courseId}/analytics`;
    return apiCall(endpoint);
  },

  // Record learning activity
  recordActivity: async (courseId: string, activity: any) => {
    return apiCall(`/progress/record-activity/${courseId}`, 'POST', activity);
  },
};

// Analytics API calls
export const analyticsAPI = {
  // Get user analytics
  getUserAnalytics: async (userId?: string) => {
    const endpoint = userId ? `/analytics/user/${userId}` : `/analytics/user`;
    return apiCall(endpoint);
  },

  // Get course analytics
  getCourseAnalytics: async (courseId: string) => {
    return apiCall(`/analytics/course/${courseId}`);
  },

  // Evaluate a submission (trainer/admin)
  evaluateSubmission: async (submissionId: string) => {
    return apiCall('/analytics/evaluation/submission', 'POST', { submissionId });
  },

  // Evaluate a user's performance across a course (trainer/admin)
  evaluateUserPerformance: async (userId: string, courseId: string) => {
    return apiCall('/analytics/evaluation/user', 'POST', { userId, courseId });
  },

  // Get admin dashboard
  getAdminAnalytics: async () => {
    return apiCall('/analytics/admin');
  },

  // Record engagement event
  recordEngagementEvent: async (eventData: any) => {
    return apiCall('/analytics/record-event', 'POST', eventData);
  },

  // Get engagement timeline
  getEngagementTimeline: async (userId?: string, days: number = 30) => {
    const endpoint = userId
      ? `/analytics/engagement/${userId}?days=${days}`
      : `/analytics/engagement?days=${days}`;
    return apiCall(endpoint);
  },
};

// Certificate API calls
export const certificateAPI = {
  // Get user certificates
  getUserCertificates: async (userId?: string) => {
    const endpoint = userId ? `/certificates/user/${userId}` : `/certificates/user`;
    return apiCall(endpoint);
  },

  // Get specific certificate
  getCertificate: async (certificateId: string) => {
    return apiCall(`/certificates/${certificateId}`);
  },

  // Check certificate eligibility
  checkEligibility: async (courseId: string, userId?: string) => {
    const endpoint = userId
      ? `/certificates/eligibility/${courseId}?userId=${userId}`
      : `/certificates/eligibility/${courseId}`;
    return apiCall(endpoint);
  },

  // Generate certificate
  generateCertificate: async (courseId: string) => {
    return apiCall(`/certificates/generate/${courseId}`, 'POST');
  },

  // Verify certificate
  verifyCertificate: async (certificateId: string) => {
    return apiCall(`/certificates/${certificateId}/verify`);
  },

  // Get certificate statistics
  getCertificateStats: async () => {
    return apiCall('/certificates/statistics');
  },
};

// Query Optimization API calls
export const queryAPI = {
  // Get optimized user progress
  getOptimizedProgress: async (userId?: string) => {
    const endpoint = userId
      ? `/optimization/progress/${userId}`
      : `/optimization/progress`;
    return apiCall(endpoint);
  },

  // Get optimized course analytics
  getOptimizedCourseAnalytics: async (courseId: string) => {
    return apiCall(`/optimization/analytics/course/${courseId}`);
  },

  // Bulk update progress
  bulkUpdateProgress: async (updates: any[]) => {
    return apiCall('/optimization/bulk-update', 'PUT', { updates });
  },

  // Paginated query
  paginatedQuery: async (resource: string, page: number = 1, limit: number = 20) => {
    return apiCall(`/optimization/${resource}?page=${page}&limit=${limit}`);
  },
};

export default apiCall;
