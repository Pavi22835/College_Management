import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  // Admin methods
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getHODs,
  getFaculty,
  getMentors,
  getStaffStats,
  
  // Staff self methods
  getStaffProfile,
  updateStaffProfile,
  updateStaffPassword,
  getStaffDashboardStats,
  getStaffCourses,
  getStaffStudents,
  getStaffTodaySchedule
} from "../controllers/staffController.js";

const router = express.Router();

/* ========================================
   STAFF SELF ROUTES (Protected)
   These must come first to avoid being caught by /:id route
   ======================================== */
router.get("/profile", protect, authorize("STAFF"), getStaffProfile);
router.put("/profile", protect, authorize("STAFF"), updateStaffProfile);
router.put("/password", protect, authorize("STAFF"), updateStaffPassword);

// Dashboard routes
router.get("/dashboard/stats", protect, authorize("STAFF"), getStaffDashboardStats);
router.get("/dashboard/courses", protect, authorize("STAFF"), getStaffCourses);
router.get("/dashboard/students", protect, authorize("STAFF"), getStaffStudents);
router.get("/dashboard/schedule/today", protect, authorize("STAFF"), getStaffTodaySchedule);

/* ========================================
   ADMIN ROUTES
   ======================================== */
// Staff role-specific routes
router.get("/hods", protect, authorize("ADMIN"), getHODs);
router.get("/faculty", protect, authorize("ADMIN"), getFaculty);
router.get("/mentors", protect, authorize("ADMIN"), getMentors);
router.get("/stats", protect, authorize("ADMIN"), getStaffStats);

// CRUD operations
router.get("/", protect, authorize("ADMIN"), getAllStaff);
router.post("/", protect, authorize("ADMIN"), createStaff);
router.get("/:id", protect, authorize("ADMIN"), getStaffById);
router.put("/:id", protect, authorize("ADMIN"), updateStaff);
router.delete("/:id", protect, authorize("ADMIN"), deleteStaff);

export default router;