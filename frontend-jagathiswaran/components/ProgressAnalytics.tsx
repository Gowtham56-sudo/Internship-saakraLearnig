import React, { useState, useEffect } from 'react';
import { progressAPI, analyticsAPI } from '../services/apiService';
import { ProgressAnalytics, UserEngagementMetrics } from '../types';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ToastContainer';

interface ProgressAnalyticsProps {
  courseId?: string;
  userId?: string;
}

const ProgressAnalyticsComponent: React.FC<ProgressAnalyticsProps> = ({ courseId, userId }) => {
  const [progress, setProgress] = useState<ProgressAnalytics | null>(null);
  const [engagement, setEngagement] = useState<UserEngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 7 | 90>(30);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [courseId, userId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load progress analytics
      if (courseId) {
        const { data: progressData, error: progressError } =
          await progressAPI.getProgressAnalytics(courseId, userId);
        if (progressError) {
          addToast(progressError, 'error');
        } else if (progressData) {
          setProgress(progressData as ProgressAnalytics);
        }
      }

      // Load engagement metrics
      const { data: engagementData, error: engagementError } =
        await analyticsAPI.getEngagementTimeline(userId, selectedPeriod);
      if (engagementError) {
        addToast(engagementError, 'error');
      } else if (engagementData) {
        setEngagement(engagementData as UserEngagementMetrics);
      }
    } catch (error) {
      addToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderMilestoneBar = () => {
    const milestones = progress?.milestonesAchieved || [];
    const percentage = progress?.completedPercentage || 0;

    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-slate-900">Course Progress</h3>
            <span className="text-lg font-bold text-indigo-600">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {milestones.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Milestones Achieved</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { percentage: 25, label: '25% Complete' },
                { percentage: 50, label: '50% Complete' },
                { percentage: 75, label: '75% Complete' },
                { percentage: 100, label: 'Completed' },
              ].map((milestone) => {
                const achieved = milestones.some(
                  (m) => m.percentage === milestone.percentage && m.achieved
                );
                return (
                  <div
                    key={milestone.percentage}
                    className={`p-3 rounded-lg text-center transition-all ${
                      achieved
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-slate-100 border border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {achieved ? (
                        <span className="text-green-600 text-xl">✓</span>
                      ) : (
                        <span className="text-slate-400 text-xl">○</span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold ${achieved ? 'text-green-700' : 'text-slate-700'}`}>
                      {milestone.label}
                    </p>
                    {achieved && milestones.find((m) => m.percentage === milestone.percentage)?.achievedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        {new Date(
                          milestones.find((m) => m.percentage === milestone.percentage)?.achievedAt || ''
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEngagementChart = () => {
    if (!engagement?.courseMetrics) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Course Engagement</h3>
        <div className="space-y-4">
          {engagement.courseMetrics.map((metric) => (
            <div key={metric.courseId}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">{metric.courseTitle}</span>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round(metric.engagementScore)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
                  style={{ width: `${metric.engagementScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {Math.round(metric.timeSpent / 60)} hours
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeStats = () => {
    if (!progress) return null;

    const hours = Math.floor(progress.timeSpent / 60);
    const minutes = progress.timeSpent % 60;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">TIME SPENT</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {hours}h {minutes}m
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-semibold">ASSESSMENTS PASSED</p>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {progress.assessmentsPassed || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">ENGAGEMENT SCORE</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {Math.round(progress.engagementScore || 0)}%
          </p>
        </div>
      </div>
    );
  };

  const isEligibleForCertificate = progress?.certificateEligible;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress Analytics</h1>
          <p className="text-slate-600 mt-1">Track your learning journey and achievements</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as 7 | 30 | 90)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Last {period} days
          </button>
        ))}
      </div>

      {/* Main Grid */}
      {progress ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Bar */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              {renderMilestoneBar()}
            </div>

            {/* Time Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
              {renderTimeStats()}
            </div>

            {/* Certificate Eligibility */}
            {isEligibleForCertificate && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">You're Eligible for a Certificate!</h3>
                    <p className="text-slate-700 mb-4">
                      Congratulations! You've completed enough of this course to earn a certificate of completion.
                    </p>
                    <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors font-semibold">
                      Generate Certificate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Engagement */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            {engagement ? renderEngagementChart() : <p className="text-slate-600">No engagement data available</p>}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-slate-600">No progress data available yet. Start learning to see your analytics!</p>
        </div>
      )}

      {/* Activity Timeline */}
      {engagement && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Learning Timeline</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Total Learning Hours</p>
                <p className="text-sm text-slate-600">Across all courses</p>
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {Math.round(engagement.totalHours)}h
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Total Activities</p>
                <p className="text-sm text-slate-600">Completed actions</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{engagement.totalActivities}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Last Active</p>
                <p className="text-sm text-slate-600">
                  {new Date(engagement.lastActiveAt).toLocaleDateString()}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalyticsComponent;
