const express = require("express");
const router = express.Router();

const {
  register,
  login,
  updateRole,
  createTrainer,
  createAdmin,
} = require("../controllers/authcontroller");

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");

router.post("/register", register);
router.post("/login", login);

// Admin creates trainer accounts (email/password)
router.post(
  "/create-trainer",
  verifyToken,
  checkRole("admin"),
  createTrainer
);

// Admin creates admin accounts (email/password)
router.post(
  "/create-admin",
  verifyToken,
  checkRole("admin"),
  createAdmin
);

// Admin mattum role change panna mudiyum
router.put(
  "/update-role",
  verifyToken,
  checkRole("admin"),
  updateRole
);

module.exports = router;
