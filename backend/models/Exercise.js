const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "code_analysis", // Review and fix vulnerable code
      "packet_analysis", // Analyze network captures
      "log_analysis", // Security log investigation
      "crypto", // Cryptography challenges
      "web_security", // Browser-based web security exercises
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  content: {
    instructions: { type: String, required: true }, // Markdown
    hints: [
      {
        text: String,
        pointDeduction: Number,
      },
    ],
    resources: [
      {
        name: String,
        type: String, // 'file', 'link', 'code'
        content: String, // URL or actual content
      },
    ],
  },
  solution: {
    type: {
      type: String,
      enum: ["text", "multiple_choice", "code", "flag"],
      required: true,
    },
    correctAnswer: String,
    validation: {
      type: String,
      enum: ["exact", "regex", "function"],
      required: true,
    },
  },
  points: { type: Number, required: true },
  timeLimit: { type: Number }, // Optional time limit in minutes
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
