import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

/* -------------------- Routes -------------------- */

import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js"; // Changed from teacherRoutes to staffRoutes
import adminRoutes from "./src/routes/adminRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";

dotenv.config();

const app = express();

/* -------------------- Security Middleware -------------------- */

app.use(helmet());

/* -------------------- Logger -------------------- */

app.use(morgan("dev"));

/* -------------------- CORS -------------------- */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

/* -------------------- Body Parser -------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- API Routes -------------------- */

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/staff", staffRoutes); // Changed from /api/teachers to /api/staff

app.use("/api/admin", adminRoutes);

app.use("/api/dashboard", dashboardRoutes);

/* Courses */
app.use("/api/courses", courseRoutes);

/* Admin Courses (same controller but admin UI path) */
app.use("/api/admin/courses", courseRoutes);

/* Attendance */
app.use("/api/attendance", attendanceRoutes);

/* -------------------- Root Route -------------------- */

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ERP Backend Running 🚀",
    version: "1.0.0"
  });
});

/* -------------------- Test Route (Optional) -------------------- */
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
});

/* -------------------- 404 Handler -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

/* -------------------- Global Error Handler -------------------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

/* -------------------- Server -------------------- */

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🚀 ERP Backend running on http://localhost:${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
});