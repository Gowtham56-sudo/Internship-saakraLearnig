const { db } = require("../config/firebase");

/**
 * ANALYTICS SERVICE
 * Collects and provides analytics data for courses, users, and assessments
 */

// Calculate engagement metrics for a user
exports.calculateEngagementMetrics = (progress) => {
  if (!progress) return null;

  const timeSpent = progress.timeSpent || 0;
  const completionPercentage = progress.completedPercentage || 0;
  const daysSinceStart = calculateDaysSince(progress.createdAt);

  return {
    timeSpentHours: Math.round(timeSpent / 60),
    completionPercentage,
    engagementScore: calculateEngagementScore(
      completionPercentage,
      timeSpent,
      daysSinceStart
    ),
    paceCategory: categorizeLearnPace(timeSpent, completionPercentage, daysSinceStart),
    milestonesAchieved: (progress.milestonesAchieved || []).length,
  };
};

// Record user engagement event
exports.recordEngagementEvent = async (userId, eventType, eventData) => {
  try {
    const event = {
      userId,
      eventType, // "lesson_viewed", "assessment_submitted", "course_started", etc.
      eventData,
      timestamp: new Date(),
      date: new Date().toISOString().split("T")[0], // For date-based queries
    };

    const docRef = await db.collection("engagement_events").add(event);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get user engagement timeline
exports.getUserEngagementTimeline = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await db
      .collection("engagement_events")
      .where("userId", "==", userId)
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "asc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Aggregate by date
    const timeline = {};
    events.forEach((event) => {
      const date = event.date;
      if (!timeline[date]) {
        timeline[date] = {
          totalEvents: 0,
          eventTypes: {},
        };
      }
      timeline[date].totalEvents++;
      timeline[date].eventTypes[event.eventType] =
        (timeline[date].eventTypes[event.eventType] || 0) + 1;
    });

    return {
      userId,
      period: `Last ${days} days`,
      totalEvents: events.length,
      timeline,
    };
  } catch (error) {
    throw error;
  }
};

// Get course analytics
exports.getCourseAnalytics = async (courseId) => {
  try {
    // Get all progress records for the course
    const progressSnapshot = await db
      .collection("progress")
      .where("courseId", "==", courseId)
      .get();

    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // Get all assessments
    const assessmentSnapshot = await db
      .collection("assessments")
      .where("courseId", "==", courseId)
      .get();

    const assessments = assessmentSnapshot.docs.map((doc) => doc.data());

    // Get assessment submissions
    const submissionSnapshot = await db
      .collection("assessment_submissions")
      .where("courseId", "==", courseId)
      .get();

    const submissions = submissionSnapshot.docs.map((doc) => doc.data());

    // Calculate analytics
    const analytics = {
      courseId,
      enrollment: {
        totalEnrolled: progressData.length,
        active: progressData.filter((p) => p.completedPercentage > 0).length,
        completed: progressData.filter((p) => p.completedPercentage === 100)
          .length,
      },
      progress: {
        averageCompletion: Math.round(
          progressData.reduce((sum, p) => sum + p.completedPercentage, 0) /
            (progressData.length || 1)
        ),
        completionRate: Math.round(
          (progressData.filter((p) => p.completedPercentage === 100).length /
            (progressData.length || 1)) *
            100
        ),
      },
      assessments: {
        totalAssessments: assessments.length,
        totalSubmissions: submissions.length,
        averageScore:
          submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + s.percentage, 0) /
                  submissions.length
              )
            : 0,
        passRate: Math.round(
          (submissions.filter((s) => s.passed).length /
            (submissions.length || 1)) *
            100
        ),
      },
      timing: {
        updatedAt: new Date(),
        periodDays: 30,
      },
    };

    return analytics;
  } catch (error) {
    throw error;
  }
};

// Get user analytics
exports.getUserAnalytics = async (userId) => {
  try {
    // Progress across all courses
    const progressSnapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .get();

    const progress = progressSnapshot.docs.map((doc) => doc.data());

    // Assessment performance
    const submissionSnapshot = await db
      .collection("assessment_submissions")
      .where("userId", "==", userId)
      .get();

    const submissions = submissionSnapshot.docs.map((doc) => doc.data());

    // Engagement events
    const eventSnapshot = await db
      .collection("engagement_events")
      .where("userId", "==", userId)
      .get();

    const events = eventSnapshot.docs.map((doc) => doc.data());

    const analytics = {
      userId,
      courses: {
        totalEnrolled: progress.length,
        inProgress: progress.filter(
          (p) => p.completedPercentage > 0 && p.completedPercentage < 100
        ).length,
        completed: progress.filter((p) => p.completedPercentage === 100).length,
        averageProgress: Math.round(
          progress.reduce((sum, p) => sum + p.completedPercentage, 0) /
            (progress.length || 1)
        ),
      },
      assessments: {
        totalSubmissions: submissions.length,
        averageScore:
          submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + s.percentage, 0) /
                  submissions.length
              )
            : 0,
        passRate: Math.round(
          (submissions.filter((s) => s.passed).length /
            (submissions.length || 1)) *
            100
        ),
        passedCount: submissions.filter((s) => s.passed).length,
      },
      engagement: {
        totalEvents: events.length,
        averageEventsPerDay: calculateAverageEventsPerDay(events),
        lastActive: events.length > 0 ? events[events.length - 1].timestamp : null,
      },
      generatedAt: new Date(),
    };

    return analytics;
  } catch (error) {
    throw error;
  }
};

