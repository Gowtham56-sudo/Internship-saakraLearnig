
import React, { useState, useEffect } from 'react';
import { MOCK_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { courseAPI } from '../services/apiService';
import { Course } from '../types';

const Courses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(true);
  const categories = courses.length > 0 ? ['all', ...Array.from(new Set(courses.map(c => c.category.toLowerCase())))] : ['all'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await courseAPI.getAllCourses();
    
    if (data && Array.isArray(data)) {
      setCourses(data);
    }
    
    setLoading(false);
  };

  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(c => c.category?.toLowerCase() === activeTab);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 mt-1">You are currently enrolled in {courses.length} courses.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Enroll in New Course
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
              activeTab === cat 
                ? 'bg-slate-900 border-slate-900 text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="text-slate-500 font-medium">No courses found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;
