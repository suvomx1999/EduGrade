const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    score: Number,
    maxMarks: Number,
    percentage: Number,
    semanticSimilarity: Number,
    keywordScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    verdict: String,
    feedback: String,
    plagiarismScore: {
      type: Number,
      default: 0,
    },
    plagiarismFlag: {
      type: Boolean,
      default: false,
    },
    plagiarizedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    evaluated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: { question: 1, student: 1 }
submissionSchema.index({ question: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
