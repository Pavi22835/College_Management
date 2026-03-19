import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  // Admin methods
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  
  // Teacher methods
  getCoursesByTeacher,
  getTeacherCourseDetails,
  
  // Enrollment methods
  enrollStudent,
  removeStudent,
  
  // Trash methods
  getTrashedCourses,
  restoreCourse,
  permanentDeleteCourse
} from "../controllers/courseController.js";

const router = express.Router();

/* ========================================
   PUBLIC ROUTES (Accessible by authenticated users)
   ======================================== */
// These routes are accessible by both ADMIN and TEACHER
router.get("/", protect, getCourses);
router.get("/:id", protect, getCourseById);

/* ========================================
   TEACHER ROUTES (Teacher only)
   ======================================== */
// Teachers can view their assigned courses
router.get("/staff/my-courses", protect, authorize("STAFF"), getCoursesByTeacher);
router.get("/staff/:courseId", protect, authorize("STAFF"), getTeacherCourseDetails);

/* ========================================
   ADMIN ONLY ROUTES
   ======================================== */
// Course management (Admin only)
router.post("/", protect, authorize("ADMIN"), createCourse);
router.put("/:id", protect, authorize("ADMIN"), updateCourse);
router.delete("/:id", protect, authorize("ADMIN"), deleteCourse);

// Enrollment management (Admin only)
router.post("/enroll", protect, authorize("ADMIN"), enrollStudent);
router.delete("/:courseId/students/:studentId", protect, authorize("ADMIN"), removeStudent);

// Trash management (Admin only)
router.get("/trash/all", protect, authorize("ADMIN"), getTrashedCourses);
router.post("/:id/restore", protect, authorize("ADMIN"), restoreCourse);
router.delete("/:id/permanent", protect, authorize("ADMIN"), permanentDeleteCourse);

export default router;
