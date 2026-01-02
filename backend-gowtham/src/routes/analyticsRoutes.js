const express = require("express");
const router = express.Router();
console.log("Analytics route loaded");
const verifyToken = require("../middlewares/authmiddleware");
const roleMiddleware = require("../middlewares/rolemiddleware");
const analyticsService = require("../services/analyticsService");
const evaluationService = require("../services/evaluationService");

// Get user analytics
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.params.userId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user analytics
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const analytics = await analyticsService.getUserAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course analytics (admin/trainer)
router.get(
  "/course/:courseId",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  async (req, res) => {
    try {
      const analytics = await analyticsService.getCourseAnalytics(
        req.params.courseId
      );
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user engagement timeline
router.get(
  "/engagement/:userId",
  verifyToken,
  async (req, res) => {
    try {
      const days = req.query.days || 30;
      const timeline = await analyticsService.getUserEngagementTimeline(
        req.params.userId,
        parseInt(days)
      );
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get current user engagement timeline
router.get(
  "/engagement",
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user?.uid;
      const days = req.query.days || 30;
      const timeline = await analyticsService.getUserEngagementTimeline(
        userId,
        parseInt(days)
      );
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get course completion trends (admin/trainer)
router.get(
  "/trends/:courseId",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  async (req, res) => {
    try {
      const days = req.query.days || 30;
      const trends = await analyticsService.getCompletionTrends(
        req.params.courseId,
        parseInt(days)
      );
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get admin dashboard analytics
router.get(
  "/admin",
  verifyToken,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get recent platform activities (admin)
router.get(
  "/recent",
  verifyToken,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await analyticsService.getRecentPlatformActivity(limit);
      res.json({ data });
    } catch (error) {
      console.error('/api/analytics/recent error', { query: req.query, message: error.message, stack: error.stack });
      res.status(500).json({ error: error.message });
    }
  }
);

// Record engagement event
router.post(
  "/record-event",
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        message: "Event recorded",
        eventData: req.body,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get evaluation rules
router.get(
  "/evaluation/rules",
  verifyToken,
  (req, res) => {
    try {
      const rules = evaluationService.getEvaluationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Evaluate a submission (trainer/admin)
router.post(
  "/evaluation/submission",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  async (req, res) => {
    try {
      const { submissionId } = req.body;
      const evaluation = await evaluationService.evaluateAssessment(submissionId);
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Evaluate user performance across a course (trainer/admin)
router.post(
  "/evaluation/user",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  async (req, res) => {
    try {
      const { userId, courseId } = req.body;
      const perf = await evaluationService.evaluateUserPerformance(userId, courseId);
      res.json(perf);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
