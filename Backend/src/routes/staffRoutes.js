import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  // Admin methods
  getAllStaff,
  getStaffById,
  createStaff,
  deleteStaff,
  
  // Staff methods (self)
  getTeacherProfile,
  updateTeacherProfile,
  getStaffDashboardStats,
  getTeacherCourses,
  getTeacherStudents,
  getTeacherTodaySchedule,
  updateTeacherPassword
} from "../controllers/staffController.js";

const router = express.Router();

/* ========================================
   TEACHER ROUTES (Self - Protected)
   MUST be first to avoid being caught by generic /:id route
   ======================================== */
// Profile routes
router.get("/profile", protect, authorize("STAFF"), getTeacherProfile);
router.put("/profile", protect, authorize("STAFF"), updateTeacherProfile);
router.put("/password", protect, authorize("STAFF"), updateTeacherPassword);

// Dashboard routes
router.get("/dashboard/stats", protect, authorize("STAFF"), getStaffDashboardStats);
router.get("/dashboard/courses", protect, authorize("STAFF"), getTeacherCourses);
router.get("/dashboard/students", protect, authorize("STAFF"), getTeacherStudents);
router.get("/dashboard/schedule/today", protect, authorize("STAFF"), getTeacherTodaySchedule);

/* ========================================
   ADMIN ONLY ROUTES
   Must be last - generic /:id route comes last
   ======================================== */
router.get("/", protect, authorize("ADMIN"), getAllStaff);
router.post("/", protect, authorize("ADMIN"), createStaff);
router.get("/:id", protect, authorize("ADMIN"), getStaffById);
router.delete("/:id", protect, authorize("ADMIN"), deleteStaff);

export default router;
