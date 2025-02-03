const rateLimit = require("express-rate-limit");
const User = require("../models/User");

// Helper for human-readable time
const formatTime = (ms) => {
  if (ms < 60000) return `${Math.ceil(ms / 1000)} seconds`;
  return `${Math.ceil(ms / 60000)} minutes`;
};

// Check for privileged roles
const isPrivilegedRole = (role) => {
  return ["admin", "super"].includes(role);
};

// Store for tracking attempts (use Redis in production)
const attemptStore = new Map();

// Helper to get store key
const getStoreKey = (req) => {
  return `${req.ip}-${req.body.email || "anonymous"}`;
};

// Reset successful attempts
const resetAttempts = (req) => {
  const key = getStoreKey(req);
  attemptStore.delete(key);
  console.log(`Reset attempts for ${key}`);
};

// Base config for all limiters
const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for admin and super roles
    return req.user && isPrivilegedRole(req.user.role);
  },
};

// Login attempts limiter

const loginLimiter = async (req, res, next) => {
  try {
    // Check if user is admin/super
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user && isPrivilegedRole(user.role)) {
        return next(); // Skip rate limiting for admin/super
      }
    }

    // Apply rate limiting for non-privileged users
    const key = getStoreKey(req);
    const attempts = attemptStore.get(key) || 0;

    if (attempts >= 5) {
      // Check if within window
      const lastAttemptTime = attemptStore.get(`${key}_time`) || 0;
      const windowMs = 15 * 60 * 1000; // 15 minutes

      if (Date.now() - lastAttemptTime < windowMs) {
        return res.status(429).json({
          msg: `Too many login attempts. Please try again in ${formatTime(
            windowMs - (Date.now() - lastAttemptTime)
          )}`,
          remainingTime: windowMs - (Date.now() - lastAttemptTime),
          attemptsRemaining: 5 - attempts,
        });
      } else {
        // Reset if window expired
        attemptStore.delete(key);
        attemptStore.delete(`${key}_time`);
      }
    }

    // Track attempt
    attemptStore.set(key, attempts + 1);
    attemptStore.set(`${key}_time`, Date.now());

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(error);
  }
};

// Registration limiter
const registrationLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP
  keyGenerator: getStoreKey,
  message: (req, res) => ({
    msg: `Too many registration attempts. Please try again in ${formatTime(
      req.rateLimit.resetTime - Date.now()
    )}`,
    remainingTime: req.rateLimit.resetTime - Date.now(),
    attemptsRemaining: req.rateLimit.remaining,
  }),
});

// Email operations limiter (verification, password reset)
const emailLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 email requests
  keyGenerator: getStoreKey,
  handler: async (req, res) => {
    const key = getStoreKey(req);
    const attempts = attemptStore.get(key) || 0;
    attemptStore.set(key, attempts + 1);

    res.status(429).json({
      msg: `Too many email requests. Please try again in ${formatTime(
        req.rateLimit.resetTime - Date.now()
      )}`,
      remainingTime: req.rateLimit.resetTime - Date.now(),
      attemptsRemaining: req.rateLimit.remaining,
    });
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: getStoreKey,
  message: (req, res) => ({
    msg: `Too many requests. Please try again in ${formatTime(
      req.rateLimit.resetTime - Date.now()
    )}`,
    remainingTime: req.rateLimit.resetTime - Date.now(),
    attemptsRemaining: req.rateLimit.remaining,
  }),
});

// Success handler middleware
const handleSuccess = async (req, res, next) => {
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (data) {
    handleSuccessResponse(req, data);
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        handleSuccessResponse(req, parsed);
      } catch (e) {
        // Not JSON, ignore
      }
    }
    return originalSend.call(this, data);
  };

  next();
};

// Helper to handle successful responses
const handleSuccessResponse = async (req, data) => {
  const isSuccess =
    data.accessToken ||
    data.msg?.includes("success") ||
    data.msg?.includes("verified") ||
    data.user;

  if (isSuccess) {
    resetAttempts(req);

    // Reset user's attempts in DB if email exists
    if (req.body.email) {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (user && !isPrivilegedRole(user.role)) {
          user.passwordResetAttempts = 0;
          user.passwordResetLockUntil = null;
          await user.save();
        }
      } catch (err) {
        console.error("Error resetting user attempts:", err);
      }
    }
  }
};

// Cleanup old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of attemptStore.entries()) {
    if (now - timestamp > 60 * 60 * 1000) {
      // 1 hour
      attemptStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Update exports
module.exports = {
  loginLimiter,
  registrationLimiter,
  emailLimiter,
  apiLimiter,
  handleSuccess,
};
