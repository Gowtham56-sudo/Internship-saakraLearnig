const { db } = require("../config/firebase");
const { calculateEngagementMetrics } = require("../services/analyticsService");

// MILESTONE DEFINITIONS
const MILESTONES = {
  0: "Started",
  25: "Quarter Complete",
  50: "Halfway",
  75: "Nearly Complete",
  100: "Completed",
};

// Calculate milestone achievements
const checkMilestones = (percentage) => {
  return Object.entries(MILESTONES)
    .filter(([threshold]) => percentage >= parseInt(threshold))
    .map(([threshold, milestone]) => ({
      milestone,
      percentage: parseInt(threshold),
      achievedAt: new Date(),
    }));
};

// Update progress - ENHANCED with milestones & validation
exports.updateProgress = async (req, res) => {
  const { courseId, percentage, lessonId, timeSpent, completed, completedModuleIds } = req.body;
  const userId = req.user.uid;

  // Validation
  if (!courseId || percentage === undefined) {
    return res
      .status(400)
      .json({ error: "courseId and percentage are required" });
  }
  if (percentage < 0 || percentage > 100) {
    return res
      .status(400)
      .json({ error: "percentage must be between 0 and 100" });
  }

  try {
    // Get existing progress document
    const progressSnapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    let progressRef;
    let previousPercentage = 0;

    if (progressSnapshot.empty) {
      // Create new progress record
      progressRef = db.collection("progress").doc();
    } else {
      // Update existing progress record
      progressRef = progressSnapshot.docs[0].ref;
      previousPercentage = progressSnapshot.docs[0].data().completedPercentage || 0;
    }

    const milestones = checkMilestones(percentage);
    const previousMilestones = checkMilestones(previousPercentage);
    const newMilestones = milestones.filter(
      (m) =>
        !previousMilestones.some((pm) => pm.percentage === m.percentage)
    );

    const uniqueModuleIds = Array.isArray(completedModuleIds)
      ? Array.from(new Set(completedModuleIds.map(String)))
      : [];

    const progressData = {
      userId,
      courseId,
      completedPercentage: percentage,
      lessonId: lessonId || null,
      timeSpent: (timeSpent || 0) + (previousPercentage !== 0 ? 0 : 0),
      completed: completed || percentage === 100,
      completedModuleIds: uniqueModuleIds,
      milestonesAchieved: milestones,
      newMilestones: newMilestones.length > 0 ? newMilestones : [],
      lastUpdatedAt: new Date(),
      updatedAt: new Date(),
    };

    await progressRef.set(progressData, { merge: true });

    res.json({
      message: "Progress updated successfully",
      progress: progressData,
      newMilestones: newMilestones,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function fetchProgressRecord(userId, courseId) {
  const snapshot = await db
    .collection("progress")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Get progress of user - with filtering options
exports.getProgress = async (req, res) => {
  const userId = req.params.uid;
  const { courseId, includeAnalytics } = req.query;

  try {
    let query = db
      .collection("progress")
      .where("userId", "==", userId);

    if (courseId) {
      query = query.where("courseId", "==", courseId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json({
        progress: [],
        message: "No progress records found",
      });
    }

    let progress = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Add analytics if requested
    if (includeAnalytics === "true") {
      progress = progress.map((p) => ({
        ...p,
        analytics: calculateEngagementMetrics(p),
      }));
    }

    res.json({
      progress,
      totalCourses: progress.length,
      averageProgress: Math.round(
        progress.reduce((sum, p) => sum + p.completedPercentage, 0) /
          progress.length
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress by courseId for all users (for admin/analytics)
exports.getCourseProgressAnalytics = async (req, res) => {
  const { courseId } = req.params;

  try {
    const snapshot = await db
      .collection("progress")
      .where("courseId", "==", courseId)
      .get();

    if (snapshot.empty) {
      return res.json({
        courseId,
        totalUsers: 0,
        averageProgress: 0,
        progressBreakdown: {},
      });
    }

    const progressData = snapshot.docs.map((doc) => doc.data());

    // Calculate analytics
    const progressBreakdown = {
      notStarted: progressData.filter((p) => p.completedPercentage === 0).length,
      inProgress: progressData.filter(
        (p) => p.completedPercentage > 0 && p.completedPercentage < 100
      ).length,
      completed: progressData.filter((p) => p.completedPercentage === 100).length,
    };

    const averageProgress = Math.round(
      progressData.reduce((sum, p) => sum + p.completedPercentage, 0) /
        progressData.length
    );

    res.json({
      courseId,
      totalUsers: progressData.length,
      averageProgress,
      progressBreakdown,
      completionRate: Math.round(
        (progressBreakdown.completed / progressData.length) * 100
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress for current user & course
exports.getCurrentCourseProgress = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { courseId } = req.params;
    if (!userId || !courseId) return res.status(400).json({ error: "userId and courseId required" });

    const progress = await fetchProgressRecord(userId, courseId);
    res.json({ progress: progress || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress for arbitrary user & course
exports.getUserCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (!userId || !courseId) return res.status(400).json({ error: "userId and courseId required" });

    const progress = await fetchProgressRecord(userId, courseId);
    res.json({ progress: progress || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
