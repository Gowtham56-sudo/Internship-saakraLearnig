const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authmiddleware");
const sessionController = require("../controllers/sessionController");

// Create a session (trainer)
router.post("/", verifyToken, sessionController.createSession);

// Get sessions for trainer
router.get("/", verifyToken, sessionController.getTrainerSessions);

// Get sessions for a course (student/trainer)
router.get("/course/:courseId", verifyToken, sessionController.getCourseSessions);

// Get single session
router.get("/:id", verifyToken, sessionController.getSessionById);

// Update session
router.put("/:id", verifyToken, sessionController.updateSession);

module.exports = router;
