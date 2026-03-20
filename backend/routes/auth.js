const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const { protect, requireRole } = require("../middleware/auth");
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
        badges: user.badges,
        streakCount: user.streakCount,
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
        badges: user.badges,
        streakCount: user.streakCount,
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
    badges: req.user.badges,
    streakCount: req.user.streakCount,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
router.post("/logout", protect, (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Get system stats for Admin
// @route   GET /api/auth/admin/stats
// @access  Admin
router.get("/admin/stats", protect, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const questionCount = await Question.countDocuments();
    const submissionCount = await Submission.countDocuments();
    
    // Calculate average score
    const submissions = await Submission.find();
    const averageScore = submissions.length > 0 
      ? Math.round(submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length)
      : 0;

    // Calculate score distribution for chart
    // Categories: 0-20, 21-40, 41-60, 61-80, 81-100
    const distribution = [
      { range: "0-20%", count: 0 },
      { range: "21-40%", count: 0 },
      { range: "41-60%", count: 0 },
      { range: "61-80%", count: 0 },
      { range: "81-100%", count: 0 },
    ];

    submissions.forEach(sub => {
      const p = sub.percentage;
      if (p <= 20) distribution[0].count++;
      else if (p <= 40) distribution[1].count++;
      else if (p <= 60) distribution[2].count++;
      else if (p <= 80) distribution[3].count++;
      else distribution[4].count++;
    });
    
    res.json({
      userCount,
      questionCount,
      submissionCount,
      averageScore,
      distribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
