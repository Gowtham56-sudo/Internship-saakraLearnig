const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const { updateProgress, getProgress } = require("../controllers/progressController");

// Student update progress
router.post("/update", verifyToken, updateProgress);

// View progress
router.get("/:uid", verifyToken, getProgress);

module.exports = router;
