const express = require("express");
const axios = require("axios");
const Submission = require("../models/Submission");
const Question = require("../models/Question");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

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

    res.status(201).json(submission);
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

module.exports = router;
