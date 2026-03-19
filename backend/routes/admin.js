const express = require("express");
const User = require("../models/User");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin only
router.get("/stats", protect, requireRole("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Average score calculation
    const avgResult = await Submission.aggregate([
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: "$percentage" },
        },
      },
    ]);

    const averageScore = avgResult.length > 0 ? avgResult[0].avgPercentage : 0;

    res.status(200).json({
      totalUsers,
      totalQuestions,
      totalSubmissions,
      averageScore: Math.round(averageScore * 10) / 10, // Rounded to 1 decimal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
router.get("/users", protect, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all submissions
// @route   GET /api/admin/submissions
// @access  Admin only
router.get("/submissions", protect, requireRole("admin"), async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate("student", "name email")
      .populate("question", "text")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a user's role
// @route   PATCH /api/admin/users/:id/role
// @access  Admin only
router.patch("/users/:id/role", protect, requireRole("admin"), async (req, res) => {
  const { role } = req.body;

  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Export all submissions as CSV
// @route   GET /api/admin/export/submissions
// @access  Teacher/Admin
router.get("/export/submissions", protect, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate("student", "name email")
      .populate("question", "text")
      .sort({ createdAt: -1 });

    let csv = "Student Name,Email,Question,Score,Max Marks,Percentage,Verdict,Feedback,Plagiarism Flag,Date\n";
    
    submissions.forEach((s) => {
      csv += `"${s.student?.name || "N/A"}","${s.student?.email || "N/A"}","${s.question?.text?.replace(/"/g, '""') || "N/A"}",${s.score},${s.maxMarks},${s.percentage}%,"${s.verdict}","${s.feedback?.replace(/"/g, '""')}",${s.plagiarismFlag},"${new Date(s.createdAt).toLocaleDateString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=submissions_report.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
