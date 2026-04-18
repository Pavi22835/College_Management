import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

/* -------------------- Swagger Documentation -------------------- */
import { swaggerUi, specs } from "./src/config/swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------- Routes -------------------- */
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import lessonRoutes from "./src/routes/lessonRoutes.js";
import materialRoutes from "./src/routes/materialRoutes.js";
import topicRoutes from "./src/routes/topicRoutes.js";

dotenv.config();

const app = express();

/* -------------------- Security Middleware -------------------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* -------------------- Logger -------------------- */
app.use(morgan("dev"));

/* -------------------- CORS (FIXED) -------------------- */
// Allow all origins in development - FIXES THE CORS ERROR
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:5000",
  "http://localhost:5173",  // Vite default port
  "http://localhost:5174",
  "http://localhost:8080",
  "http://localhost:5500",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // In development, allow any localhost origin for convenience
      if (process.env.NODE_ENV !== 'production' && origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      
      // Check against allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log blocked origins for debugging
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"]
  })
);

/* -------------------- Body Parser -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- Static Files -------------------- */
// Middleware to set proper headers for file serving
app.use("/uploads", (req, res, next) => {
  // Set CORS headers for file serving
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Continue to static file serving
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filepath) => {
    const filename = filepath.toLowerCase();
    const baseFileName = path.basename(filepath);

    console.log(`📦 Serving file: ${filename}`);
    
    // Set proper content-type for PDFs
    if (filename.includes('.pdf')) {
      console.log('   → Setting PDF headers');
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', `inline; filename="${baseFileName}"`);
    }
    // Set proper headers for videos
    if (filename.match(/\.(mp4|webm|mov)$/i)) {
      console.log('   → Setting video headers');
      res.set('Accept-Ranges', 'bytes');
      res.set('Content-Type', filename.includes('mp4') ? 'video/mp4' : filename.includes('webm') ? 'video/webm' : 'video/quicktime');
    }
    // Set proper headers for Word docs
    if (filename.endsWith('.docx')) {
      console.log('   → Setting DOCX headers');
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.set('Content-Disposition', `attachment; filename="${baseFileName}"`);
    } else if (filename.endsWith('.doc')) {
      console.log('   → Setting DOC headers');
      res.set('Content-Type', 'application/msword');
      res.set('Content-Disposition', `attachment; filename="${baseFileName}"`);
    }
    // Disable caching for materials (so fresh versions are always served)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

/* -------------------- Request Logger -------------------- */
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

// Public API root
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "College Portal ERP API",
    status: "ok",
    docs: "/api-docs",
    health: "/api/health"
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
app.use("/api", courseRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);

// Lesson routes
app.use("/api", lessonRoutes);

// Material routes
app.use("/api/materials", materialRoutes);

// Topic routes
app.use("/api", topicRoutes);

/* -------------------- Swagger Documentation -------------------- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      return req;
    },
    responseInterceptor: (res) => {
      return res;
    },
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    security: [{ bearerAuth: [] }],
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151 }
    .swagger-ui .auth-wrapper { display: block !important; }
  `,
  customSiteTitle: "College Portal ERP API Documentation",
  customfavIcon: "/favicon.ico"
}));

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
      dashboard: "/api/dashboard",
      lessons: "/api/courses/:courseId/lessons",
      topics: "/api/lessons/:lessonId/topics"
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

/* -------------------- OPTIONS Pre-flight Handler -------------------- */
// Handle pre-flight requests for all routes
app.options('*', cors());

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
      "POST /api/admin/staff",
      "GET /api/courses",
      "POST /api/courses/:courseId/lessons",
      "GET /api/courses/:courseId/lessons",
      "POST /api/lessons/:lessonId/topics",
      "GET /api/lessons/:lessonId/topics"
    ]
  });
});

/* -------------------- Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);

  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS error: Origin not allowed",
      error: err.message
    });
  }

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
  console.log(`📍 Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`📍 Lessons API: http://localhost:${PORT}/api/courses/:courseId/lessons`);
  console.log(`📍 Topics API: http://localhost:${PORT}/api/lessons/:lessonId/topics`);
  console.log("=================================");
  console.log("\n✅ CORS Configuration:");
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log("   Credentials enabled: true");
  console.log("=================================\n");
});

/* -------------------- Graceful Shutdown -------------------- */
const gracefulShutdown = () => {
  console.log("\n🛑 Received shutdown signal, closing server...");
  server.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error("⚠️ Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;