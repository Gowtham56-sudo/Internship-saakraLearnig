const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");

// Trainer mattum course add panna mudiyum
router.post(
  "/add",
  verifyToken,
  checkRole("trainer"),
  (req, res) => {
    res.json({ message: "Course added successfully" });
  }
);

// Student view
router.get(
  "/view",
  verifyToken,
  checkRole("student"),
  (req, res) => {
    res.json({ message: "Student course list" });
  }
);

module.exports = router;
