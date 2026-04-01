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
   ADMIN ROUTES (with /admin prefix)
   ======================================== */
// Admin course management routes
router.get("/admin/courses", protect, authorize("ADMIN"), getCourses);
router.get("/admin/courses/trash", protect, authorize("ADMIN"), getTrashedCourses);
router.post("/admin/courses", protect, authorize("ADMIN"), createCourse);
router.get("/admin/courses/:id", protect, authorize("ADMIN"), getCourseById);
router.put("/admin/courses/:id", protect, authorize("ADMIN"), updateCourse);
router.delete("/admin/courses/:id", protect, authorize("ADMIN"), deleteCourse);
router.post("/admin/courses/:id/restore", protect, authorize("ADMIN"), restoreCourse);
router.delete("/admin/courses/:id/permanent", protect, authorize("ADMIN"), permanentDeleteCourse);

// Admin enrollment routes
router.post("/admin/courses/:courseId/students", protect, authorize("ADMIN"), enrollStudent);
router.delete("/admin/courses/:courseId/students/:studentId", protect, authorize("ADMIN"), removeStudent);

/* ========================================
   PUBLIC ROUTES (Accessible by authenticated users)
   ======================================== */
// These routes are accessible by both ADMIN and TEACHER
router.get("/courses", protect, getCourses);
router.get("/courses/:id", protect, getCourseById);

/* ========================================
   TEACHER ROUTES (Teacher only)
   ======================================== */
// Teachers can view their assigned courses
router.get("/staff/my-courses", protect, authorize("STAFF"), getCoursesByTeacher);
router.get("/staff/:courseId", protect, authorize("STAFF"), getTeacherCourseDetails);

export default router;