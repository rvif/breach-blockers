const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
// const { apiLimiter } = require("./middleware/rateLimiter");

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Allow cross-origin requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // frontend URL
    credentials: true, // for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply rate limiting to all routes
// app.use("/api/", apiLimiter);

// Serve API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Enhanced security headers
app.use(helmet());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes); // Authentication routes

const protectedRoutes = require("./routes/protectedRoutes"); // Import the protected routes
app.use("/api/protected", protectedRoutes); // Use the protected routes

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

  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // process.exit(1);   // In production env exit the process
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
