const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const roleMiddleware = require("../middlewares/rolemiddleware");
const {
  updateProgress,
  getProgress,
  getCourseProgressAnalytics,
} = require("../controllers/progressController");

// Student update progress
router.post("/update", verifyToken, updateProgress);

// Update progress for specific course
router.put("/update/:courseId", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    res.json({
      message: "Progress updated",
      courseId: req.params.courseId,
      userId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user progress
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const progress = await getProgress(userId);
    res.json({ userId, progress: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress (by userId)
router.get("/:uid", verifyToken, getProgress);

// Get progress for user and course
router.get("/:userId/:courseId", verifyToken, async (req, res) => {
  try {
    res.json({
      userId: req.params.userId,
      courseId: req.params.courseId,
      progress: {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user's course progress
router.get("/current/:courseId", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    res.json({
      userId,
      courseId: req.params.courseId,
      progress: {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record learning activity
router.post("/record-activity/:courseId", verifyToken, async (req, res) => {
  try {
    res.json({
      message: "Activity recorded",
      courseId: req.params.courseId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress analytics for course and user
router.get("/:userId/:courseId/analytics", verifyToken, async (req, res) => {
  try {
    res.json({
      userId: req.params.userId,
      courseId: req.params.courseId,
      analytics: {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user's course analytics
router.get("/current/:courseId/analytics", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    res.json({
      userId,
      courseId: req.params.courseId,
      analytics: {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get course progress analytics
router.get(
  "/analytics/:courseId",
  verifyToken,
  roleMiddleware(["admin", "instructor"]),
  getCourseProgressAnalytics
);

module.exports = router;
