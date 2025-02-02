const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(cookieParser());

// Helper function to generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, isEmailVerified: user.isEmailVerified },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
    });

    await newUser.save();
    await sendVerificationEmail(newUser);

    res.status(201).json({
      msg: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        msg: "Please verify your email first",
        isEmailVerified: false,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Verify Email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid or expired verification token" });
  }
});

// Request Password Reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (
      user.passwordResetLockUntil &&
      user.passwordResetLockUntil > Date.now()
    ) {
      return res.status(429).json({
        msg: "Too many reset attempts. Please try again later.",
        lockUntil: user.passwordResetLockUntil,
      });
    }

    await sendPasswordResetEmail(user);

    user.passwordResetAttempts += 1;
    if (user.passwordResetAttempts >= 3) {
      user.passwordResetLockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await user.save();

    res.json({ msg: "Password reset email sent" });
  } catch (error) {
    console.error("Error in password reset request:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetAttempts = 0;
    user.passwordResetLockUntil = null;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid or expired reset token" });
  }
});

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token found" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ msg: "Invalid refresh token" });

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);
      user.refreshToken = newRefreshToken;
      user.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Logout
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.refreshToken = "";
    await user.save();

    res.clearCookie("refreshToken");
    res.json({ msg: "Logged out successfully!" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
