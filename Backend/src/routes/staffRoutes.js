import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  restoreStaff,
  permanentDeleteStaff,
  getTrashedStaff,
  getHODs,
  getFaculty,
  getMentors,
  getStaffStats,
  getStaffProfile,
  updateStaffProfile,
  updateStaffPassword,
  getStaffDashboardStats,
  getStaffCourses,
  getStaffStudents,
  getStaffTodaySchedule,
  createStaffCourse,
  getStaffCourseById,
  updateStaffCourse,
  deleteStaffCourse
} from "../controllers/staffController.js";

const router = express.Router();

// Staff self routes
router.get("/profile", protect, authorize("STAFF"), getStaffProfile);
router.put("/profile", protect, authorize("STAFF"), updateStaffProfile);
router.put("/password", protect, authorize("STAFF"), updateStaffPassword);
router.get("/dashboard/stats", protect, authorize("STAFF"), getStaffDashboardStats);
router.get("/dashboard/courses", protect, authorize("STAFF"), getStaffCourses);
router.get("/dashboard/students", protect, authorize("STAFF"), getStaffStudents);
router.get("/dashboard/schedule/today", protect, authorize("STAFF"), getStaffTodaySchedule);

// Course management routes
router.post("/courses", protect, authorize("STAFF", "ADMIN"), createStaffCourse);
router.get("/courses/:id", protect, authorize("STAFF", "ADMIN"), getStaffCourseById);
router.put("/courses/:id", protect, authorize("STAFF", "ADMIN"), updateStaffCourse);
router.delete("/courses/:id", protect, authorize("STAFF", "ADMIN"), deleteStaffCourse);

// Admin routes - SPECIFIC ROUTES FIRST
router.get("/trash", protect, authorize("ADMIN"), getTrashedStaff);
router.get("/stats", protect, authorize("ADMIN"), getStaffStats);
router.get("/hods", protect, authorize("ADMIN"), getHODs);
router.get("/faculty", protect, authorize("ADMIN"), getFaculty);
router.get("/mentors", protect, authorize("ADMIN"), getMentors);

// Parameterized routes
router.get("/:id/restore", protect, authorize("ADMIN"), restoreStaff);
router.delete("/:id/permanent", protect, authorize("ADMIN"), permanentDeleteStaff);
router.get("/:id", protect, authorize("ADMIN"), getStaffById);
router.put("/:id", protect, authorize("ADMIN"), updateStaff);
router.delete("/:id", protect, authorize("ADMIN"), deleteStaff);

// General routes
router.get("/", protect, authorize("ADMIN"), getAllStaff);
router.post("/", protect, authorize("ADMIN"), createStaff);

export default router;