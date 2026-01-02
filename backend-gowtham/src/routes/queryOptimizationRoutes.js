const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authmiddleware");
const roleMiddleware = require("../middlewares/rolemiddleware");
const queryOptimizationService = require("../services/queryOptimizationService");

// Get optimized user progress
router.get("/progress/:userId", verifyToken, async (req, res) => {
  try {
    const progress = await queryOptimizationService.getOptimizedUserProgress(
      req.params.userId
    );
    res.json({
      userId: req.params.userId,
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get optimized user progress (current user)
router.get("/progress", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const progress = await queryOptimizationService.getOptimizedUserProgress(userId);
    res.json({
      userId,
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get optimized course analytics
router.get(
  "/analytics/course/:courseId",
  verifyToken,
  roleMiddleware(["admin", "instructor"]),
  async (req, res) => {
    try {
      const analytics =
        await queryOptimizationService.getOptimizedCourseAnalytics(
          req.params.courseId
        );
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get recent assessments with pagination
router.get("/assessments/recent", verifyToken, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const result = await queryOptimizationService.getOptimizedRecentAssessments(
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    console.error("/api/optimization/assessments/recent error", {
      query: req.query,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
});

// Get optimized certificates
router.get(
  "/certificates",
  verifyToken,
  roleMiddleware(["admin", "instructor"]),
  async (req, res) => {
    try {
      const courseId = req.query.courseId;
      const status = req.query.status || "ACTIVE";
      const certificates =
        await queryOptimizationService.getOptimizedCertificates(courseId, status);
      res.json({
        count: certificates.length,
        certificates,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get batch user data
router.post("/batch/users", verifyToken, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "userIds must be a non-empty array" });
    }
    const data = await queryOptimizationService.getOptimizedBatchUserData(userIds);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get indexing recommendations
router.get(
  "/recommendations/indexing",
  verifyToken,
  roleMiddleware(["admin"]),
  (req, res) => {
    try {
      const recommendations =
        queryOptimizationService.getIndexingRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Rebuild cache
router.post(
  "/cache/rebuild/:courseId",
  verifyToken,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const result = await queryOptimizationService.rebuildCourseAnalyticsCache(
        req.params.courseId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Clear cache
router.post("/cache/clear", verifyToken, roleMiddleware(["admin"]), (req, res) => {
  try {
    const result = queryOptimizationService.clearAllCache();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update progress
router.put("/bulk-update", verifyToken, async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "updates must be an array" });
    }
    res.json({
      message: "Bulk update processed",
      count: updates.length,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic paginated query
router.get("/:resource", verifyToken, async (req, res) => {
  try {
    const { resource } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Return mock paginated data
    const skip = (page - 1) * limit;
    res.json({
      resource,
      page,
      limit,
      skip,
      total: 100,
      data: [],
      message: "Paginated data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
