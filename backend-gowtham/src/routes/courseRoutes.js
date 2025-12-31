const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");
const {
  addCourse,
  enrollCourse,
  getCourses,
  getCourseStudents,
} = require("../controllers/courseController");

// Trainer – add course
router.post("/add", verifyToken, checkRole("trainer"), addCourse);

// Student – enroll
router.post("/enroll", verifyToken, checkRole("student"), enrollCourse);

// All users – view courses
router.get("/", verifyToken, getCourses);

// Trainer/Admin – get students for a course
router.get("/:courseId/students", verifyToken, checkRole(["admin", "trainer"]), getCourseStudents);

module.exports = router;
