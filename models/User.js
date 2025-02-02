const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  }, // Role system
  refreshToken: { type: String }, // Store refresh token
  isEmailVerified: {
    type: Boolean,
    default: false,
  }, // Track email verification status
  passwordResetAttempts: {
    type: Number,
    default: 0,
  }, // Track password reset attempts
  passwordResetLockUntil: {
    type: Date,
    default: null,
  }, // Lockout timestamp for password reset
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
