const express = require("express");
const router = express.Router();

const {
  register,
  login,
  updateRole,
} = require("../controllers/authcontroller");

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");

router.post("/register", register);
router.post("/login", login);

// Admin mattum role change panna mudiyum
router.put(
  "/update-role",
  verifyToken,
  checkRole("admin"),
  updateRole
);

module.exports = router;
