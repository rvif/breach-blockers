// utils/emailService.js
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendVerificationEmail = async (tempUser) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tempUser.email,
      subject: "Verify Your Email - OTP",
      html: `
        <h1>Welcome to BreachBlockers!</h1>
        <p>Your verification code is: <strong>${tempUser.otp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not create this account, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (user) => {
  try {
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.PASSWORD_RESET_SECRET,
      { expiresIn: "1h" }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateOTP,
};
