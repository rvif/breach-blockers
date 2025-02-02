// # 1. Registration Flow
// POST /api/auth/register
// Body: {
//   "name": "John Doe",
//   "email": "john@example.com",
//   "password": "StrongPass123!"
// }
// Response: {
//   "msg": "Registration initiated! Please check your email for OTP verification.",
//   "email": "john@example.com"
// }

// # 2. OTP Verification
// POST /api/auth/verify-otp
// Body: {
//   "email": "john@example.com",
//   "otp": "123456"
// }
// Response: {
//   "msg": "Email verified successfully. You are now logged in.",
//   "accessToken": "eyJhbGciOiJIUzI...",
//   "user": {
//     "id": "user_id",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "role": "student",
//     "isEmailVerified": true
//   }
// }

// # 3. Login
// POST /api/auth/login
// Body: {
//   "email": "john@example.com",
//   "password": "StrongPass123!"
// }
// Response: {
//   "accessToken": "eyJhbGciOiJIUzI...",
//   "user": {
//     "id": "user_id",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "role": "student",
//     "isEmailVerified": true
//   }
// }
// Cookies Set: {
//   "refreshToken": "eyJhbGciOiJIUzI..." (httpOnly)
// }

// # 4. Password Reset Flow
// ## Request Reset
// POST /api/auth/forgot-password
// Body: {
//   "email": "john@example.com"
// }
// Response: {
//   "msg": "Password reset email sent"
// }

// ## Reset Password
// POST /api/auth/reset-password
// Body: {
//   "token": "reset_token_from_email",
//   "newPassword": "NewStrongPass123!"
// }
// Response: {
//   "msg": "Password reset successfully"
// }

// # 5. Token Management
// ## Refresh Token
// POST /api/auth/refresh-token
// Cookies Required: {
//   "refreshToken": "existing_refresh_token"
// }
// Response: {
//   "accessToken": "new_access_token"
// }
// Cookies Set: {
//   "refreshToken": "new_refresh_token" (httpOnly)
// }

// # 6. Logout
// POST /api/auth/logout
// Headers: {
//   "Authorization": "Bearer access_token"
// }
// Response: {
//   "msg": "Logged out successfully!"
// }
// Cookies Cleared: {
//   "refreshToken": removed
// }

// # Error Cases:
// ## 1. Invalid Email Format
// POST /api/auth/register
// Body: {
//   "email": "invalid-email",
//   "password": "password123"
// }
// Response: {
//   "msg": "Invalid email format"
// }

// ## 2. Weak Password
// POST /api/auth/register
// Body: {
//   "email": "john@example.com",
//   "password": "weak"
// }
// Response: {
//   "msg": "Password requirements not met",
//   "errors": [
//     "Password must be at least 8 characters",
//     "Password must contain at least one uppercase letter",
//     "Password must contain at least one number",
//     "Password must contain at least one special character"
//   ]
// }

// ## 3. Invalid OTP
// POST /api/auth/verify-otp
// Body: {
//   "email": "john@example.com",
//   "otp": "000000"
// }
// Response: {
//   "msg": "Invalid OTP"
// }

// ## 4. Expired OTP
// POST /api/auth/verify-otp
// Body: {
//   "email": "john@example.com",
//   "otp": "123456"
// }
// Response: {
//   "msg": "OTP has expired. Please register again."
// }

// ## 5. Too Many Reset Attempts
// POST /api/auth/forgot-password
// Body: {
//   "email": "john@example.com"
// }
// Response: {
//   "msg": "Too many reset attempts. Please try again later.",
//   "lockUntil": "2024-03-21T10:00:00.000Z"
// }

// ## 6. Invalid Login
// POST /api/auth/login
// Body: {
//   "email": "john@example.com",
//   "password": "wrongpassword"
// }
// Response: {
//   "msg": "Invalid credentials"
// }

// ## 7. Unverified Email Login
// POST /api/auth/login
// Body: {
//   "email": "john@example.com",
//   "password": "StrongPass123!"
// }
// Response: {
//   "msg": "Please verify your email first",
//   "isEmailVerified": false
// }

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TempUser = require("../models/TempUser");
const { auth } = require("../middleware/auth");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateOTP,
} = require("../utils/emailService");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { validatePassword } = require("../utils/validation");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPass123!"
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP for email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP or expired verification session
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       429:
 *         description: Too many reset attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 lockUntil:
 *                   type: string
 *                   format: date-time
 *
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Get new access token using refresh token
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: No refresh token found
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */

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

// Registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    // Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res
        .status(400)
        .json({ msg: "Password requirements not met", errors });
    }

    // Check existing user in both User and TempUser collections
    const existingUser = await User.findOne({ email });
    const existingTempUser = await TempUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (existingTempUser) {
      await existingTempUser.deleteOne(); // Remove existing temporary registration
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const tempUser = new TempUser({
      name,
      email,
      password: hashedPassword,
      role: "student",
      otp,
      otpExpires,
    });

    await tempUser.save();
    await sendVerificationEmail(tempUser);

    res.status(201).json({
      msg: "Registration initiated! Please check your email for OTP verification.",
      email: tempUser.email,
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ msg: "Registration failed. Please try again." });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired verification session" });
    }

    if (Date.now() > tempUser.otpExpires) {
      await tempUser.deleteOne();
      return res
        .status(400)
        .json({ msg: "OTP has expired. Please register again." });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Create verified user
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
      isEmailVerified: true,
    });

    await newUser.save();
    await tempUser.deleteOne();

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({
      msg: "Email verified successfully. You are now logged in.",
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ msg: "Verification failed. Please try again." });
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
