const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const {
  loginLimiter,
  registrationLimiter,
  emailLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");

dotenv.config();

const app = express();

// Trust proxy for secure cookies in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration with proper production settings
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://breach-blockers.vercel.app",
          "https://www.breach-blockers.vercel.app",
        ]
      : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

// Cookie settings middleware
app.use((req, res, next) => {
  const originalSetCookie = res.cookie;
  res.cookie = function (name, value, options = {}) {
    const cookieOptions = {
      ...options,
      httpOnly: true,
      secure: true, // Always true for cross-origin
      sameSite: "none", // Required for cross-origin
      path: "/",
      maxAge:
        name === "refreshToken" ? 7 * 24 * 60 * 60 * 1000 : options.maxAge,
    };

    console.log("Setting cookie:", {
      name,
      options: cookieOptions,
      environment: process.env.NODE_ENV,
    });

    return originalSetCookie.call(this, name, value, cookieOptions);
  };
  next();
});

// Set security headers for cookies
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": req.headers.origin || corsOptions.origin,
    "Access-Control-Allow-Methods": corsOptions.methods.join(","),
    "Access-Control-Allow-Headers": corsOptions.allowedHeaders.join(","),
  });
  next();
});

// Debug middleware for cookies
app.use((req, res, next) => {
  console.log("Request cookies:", {
    cookies: req.cookies,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
  });
  next();
});

// CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://breach-blockers.vercel.app",
          "wss://breach-blockers.onrender.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
        mediaSrc: ["'self'", "https:", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply API rate limit to all routes except auth
app.use("/api/", (req, res, next) => {
  if (!req.path.startsWith("/auth/")) {
    return apiLimiter(req, res, next);
  }
  next();
});

// Apply specific limiters to auth routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registrationLimiter);
app.use("/api/auth/forgot-password", emailLimiter);
app.use("/api/auth/verify-otp", emailLimiter);
app.use("/api/auth/resend-verification", emailLimiter);

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const protectedRoutes = require("./routes/protectedRoutes");
app.use("/api/protected", protectedRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const courseRoutes = require("./routes/courseRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
app.use("/api/courses", courseRoutes);
app.use("/api/certificates", certificateRoutes);

const quizRoutes = require("./routes/quizRoutes");
app.use("/api/quiz", quizRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);

const enrollmentRoutes = require("./routes/enrollmentRoutes");
app.use("/api/enrollments", enrollmentRoutes);

const profileRoutes = require("./routes/profileRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/profile", profileRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/notifications", require("./routes/notificationRoutes").router);
app.use("/api/upload", require("./routes/uploadRoutes"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    if (process.env.NODE_ENV === "production") {
      console.log("==> Your service is live 🎉");
    }
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Global error handler with better error logging
app.use((err, req, res, next) => {
  console.error("Error details:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    msg: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
