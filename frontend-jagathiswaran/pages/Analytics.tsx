
import React from 'react';
import { MOCK_STATS, MOCK_COURSES } from '../constants';

const Analytics: React.FC = () => {
  const gpaData = [3.2, 3.4, 3.8, 3.7, 3.85, 3.9];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Detailed overview of your academic performance and study habits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">GPA Trend</h2>
            <div className="flex items-center space-x-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span>+12% vs last term</span>
            </div>
          </div>
          
          {/* Simple SVG Chart */}
          <div className="h-64 w-full relative group">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              <path
                d="M 0 150 Q 100 120 200 80 T 400 30 T 500 10"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
              <g className="text-[10px] fill-slate-400 font-bold">
                {months.map((m, i) => (
                  <text key={i} x={i * 100} y="195" textAnchor="middle">{m}</text>
                ))}
              </g>
              {/* Data points */}
              {[150, 120, 80, 50, 30, 10].map((y, i) => (
                <circle key={i} cx={i * 100} cy={y} r="5" className="fill-indigo-600 cursor-pointer hover:r-7 transition-all" />
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Rank</p>
               <p className="text-2xl font-black text-slate-900 mt-1">#42</p>
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Percentile</p>
               <p className="text-2xl font-black text-slate-900 mt-1">98th</p>
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Top Subject</p>
               <p className="text-2xl font-black text-indigo-600 mt-1">Frontend</p>
             </div>
          </div>
        </div>

        {/* Course Progress Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Course Breakdown</h2>
          <div className="space-y-6">
            {MOCK_COURSES.map(course => (
              <div key={course.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 truncate mr-2">{course.title}</span>
                  <span className="text-xs font-black text-slate-400">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      course.progress > 80 ? 'bg-green-500' :
                      course.progress > 40 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-slate-50">
            <div className="p-4 bg-indigo-50 rounded-2xl flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <p className="text-xs text-indigo-900 font-medium">
                You're completing courses <span className="font-bold">25% faster</span> than the average student.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Card */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Study Habit Insights</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Our AI has analyzed your activity logs. You are most productive between <span className="text-white font-bold">8:00 PM and 11:00 PM</span>. 
              Scheduling your hardest assignments during this window could improve your efficiency by 15%.
            </p>
            <button className="px-6 py-2 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-colors">
              Optimize My Schedule
            </button>
          </div>
          <div className="flex gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                 <path
                   className="stroke-indigo-500"
                   strokeWidth="3"
                   fill="none"
                   strokeDasharray="75, 100"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                 />
               </svg>
               <div className="absolute text-center">
                 <p className="text-2xl font-black">75%</p>
                 <p className="text-[8px] text-slate-400 uppercase">Consistency</p>
               </div>
            </div>
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                 <path
                   className="stroke-emerald-500"
                   strokeWidth="3"
                   fill="none"
                   strokeDasharray="92, 100"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                 />
               </svg>
               <div className="absolute text-center">
                 <p className="text-2xl font-black">92%</p>
                 <p className="text-[8px] text-slate-400 uppercase">Focus Score</p>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <svg className="w-96 h-96" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40,100 Q40,40 100,40 T160,100 T100,160 T40,100" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
