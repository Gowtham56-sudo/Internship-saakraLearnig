const { db } = require("../config/firebase");

/**
 * FIRESTORE QUERY OPTIMIZATION SERVICE
 * Implements optimized queries, caching, and indexing recommendations
 */

// Cache for frequently accessed data
const queryCache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Clear cache entry
function invalidateCache(key) {
  queryCache.delete(key);
}

// Get from cache if valid
function getFromCache(key) {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
}

// Store in cache
function setCache(key, data) {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * OPTIMIZED QUERIES
 */

// Get user progress across all courses (with caching)
exports.getOptimizedUserProgress = async (userId) => {
  const cacheKey = `user_progress_${userId}`;
  const cached = getFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Single indexed query instead of multiple queries
    const snapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .select([
        "courseId",
        "completedPercentage",
        "lastUpdatedAt",
        "completed",
      ]) // Select only needed fields
      .get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

// Get course progress analytics (optimized)
exports.getOptimizedCourseAnalytics = async (courseId) => {
  const cacheKey = `course_analytics_${courseId}`;
  const cached = getFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Use aggregated data if available, fallback to calculation
    const aggregateDoc = await db
      .collection("course_aggregates")
      .doc(courseId)
      .get();

    if (aggregateDoc.exists && isAggregateValid(aggregateDoc.data())) {
      const data = aggregateDoc.data();
      setCache(cacheKey, data);
      return data;
    }

    // Fallback: Calculate from progress records
    const snapshot = await db
      .collection("progress")
      .where("courseId", "==", courseId)
      .select(["completedPercentage"])
      .get();

    const progresses = snapshot.docs.map((doc) => doc.data().completedPercentage);

    const analytics = {
      courseId,
      totalUsers: progresses.length,
      completedUsers: progresses.filter((p) => p === 100).length,
      averageProgress:
        progresses.length > 0
          ? Math.round(progresses.reduce((a, b) => a + b) / progresses.length)
          : 0,
      completionRate:
        progresses.length > 0
          ? Math.round((progresses.filter((p) => p === 100).length /
            progresses.length) *
            100)
          : 0,
      lastUpdated: new Date(),
    };

    setCache(cacheKey, analytics);
    return analytics;
  } catch (error) {
    throw error;
  }
};

// Get recent assessments with pagination (optimized)
exports.getOptimizedRecentAssessments = async (
  limit = 20,
  startAfterDoc = null
) => {
  try {
    let query = db
      .collection("assessment_submissions")
      .select([
        "userId",
        "courseId",
        "assessmentId",
        "percentage",
        "submittedAt",
      ])
      .orderBy("submittedAt", "desc")
      .limit(limit + 1); // Fetch one extra to determine if more exist

    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();

    const hasMore = snapshot.docs.length > limit;
    const docs = snapshot.docs.slice(0, limit);

    const data = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      data,
      hasMore,
      nextCursor: hasMore ? docs[docs.length - 1] : null,
    };
  } catch (error) {
    throw error;
  }
};

