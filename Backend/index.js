import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

/* -------------------- Routes -------------------- */
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";

dotenv.config();

const app = express();

/* -------------------- Security Middleware -------------------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* -------------------- Logger -------------------- */
app.use(morgan("dev"));

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* -------------------- Body Parser -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- Request Logger (Optional) -------------------- */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

/* -------------------- API Routes -------------------- */

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Staff routes (Admin and Self)
app.use("/api/staff", staffRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Course routes
app.use("/api/courses", courseRoutes);

// Admin Courses (same controller but admin UI path)
app.use("/api/admin/courses", courseRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);

/* -------------------- Root Route -------------------- */
app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "success",
    message: "ERP Backend Running 🚀",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      students: "/api/students",
      staff: "/api/staff",
      admin: "/api/admin",
      courses: "/api/courses",
      attendance: "/api/attendance",
      dashboard: "/api/dashboard"
    }
  });
});

/* -------------------- Test Route -------------------- */
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
});

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.url}`,
    availableEndpoints: [
      "GET /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/staff",
      "POST /api/staff",
      "GET /api/staff/hods",
      "GET /api/staff/faculty",
      "GET /api/staff/mentors",
      "GET /api/staff/profile",
      "GET /api/admin/staff",
      "POST /api/admin/staff"
    ]
  });
});

/* -------------------- Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);

  // Handle Prisma specific errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${err.meta?.target?.join(', ')}`,
      error: err.message
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: "Record not found",
      error: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: err.message
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log("\n=================================");
  console.log(`🚀 ERP Backend Server Running!`);
  console.log("=================================");
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test Endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📍 Staff API: http://localhost:${PORT}/api/staff`);
  console.log(`📍 Admin Staff API: http://localhost:${PORT}/api/admin/staff`);
  console.log("=================================\n");
});

/* -------------------- Graceful Shutdown -------------------- */
const gracefulShutdown = () => {
  console.log("\n🛑 Received shutdown signal, closing server...");
  server.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;