const express = require("express");
console.log("Dashboard route loaded");
const router = express.Router();
const verifyToken = require("../middlewares/authmiddleware");
const { db } = require("../config/firebase");

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      console.error("Dashboard: No UID in req.user", req.user);
      return res.status(401).json({ error: "Unauthorized: No UID" });
    }
    // Fetch user stats (mocked for now)
    const stats = {
      gpa: 3.8,
      completedCourses: 5,
      totalHours: 120,
      attendance: 95,
    };
    // Fetch enrolled courses
    let courses = [];
    try {
      const coursesSnap = await db.collection("courses").where("students", "array-contains", uid).get();
      courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (courseErr) {
      console.error("Dashboard: Error fetching courses", courseErr);
    }
    // Fetch recent activities (mocked)
    const activities = [
      { id: 1, content: "Submitted Assignment 1", timestamp: "2025-12-20" },
      { id: 2, content: "Scored 90% in Quiz 2", timestamp: "2025-12-18" },
    ];
    res.json({ stats, courses, activities });
  } catch (err) {
    console.error("Dashboard: General error", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
