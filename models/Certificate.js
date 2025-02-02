const mongoose = require("mongoose");
const crypto = require("crypto");

const CertificateSchema = new mongoose.Schema({
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
  verificationCode: {
    type: String,
    unique: true,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  completedDifficulties: [
    {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
  ],
  quizScores: {
    easy: Number,
    medium: Number,
    hard: Number,
  },
});

// Generate unique verification code before saving
CertificateSchema.pre("save", function (next) {
  if (!this.verificationCode) {
    this.verificationCode = crypto.randomBytes(16).toString("hex");
  }
  next();
});

module.exports = mongoose.model("Certificate", CertificateSchema);
