const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["active", "completed", "dropped"],
    default: "active",
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  // Track time spent on course (in minutes)
  timeSpent: {
    type: Number,
    default: 0,
  },
});

// Compound index to ensure unique enrollment per user-course combination
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
