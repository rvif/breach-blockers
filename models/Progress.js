const mongoose = require("mongoose");

const ExerciseProgressSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  attempts: [
    {
      answer: String,
      correct: Boolean,
      hintsUsed: [Number],
      pointsEarned: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quizResults: {
    easy: {
      completed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
    },
    medium: {
      completed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
    },
    hard: {
      completed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
    },
  },
  exerciseProgress: [ExerciseProgressSchema],
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one progress record per user per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
