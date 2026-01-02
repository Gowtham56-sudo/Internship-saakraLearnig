const express = require("express")
const router = express.Router()
const { testWrite, checkCourses } = require("../controllers/debugController")
const verifyToken = require("../middlewares/authmiddleware")

// Protected debug write (requires valid token or demo-token)
router.get("/firestore-write", verifyToken, testWrite)

// Check courses structure (no auth for debugging)
router.get("/check-courses", checkCourses)

module.exports = router
