import React, { useState, useRef } from 'react';
import { useFormValidation, validationSchemas } from '../hooks/useFormValidation';
import { assessmentAPI } from '../services/apiService';
import { ProjectSubmission, ProjectFile } from '../types';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ToastContainer';

interface ProjectSubmissionProps {
  courseId: string;
  assessmentId: string;
  onSubmitSuccess?: () => void;
}

const ProjectSubmissionComponent: React.FC<ProjectSubmissionProps> = ({
  courseId,
  assessmentId,
  onSubmitSuccess,
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    useFormValidation({
      initialValues: {
        title: '',
        description: '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};

        if (!values.title.trim()) {
          errors.title = 'Project title is required';
        } else if (values.title.length < 5) {
          errors.title = 'Title must be at least 5 characters';
        }

        if (!values.description.trim()) {
          errors.description = 'Description is required';
        } else if (values.description.length < 20) {
          errors.description = 'Description must be at least 20 characters';
        }

        if (files.length === 0) {
          errors.files = 'At least one file is required';
        }

        return errors;
      },
      onSubmit: async (values) => {
        try {
          const submissionData = {
            title: values.title,
            description: values.description,
            files: files.map((f) => ({
              name: f.name,
              type: f.type,
              url: f.url,
              size: f.size,
            })),
          };

          const { data, error } = await assessmentAPI.submitAssessment(assessmentId, [
            {
              questionId: 'project-submission',
              value: JSON.stringify(submissionData),
            },
          ]);

          if (error) {
            addToast(error, 'error');
          } else if (data) {
            setSubmission(data as ProjectSubmission);
            setIsSubmitted(true);
            addToast('Project submitted successfully!', 'success');
            onSubmitSuccess?.();
          }
        } catch (error) {
          addToast('Failed to submit project', 'error');
        }
      },
    });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file: File) => {
      const error = validationSchemas.validateFile(file, 100, [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'image/png',
        'image/jpeg',
      ]);

      if (error) {
        addToast(error, 'error');
        return;
      }

      // Check for duplicates
      if (files.some((f) => f.name === file.name)) {
        addToast(`File "${file.name}" already added`, 'warning');
        return;
      }

      const newFile: ProjectFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      setFiles((prev) => [...prev, newFile]);
      addToast(`File "${file.name}" added successfully`, 'success');
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    addToast('File removed', 'info');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet')) return '📊';
    if (fileType.includes('zip')) return '📦';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  if (isSubmitted && submission) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Project Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Your project has been successfully submitted. Your instructor will review it shortly.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-3">Submission Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Submission ID:</span>
                <span className="font-mono text-slate-900">{submission.submissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Submitted At:</span>
                <span className="text-slate-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {submission.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setSubmission(null);
              setFiles([]);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Submit Another Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Submit Your Project</h1>
        <p className="text-slate-600 mt-2">
          Upload your project files, provide a title and description, then submit for review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
            Project Title *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g., E-commerce Website Frontend"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              touched.title && errors.title
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          {touched.title && errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Describe your project, what it does, technologies used, and any other relevant details..."
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              touched.description && errors.description
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          <div className="flex justify-between mt-1">
            <div>
              {touched.description && errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
            </div>
            <p className="text-xs text-slate-500">{values.description.length} characters</p>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Project Files *
          </label>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
            />
            <div className="text-4xl mb-2">📁</div>
            <p className="font-semibold text-slate-900 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              PDF, DOC, DOCX, XLS, XLSX, ZIP, PNG, JPG up to 100MB
            </p>
          </div>

          {errors.files && !files.length && (
            <p className="text-red-600 text-sm mt-1">{errors.files}</p>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-slate-900 mb-3">
                Files ({files.length})
              </h3>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="ml-4 text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Make sure all your files are included before submitting. You can
            submit multiple files (e.g., source code, documentation, screenshots).
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setFiles([]);
            }}
            className="flex-1 bg-slate-200 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting || files.length === 0}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSubmissionComponent;
