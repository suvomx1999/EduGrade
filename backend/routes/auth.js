const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("Registration request:", { name, email, role });

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    if (user) {
      console.log("User created successfully:", user._id);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request:", email);

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      console.log("Login successful:", email);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token,
      });
    } else {
      console.log("Invalid login attempt:", email);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
router.post("/logout", protect, (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
