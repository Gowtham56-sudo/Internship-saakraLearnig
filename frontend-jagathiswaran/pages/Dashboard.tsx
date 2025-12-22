
import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { getStudyAdvice } from '../services/geminiService';
import { Course } from '../types';

const Dashboard: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch('http://localhost:5000/api/dashboard', { headers })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('edu_token');
          throw new Error('Unauthorized - please sign in again');
        }
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setStats(data.stats || {});
        setCourses(data.courses || []);
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    const advice = await getStudyAdvice(aiPrompt);
    setAiResponse(advice || 'No response generated.');
    setIsAiLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here is your latest dashboard.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Current GPA</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.gpa ?? '-'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Courses Completed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.completedCourses ?? '-'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Learning Hours</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalHours ?? '-'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Attendance</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats?.attendance ?? '-'}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">In Progress</h2>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {courses.slice(0, 2).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

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
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 flex space-x-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                    {/* You can add icons based on activity.type here */}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 font-medium">{activity.content}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
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
