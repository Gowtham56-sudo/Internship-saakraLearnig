
import React, { useEffect, useState } from 'react';
import { courseAPI, assessmentAPI, analyticsAPI } from '../services/apiService';

const GradingHub: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssessmentAnalytics, setSelectedAssessmentAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [evalUserId, setEvalUserId] = useState('');
  const [evalResult, setEvalResult] = useState<any | null>(null);

  const currentUser = localStorage.getItem('edu_user') ? JSON.parse(localStorage.getItem('edu_user')!) : null;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await courseAPI.getAllCourses();
    setLoading(false);

    if (data && Array.isArray(data)) {
      // trainer sees only own courses
      const trainerCourses = currentUser?.role === 'trainer' ? data.filter((c: any) => c.trainerId === currentUser.id) : data;
      setCourses(trainerCourses);
      if (trainerCourses.length > 0) setSelectedCourse(trainerCourses[0]);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      loadAssessments(selectedCourse.id);
      loadStudents(selectedCourse.id);
    }
    else setAssessments([]);
  }, [selectedCourse]);

  const loadAssessments = async (courseId: string) => {
    setLoading(true);
    const { data, error } = await assessmentAPI.getCourseAssessments(courseId);
    setLoading(false);
    if (data && Array.isArray(data.assessments)) {
      setAssessments(data.assessments);
    } else {
      setAssessments([]);
    }
    setSelectedAssessmentAnalytics(null);
  };

  const loadStudents = async (courseId: string) => {
    setLoading(true);
    const { data, error } = await courseAPI.getCourseStudents(courseId);
    setLoading(false);
    if (data && Array.isArray(data.students)) {
      setStudents(data.students);
    } else {
      setStudents([]);
    }
  };

  const viewAssessmentAnalytics = async (assessmentId: string) => {
    setLoading(true);
    const { data, error } = await assessmentAPI.getAssessmentAnalytics(assessmentId);
    setLoading(false);
    setSelectedAssessmentAnalytics(data || null);
  };

  const evaluateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalUserId || !selectedCourse) return;
    setLoading(true);
    const { data, error } = await analyticsAPI.evaluateUserPerformance(evalUserId, selectedCourse.id);
    setLoading(false);
    if (data) setEvalResult(data);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Grading Hub</h1>
        <p className="text-slate-500 mt-1">Review assessments, view analytics and evaluate student performance.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Your Courses</h3>
          {loading && courses.length === 0 ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses found.</p>
          ) : (
            <ul className="space-y-2">
              {courses.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedCourse(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedCourse?.id === c.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}>
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Students</h3>
          {loading && students.length === 0 ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-500">No students enrolled.</p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{s.name || s.email}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <div className="text-xs text-slate-500">{s.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Assessments</h3>
          {!selectedCourse ? (
            <p className="text-sm text-slate-500">Select a course to view assessments.</p>
          ) : assessments.length === 0 ? (
            <p className="text-sm text-slate-500">No assessments found for this course.</p>
          ) : (
            <div className="space-y-4">
              {assessments.map((a) => (
                <div key={a.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">Type: {a.type} • Passing: {a.passingScore}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => viewAssessmentAnalytics(a.id)} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">View Analytics</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedAssessmentAnalytics && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold">Assessment Analytics — {selectedAssessmentAnalytics.assessmentTitle}</h4>
              <p className="text-sm text-slate-600">Total submissions: {selectedAssessmentAnalytics.totalSubmissions}</p>
              <p className="text-sm text-slate-600">Average score: {selectedAssessmentAnalytics.averageScore}%</p>
              <p className="text-sm text-slate-600">Pass rate: {selectedAssessmentAnalytics.passRate}%</p>
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <h4 className="font-bold mb-2">Evaluate Student Performance</h4>
            <form onSubmit={evaluateUser} className="flex gap-2">
              <input type="text" placeholder="Student UID" value={evalUserId} onChange={(e) => setEvalUserId(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Evaluate</button>
            </form>

            {evalResult && (
              <div className="mt-4 p-3 bg-white border rounded-lg">
                <p className="text-sm font-bold">User: {evalResult.userId}</p>
                <p className="text-sm">Total assessments: {evalResult.totalAssessments}</p>
                <p className="text-sm">Pass rate: {evalResult.passRate}%</p>
                <p className="text-sm">Overall grade: {evalResult.multiCriteriaEvaluation?.overallGrade?.grade || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingHub;
