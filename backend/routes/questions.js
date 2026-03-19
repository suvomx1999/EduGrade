const express = require("express");
const axios = require("axios");
const Question = require("../models/Question");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

// @desc    Generate a question from context
// @route   POST /api/questions/generate
// @access  Teacher/Admin
router.post("/generate", protect, requireRole("teacher", "admin"), async (req, res) => {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ message: "Context text is required" });
  }

  try {
    const response = await axios.post(`${process.env.NLP_SERVICE_URL}/generate-question`, {
      context
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Question generation failed", error.message);
    res.status(500).json({ message: "Question generation service failed", error: error.message });
  }
});

// @desc    Get all active questions
// @route   GET /api/questions
// @access  Protected
router.get("/", protect, async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true }).populate(
      "createdBy",
      "name"
    );

    // Strip modelAnswer for students
    const responseData = questions.map((q) => {
      const questionObj = q.toObject();
      if (req.user.role === "student") {
        delete questionObj.modelAnswer;
      }
      return questionObj;
    });

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new question
// @route   POST /api/questions
// @access  Teacher/Admin
router.post("/", protect, requireRole("teacher", "admin"), async (req, res) => {
  const { text, modelAnswer, keywords, maxMarks, dueDate, duration } = req.body;

  if (!text || !modelAnswer) {
    return res.status(400).json({ message: "Text and model answer are required" });
  }

  try {
    const question = await Question.create({
      text,
      modelAnswer,
      keywords: keywords || [],
      maxMarks: maxMarks || 10,
      dueDate,
      duration: duration || 30,
      createdBy: req.user._id,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Teacher (own) / Admin
router.put("/:id", protect, requireRole("teacher", "admin"), async (req, res) => {
  try {
    let question = await Question.findById(req.id || req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check ownership if teacher
    if (
      req.user.role === "teacher" &&
      question.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to update this question" });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Teacher (own) / Admin
router.delete("/:id", protect, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check ownership if teacher
    if (
      req.user.role === "teacher" &&
      question.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this question" });
    }

    await question.deleteOne();
    res.status(200).json({ message: "Question removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
