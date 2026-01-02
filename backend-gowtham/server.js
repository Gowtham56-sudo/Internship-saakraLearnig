const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const progressRoutes = require("./src/routes/progressRoutes");
const assessmentRoutes = require("./src/routes/assessmentRoutes");
const certificateRoutes = require("./src/routes/certificateRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const queryOptimizationRoutes = require("./src/routes/queryOptimizationRoutes");
const sessionRoutes = require("./src/routes/sessionRoutes");
const userRoutes = require("./src/routes/userRoutes");
const debugRoutes = require("./src/routes/debugRoutes");
const publicRoutes = require("./src/routes/publicRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/optimization", queryOptimizationRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/public", publicRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend with Advanced Features is running",
    features: [
      "Authentication & Authorization",
      "Course Management",
      "Progress Tracking with Milestones",
      "Assessment System",
      "Certificate Generation",
      "Analytics & Reporting",
      "Query Optimization",
    ],
  });
});

// Health check for server monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
  console.log(`✅ Features: Progress Tracking, Assessments, Certificates, Analytics`);
});
