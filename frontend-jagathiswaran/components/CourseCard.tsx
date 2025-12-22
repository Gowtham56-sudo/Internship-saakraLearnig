
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider rounded text-indigo-600">
            {course.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{course.title}</h3>
        <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-medium text-slate-600">Progress</span>
            <span className="text-xs font-bold text-indigo-600">{course.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          
          {course.upcomingDeadline && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs text-orange-600 font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Next: {course.upcomingDeadline}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