// Get certificates with compound filtering (optimized)
exports.getOptimizedCertificates = async (
  courseId = null,
  status = "ACTIVE"
) => {
  const cacheKey = `certificates_${courseId}_${status}`;
  const cached = getFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let query = db
      .collection("certificates")
      .where("status", "==", status)
      .select(["userId", "courseId", "issuedDate", "finalScore"]);

    if (courseId) {
      query = query.where("courseId", "==", courseId);
    }

    query = query.orderBy("issuedDate", "desc");

    const snapshot = await query.get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

// Batch read optimized (reduces read operations)
exports.getOptimizedBatchUserData = async (userIds) => {
  try {
    const results = {};

    // Process in batches of 10 (Firestore batch limit)
    for (let i = 0; i < userIds.length; i += 10) {
      const batch = userIds.slice(i, i + 10);

      // Parallel queries for batch
      const [progressDocs, certificateDocs, assessmentDocs] =
        await Promise.all([
          db
            .collection("progress")
            .where("userId", "in", batch)
            .select(["userId", "courseId", "completedPercentage"])
            .get(),
          db
            .collection("certificates")
            .where("userId", "in", batch)
            .select(["userId", "courseId", "status"])
            .get(),
          db
            .collection("assessment_submissions")
            .where("userId", "in", batch)
            .select(["userId", "percentage", "passed"])
            .get(),
        ]);

    // Organize by user
      batch.forEach((userId) => {
        results[userId] = {
          progress: progressDocs.docs
            .filter((d) => d.data().userId === userId)
            .map((d) => d.data()),
          certificates: certificateDocs.docs
            .filter((d) => d.data().userId === userId)
            .map((d) => d.data()),
          assessments: assessmentDocs.docs
            .filter((d) => d.data().userId === userId)
            .map((d) => d.data()),
        };
      });
    }

    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * INDEXING RECOMMENDATIONS
 */

exports.getIndexingRecommendations = () => {
  return {
    recommended_indexes: [
      {
        collection: "progress",
        fields: ["userId", "courseId"],
        description:
          "Query user progress by course",
      },
      {
        collection: "progress",
        fields: ["courseId", "completedPercentage"],
        description:
          "Query course analytics",
      },
      {
        collection: "assessment_submissions",
        fields: ["userId", "courseId"],
        description:
          "Query user assessments by course",
      },
      {
        collection: "assessment_submissions",
        fields: ["courseId", "percentage"],
        description:
          "Query course assessment statistics",
      },
      {
        collection: "certificates",
        fields: ["userId", "status"],
        description:
          "Query user certificates",
      },
      {
        collection: "certificates",
        fields: ["courseId", "status"],
        description:
          "Query course certificates",
      },
      {
        collection: "engagement_events",
        fields: ["userId", "timestamp"],
        description:
          "Query user engagement timeline",
      },
    ],
    query_optimization_tips: [
      "Always use indexed fields in where clauses",
      "Limit fields with select() to reduce data transfer",
      "Use pagination for large result sets",
      "Cache frequently accessed analytics",
      "Batch similar queries together",
      "Use compound indexes for multiple conditions",
    ],
  };
};

/**
 * BATCH OPERATIONS
 */

// Bulk update progress (optimized for multiple users)
exports.bulkUpdateProgress = async (updates) => {
  /**
   * updates = [
   *   { userId: "id1", courseId: "course1", percentage: 50 },
   *   { userId: "id2", courseId: "course2", percentage: 75 }
   * ]
   */

  try {
    const batch = db.batch();
    let operationCount = 0;

    for (const update of updates) {
      if (operationCount >= 500) {
        // Firestore batch limit
        throw new Error("Batch size exceeds 500 operations");
      }

      const query = db
        .collection("progress")
        .where("userId", "==", update.userId)
        .where("courseId", "==", update.courseId);

      const snapshot = await query.get();

      if (snapshot.empty) {
        batch.set(db.collection("progress").doc(), {
          userId: update.userId,
          courseId: update.courseId,
          completedPercentage: update.percentage,
          updatedAt: new Date(),
        });
      } else {
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            completedPercentage: update.percentage,
            updatedAt: new Date(),
          });
        });
      }

      operationCount++;
    }

    await batch.commit();

    return {
      success: true,
      operationsCompleted: operationCount,
      message: `Successfully updated ${operationCount} progress records`,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * HELPER FUNCTIONS
 */

function isAggregateValid(aggregate) {
  if (!aggregate.lastUpdated) return false;

  const ageMinutes =
    (Date.now() - new Date(aggregate.lastUpdated).getTime()) / (1000 * 60);
  return ageMinutes < 60; // Aggregate valid for 1 hour
}

// Rebuild cache for specific course
exports.rebuildCourseAnalyticsCache = async (courseId) => {
  try {
    invalidateCache(`course_analytics_${courseId}`);
    const analytics = await exports.getOptimizedCourseAnalytics(courseId);

    // Store aggregated data
    await db.collection("course_aggregates").doc(courseId).set(analytics, {
      merge: true,
    });

    return {
      success: true,
      message: `Cache rebuilt for course ${courseId}`,
      data: analytics,
    };
  } catch (error) {
    throw error;
  }
};

// Clear all cache
exports.clearAllCache = () => {
  queryCache.clear();
  return {
    success: true,
    message: "All cache cleared",
  };
};
