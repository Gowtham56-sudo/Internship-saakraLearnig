const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const {
  addCourse,
  enrollCourse,
  getCourses,
  getCourseById,
  getCourseStudents,
} = require("../controllers/courseController");

// Trainer – add course
// Accept thumbnail and module files via multipart/form-data
router.post(
  "/add",
  verifyToken,
  checkRole("trainer"),
  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "moduleFiles" }]),
  addCourse
);

// Student – enroll
router.post("/enroll", verifyToken, checkRole("student"), enrollCourse);

// All users – view courses
router.get("/", verifyToken, getCourses);

// Public single course (no auth) — must come BEFORE /:id to match first
router.get("/public/:id", getCourseById);

// Get a single course by id
router.get("/:id", verifyToken, getCourseById);

// Trainer/Admin – get students for a course
router.get("/:courseId/students", verifyToken, checkRole(["admin", "trainer"]), getCourseStudents);

module.exports = router;