// Get admin dashboard analytics
exports.getAdminAnalytics = async () => {
  try {
    // Get all users
    const userSnapshot = await db.collection("users").get();
    const totalUsers = userSnapshot.size;

    // Get all courses
    const courseSnapshot = await db.collection("courses").get();
    const totalCourses = courseSnapshot.size;

    // Get all progress records
    const progressSnapshot = await db.collection("progress").get();
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // Get all submissions
    const submissionSnapshot = await db
      .collection("assessment_submissions")
      .get();
    const submissions = submissionSnapshot.docs.map((doc) => doc.data());

    // Get certificates
    const certSnapshot = await db.collection("certificates").get();
    const certificates = certSnapshot.docs.map((doc) => doc.data());

    const analytics = {
      overview: {
        totalUsers,
        totalCourses,
        totalCourseEnrollments: progressData.length,
        totalCertificatesIssued: certificates.length,
      },
      courseMetrics: {
        averageCompletionRate: Math.round(
          (progressData.filter((p) => p.completedPercentage === 100).length /
            (progressData.length || 1)) *
            100
        ),
        topCompletedCourses: getTopCompletedCourses(progressData),
      },
      assessmentMetrics: {
        totalAssessmentSubmissions: submissions.length,
        averageAssessmentScore:
          submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + s.percentage, 0) /
                  submissions.length
              )
            : 0,
        averagePassRate: Math.round(
          (submissions.filter((s) => s.passed).length /
            (submissions.length || 1)) *
            100
        ),
      },
      certificateMetrics: {
        totalIssued: certificates.length,
        activeCount: certificates.filter((c) => c.status === "ACTIVE").length,
        revokedCount: certificates.filter((c) => c.status === "REVOKED").length,
        averageScore:
          certificates.length > 0
            ? Math.round(
                certificates.reduce((sum, c) => sum + c.finalScore, 0) /
                  certificates.length
              )
            : 0,
      },
      generatedAt: new Date(),
    };

    return analytics;
  } catch (error) {
    throw error;
  }
};

// Get course completion trends
exports.getCompletionTrends = async (courseId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await db
      .collection("progress")
      .where("courseId", "==", courseId)
      .where("lastUpdatedAt", ">=", startDate)
      .orderBy("lastUpdatedAt", "asc")
      .get();

    const data = snapshot.docs.map((doc) => doc.data());

    // Group by date
    const trends = {};
    data.forEach((item) => {
      const date = new Date(item.lastUpdatedAt)
        .toISOString()
        .split("T")[0];
      if (!trends[date]) {
        trends[date] = {
          completed: 0,
          inProgress: 0,
          newEnrollments: 0,
        };
      }

      if (item.completedPercentage === 100) {
        trends[date].completed++;
      } else if (item.completedPercentage > 0) {
        trends[date].inProgress++;
      } else {
        trends[date].newEnrollments++;
      }
    });

    return {
      courseId,
      period: `Last ${days} days`,
      trends,
    };
  } catch (error) {
    throw error;
  }
};

// Helper functions

function calculateEngagementScore(completion, timeSpent, daysSinceStart) {
  const completionScore = completion;
  const timeScore = Math.min((timeSpent / 60) * 10, 100); // 10 points per hour
  const consistencyScore =
    daysSinceStart > 0 ? Math.min((daysSinceStart / 30) * 30, 100) : 0;

  const weights = {
    completion: 0.5,
    time: 0.3,
    consistency: 0.2,
  };

  return Math.round(
    completionScore * weights.completion +
      timeScore * weights.time +
      consistencyScore * weights.consistency
  );
}

function categorizeLearnPace(timeSpent, completion, daysSinceStart) {
  const hourlyRate = timeSpent / 60;
  const dailyRate = hourlyRate / (daysSinceStart || 1);
  const completionRate = completion / (daysSinceStart || 1);

  if (completionRate > 3.3) return "FAST";
  if (completionRate > 1.6) return "MODERATE";
  if (completionRate > 0) return "SLOW";
  return "NOT_STARTED";
}

function calculateDaysSince(date) {
  if (!date) return 0;
  return Math.floor(
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
  );
}

function calculateAverageEventsPerDay(events) {
  if (events.length === 0) return 0;

  const uniqueDays = new Set(
    events.map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  );

  return Math.round(events.length / uniqueDays.size);
}

function getTopCompletedCourses(progressData) {
  const courseStats = {};

  progressData.forEach((p) => {
    if (!courseStats[p.courseId]) {
      courseStats[p.courseId] = {
        courseId: p.courseId,
        completed: 0,
        total: 0,
      };
    }
    courseStats[p.courseId].total++;
    if (p.completedPercentage === 100) {
      courseStats[p.courseId].completed++;
    }
  });

  return Object.values(courseStats)
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5)
    .map((c) => ({
      ...c,
      completionRate: Math.round((c.completed / c.total) * 100),
    }));
}
