
import React, { useState } from 'react';
import { MOCK_PROJECTS, MOCK_COURSES } from '../constants';
import { Project } from '../types';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock upload delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedProject(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Submit your assignments and view your grades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Your Assignments</h2>
          {MOCK_PROJECTS.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full p-5 rounded-2xl border text-left transition-all ${
                selectedProject?.id === project.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'graded' ? 'bg-green-100 text-green-700' : 
                  project.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {project.status}
                </span>
                {project.grade && <span className="font-bold text-sm">{project.grade}</span>}
              </div>
              <h3 className="font-bold line-clamp-1">{project.title}</h3>
              <p className={`text-xs mt-1 ${selectedProject?.id === project.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                Deadline: {project.deadline}
              </p>
            </button>
          ))}
        </div>

        {/* Detail/Submission View */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm animate-in fade-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h2>
                  <p className="text-indigo-600 font-medium text-sm">
                    Course: {MOCK_COURSES.find(c => c.id === selectedProject.courseId)?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Deadline</p>
                  <p className="text-sm font-bold text-red-600">{selectedProject.deadline}</p>
                </div>
              </div>

              <div className="prose prose-slate prose-sm max-w-none mb-8">
                <h4 className="text-slate-800 font-bold mb-2">Instructions</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.description}</p>
              </div>

              {selectedProject.status === 'todo' ? (
                <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Submission Notes</label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      placeholder="Enter any comments or links to your work (e.g., GitHub repo)..."
                    />
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600">Click or drag files to upload</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, ZIP or MP4 (Max 50MB)</p>
                  </div>

                  <button
                    disabled={isSubmitting || showSuccess}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
                      showSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSubmitting ? (
                       <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : showSuccess ? (
                      <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Submitted!</span>
                    ) : 'Submit Project'}
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">Submission Received</p>
                      <p className="text-xs text-slate-500">Grading usually takes 3-5 business days.</p>
                    </div>
                  </div>
                  {selectedProject.grade && (
                    <div className="text-center bg-white px-4 py-2 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Final Grade</p>
                      <p className="text-xl font-black text-green-600">{selectedProject.grade}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Select a project</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Choose an assignment from the sidebar to view details and submit your work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
