const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");
const checkRole = require("../middlewares/rolemiddleware");
const { getUser, getAllUsers } = require("../controllers/userController");

// User own profile
router.get("/:uid", verifyToken, getUser);

// Admin – all users
router.get("/", verifyToken, checkRole("admin"), getAllUsers);

module.exports = router;
