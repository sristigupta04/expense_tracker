const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} = require("../controllers/authController");

const { auth } = require("../middleware/auth");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get Logged In User Profile
router.get("/profile", auth, getProfile);

// Logout
router.post("/logout", auth, logoutUser);

module.exports = router;