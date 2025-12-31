const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authmiddleware");
const roleMiddleware = require("../middlewares/rolemiddleware");
const {
  createAssessment,
  submitAssessmentScore,
  getAssessment,
  getCourseAssessments,
  getUserSubmissions,
  getAssessmentAnalytics,
} = require("../controllers/assessmentController");

// Admin/trainer: Create assessment
router.post(
  "/create",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  createAssessment
);

// Student: Submit assessment score
router.post("/submit", verifyToken, submitAssessmentScore);

// Student: Submit specific assessment
router.post("/:assessmentId/submit", verifyToken, submitAssessmentScore);

// Get assessment by ID
router.get("/:assessmentId", verifyToken, getAssessment);

// Get user's submission for an assessment
router.get("/:assessmentId/submission", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    res.json({
      assessmentId: req.params.assessmentId,
      userId,
      submission: null,
      message: "No submission found",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all assessments for a course
router.get("/course/:courseId", verifyToken, getCourseAssessments);

// Get current user's assessment submissions
router.get("/user/submissions", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    res.json({
      userId,
      submissions: [],
      message: "No submissions found",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's assessment submissions
router.get("/user/:userId/submissions", verifyToken, getUserSubmissions);

// Admin/trainer: Get assessment analytics
router.get(
  "/:assessmentId/analytics",
  verifyToken,
  roleMiddleware(["admin", "trainer"]),
  getAssessmentAnalytics
);

module.exports = router;
