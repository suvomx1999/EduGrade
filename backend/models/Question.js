const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    modelAnswer: {
      type: String,
      required: true,
    },
    keywords: [
      {
        type: String,
      },
    ],
    maxMarks: {
      type: Number,
      default: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dueDate: {
      type: Date,
    },
    duration: {
      type: Number, // duration in minutes
      default: 30,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
