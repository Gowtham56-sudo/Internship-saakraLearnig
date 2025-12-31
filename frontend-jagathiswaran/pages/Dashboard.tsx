
import React, { useState, useEffect } from 'react';
import { MOCK_COURSES, MOCK_STATS, MOCK_ACTIVITIES } from '../constants';
import CourseCard from '../components/CourseCard';
import { getStudyAdvice } from '../services/geminiService';
import { dashboardAPI } from '../services/apiService';
import { Course, DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data, error } = await dashboardAPI.getDashboardData();
    
    if (data) {
      if (data.stats) setStats(data.stats);
      if (data.courses) setCourses(data.courses);
    }
    
    setLoading(false);
  };

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse('');
    
    const advice = await getStudyAdvice(aiPrompt);
    setAiResponse(advice || 'No response generated.');
    setIsAiLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
        <p className="text-slate-500 mt-1">Check your upcoming deadlines and progress.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Current GPA</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{loading ? '-' : stats.gpa || '0.0'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Courses Completed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '-' : stats.completedCourses || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Learning Hours</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '-' : stats.totalHours || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Attendance</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{loading ? '-' : stats.attendance || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">In Progress</h2>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">No courses yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Start your learning journey by enrolling in a course.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courses.slice(0, 2).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* AI Study Buddy Widget */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold">Saakra AI Buddy</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6">Feeling overwhelmed? Ask me for a study plan or a quick explanation of a complex topic.</p>
              
              <form onSubmit={handleAiConsult} className="relative mb-6">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask anything... e.g., How to learn React faster?"
                  className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 pr-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  disabled={isAiLoading}
                  className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isAiLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </form>

              {aiResponse && (
                <div className="bg-slate-800 rounded-xl p-4 text-sm text-slate-200 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300 max-h-48 overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl -mr-20 -mt-20 rounded-full"></div>
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {MOCK_ACTIVITIES.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-slate-500 font-medium">No recent activity</p>
                <p className="text-slate-400 text-sm mt-2">Your activity feed will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {MOCK_ACTIVITIES.map((activity) => (
                  <div key={activity.id} className="p-4 flex space-x-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'submission' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'grade' ? 'bg-green-50 text-green-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {activity.type === 'submission' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                      {activity.type === 'grade' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {activity.type === 'announcement' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.38a1.745 1.745 0 01-1.49-2.243 1.745 1.745 0 011.49-1.243h3.583l2.147-6.167a1.756 1.756 0 013.417.592z" /></svg>}
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{activity.content}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center">
            <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-xs text-indigo-100 mb-4">Get unlimited access to AI tutoring and specialized certificates.</p>
            <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
