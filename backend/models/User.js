const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "admin", "super"],
    default: "student",
  },
  bio: {
    type: String,
    default: "Learning to help you be cybersecure <3",
    maxLength: 100,
  },
  refreshToken: { type: String },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetAttempts: {
    type: Number,
    default: 0,
  },
  passwordResetLockUntil: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
