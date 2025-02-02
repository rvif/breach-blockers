// models/TempUser.js
const mongoose = require("mongoose");

const TempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "admin", "super"],
    default: "student",
  },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60, // Document expires after 24 hours
  },
});

module.exports = mongoose.model("TempUser", TempUserSchema);
