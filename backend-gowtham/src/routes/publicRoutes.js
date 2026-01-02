const express = require("express")
const router = express.Router()
const { getPublicCourses } = require("../controllers/courseController")

// Public courses (DEV only)
// Health check for public routes (helps debug mounting)
router.get("/", (req, res) => {
	res.json({ message: "public routes mounted", routes: ["/courses"] })
})

router.get("/courses", getPublicCourses)

module.exports = router
