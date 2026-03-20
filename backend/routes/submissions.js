const express = require("express");
const axios = require("axios");
const Submission = require("../models/Submission");
const Question = require("../models/Question");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

// Helper: Award Badge
const awardBadge = async (user, badgeType, description, icon) => {
  if (!user.badges.some((b) => b.type === badgeType)) {
    user.badges.push({ type: badgeType, description, icon });
    await user.save();
    return true;
  }
  return false;
};

// @desc    Submit an answer for evaluation
// @route   POST /api/submissions
// @access  Student only
router.post("/", protect, requireRole("student"), async (req, res) => {
  const { questionId, answer } = req.body;

  if (!questionId || !answer) {
    return res.status(400).json({ message: "Question ID and answer are required" });
  }

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Call NLP Service
    const nlpResponse = await axios.post(`${process.env.NLP_SERVICE_URL}/evaluate`, {
      student_answer: answer,
      model_answer: question.modelAnswer,
      keywords: question.keywords,
      max_marks: question.maxMarks,
    });

    const {
      score,
      max_marks,
      percentage,
      semantic_similarity,
      keyword_score,
      matched_keywords,
      missing_keywords,
      verdict,
      feedback,
    } = nlpResponse.data;

    // Plagiarism Check: Compare against other submissions for the same question
    const otherSubmissions = await Submission.find({
      question: questionId,
      student: { $ne: req.user._id },
    }).select("answer student");

    let plagiarismScore = 0;
    let plagiarismFlag = false;
    let plagiarizedFrom = null;

    if (otherSubmissions.length > 0) {
      for (const other of otherSubmissions) {
        try {
          const simResponse = await axios.post(
            `${process.env.NLP_SERVICE_URL}/similarity`,
            {
              text1: answer,
              text2: other.answer,
            }
          );
          
          if (simResponse.data.similarity > 0.9) {
            plagiarismScore = simResponse.data.similarity;
            plagiarismFlag = true;
            plagiarizedFrom = other.student;
            break; // Found one significant match, stop
          }
        } catch (simError) {
          console.error("Plagiarism check error:", simError.message);
        }
      }
    }

    // Save result to Submission (upsert by question+student)
    const submission = await Submission.findOneAndUpdate(
      { question: questionId, student: req.user._id },
      {
        answer,
        score,
        maxMarks: max_marks,
        percentage,
        semanticSimilarity: semantic_similarity,
        keywordScore: keyword_score,
        matchedKeywords: matched_keywords,
        missingKeywords: missing_keywords,
        verdict,
        feedback,
        plagiarismScore,
        plagiarismFlag,
        plagiarizedFrom,
        evaluated: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // --- Badge Logic ---
    const user = await User.findById(req.user._id);
    let newBadge = null;

    // 1. Perfect Score
    if (percentage >= 100) {
      const awarded = await awardBadge(user, "Perfect Score", "Scored 100% on an assignment!", "Trophy");
      if (awarded) newBadge = "Perfect Score";
    }

    // 2. Fast Finisher (Submitted within 10 minutes of question creation)
    const timeDiff = (new Date() - new Date(question.createdAt)) / (1000 * 60);
    if (timeDiff <= 10) {
      const awarded = await awardBadge(user, "Fast Finisher", "Completed assignment within 10 mins of posting!", "Zap");
      if (awarded) newBadge = "Fast Finisher";
    }

    // 3. Early Bird (First one to submit)
    const totalSubmissions = await Submission.countDocuments({ question: questionId });
    if (totalSubmissions === 1) {
      const awarded = await awardBadge(user, "Early Bird", "The very first to submit this assignment!", "Bird");
      if (awarded) newBadge = "Early Bird";
    }

    // 4. Academic Streak
    if (percentage >= 80) {
      user.streakCount += 1;
      if (user.streakCount >= 3) {
        const awarded = await awardBadge(user, "Academic Streak", "Maintained 80%+ score for 3 consecutive tasks!", "Flame");
        if (awarded) newBadge = "Academic Streak";
      }
    } else {
      user.streakCount = 0;
    }
    await user.save();

    res.status(201).json({
      ...submission._doc,
      newBadge
    });
  } catch (error) {
    console.error("Evaluation Error:", error.message);
    res.status(500).json({ message: "Evaluation service failed", error: error.message });
  }
});

// @desc    Get current student's submissions
// @route   GET /api/submissions/mine
// @access  Student only
router.get("/mine", protect, requireRole("student"), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id }).populate(
      "question",
      "text maxMarks"
    );
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all submissions for a question
// @route   GET /api/submissions/question/:questionId
// @access  Teacher/Admin
router.get(
  "/question/:questionId",
  protect,
  requireRole("teacher", "admin"),
  async (req, res) => {
    try {
      const submissions = await Submission.find({
        question: req.params.questionId,
      }).populate("student", "name email avatar");
      res.status(200).json(submissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Get aggregate keyword statistics for a question
// @route   GET /api/submissions/stats/keywords/:questionId
// @access  Teacher/Admin
router.get(
  "/stats/keywords/:questionId",
  protect,
  requireRole("teacher", "admin"),
  async (req, res) => {
    try {
      const submissions = await Submission.find({
        question: req.params.questionId,
      });

      const stats = {
        totalAttempts: submissions.length,
        matchedCount: {},
        missingCount: {},
      };

      submissions.forEach((sub) => {
        sub.matchedKeywords.forEach((kw) => {
          stats.matchedCount[kw] = (stats.matchedCount[kw] || 0) + 1;
        });
        sub.missingKeywords.forEach((kw) => {
          stats.missingCount[kw] = (stats.missingCount[kw] || 0) + 1;
        });
      });

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
