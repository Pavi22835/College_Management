import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByCourse,
  getTeacherAllStudents,
  getStudentAttendanceForTeacher,
  getStudentsByTeacher,
  getStudentDashboard,
  getStudentCourses,
  getStudentCourseDetail,
  getStudentAttendance,
  getStudentGrades,
  getTrashedStudents,
  restoreStudent,
  permanentDeleteStudent,
  activateStudent,
  deactivateStudent,
  getStaffStudentBatches
} from "../controllers/studentController.js";

const router = express.Router();

/* ========================================
   STUDENT DASHBOARD ROUTES (MUST BE FIRST)
   These specific routes must come before generic /:id route
   ======================================== */
router.get("/dashboard", protect, authorize("STUDENT"), getStudentDashboard);
router.get("/courses", protect, authorize("STUDENT"), getStudentCourses);
router.get("/courses/:courseId", protect, authorize("STUDENT"), getStudentCourseDetail);
router.get("/attendance", protect, authorize("STUDENT"), getStudentAttendance);
router.get("/grades", protect, authorize("STUDENT"), getStudentGrades);

/* ========================================
   STAFF ROUTES
   ======================================== */
router.get("/staff/all", protect, authorize("STAFF"), getTeacherAllStudents);
router.get("/staff/batches", protect, authorize("STAFF"), getStaffStudentBatches);
router.get("/staff/:teacherId", protect, authorize("ADMIN", "STAFF"), getStudentsByTeacher);
router.get("/staff/attendance/:studentId", protect, authorize("STAFF"), getStudentAttendanceForTeacher);
router.get("/course/:courseId", protect, authorize("STAFF"), getStudentsByCourse);

/* ========================================
   ADMIN ROUTES (MUST BE LAST)
   Generic :id route comes last to avoid matching specific routes
   ======================================== */
router.get("/", protect, authorize("ADMIN"), getAllStudents);
router.get("/trash", protect, authorize("ADMIN"), getTrashedStudents);
router.post("/", protect, authorize("ADMIN"), createStudent);
router.get("/:id", protect, authorize("ADMIN"), getStudentById);
router.put("/:id", protect, authorize("ADMIN"), updateStudent);
router.delete("/:id", protect, authorize("ADMIN"), deleteStudent);  // Soft delete - move to trash
router.post("/:id/restore", protect, authorize("ADMIN"), restoreStudent);  // Restore from trash
router.delete("/:id/permanent", protect, authorize("ADMIN"), permanentDeleteStudent);  // Permanent delete
router.post("/:id/activate", protect, authorize("ADMIN"), activateStudent);
router.post("/:id/deactivate", protect, authorize("ADMIN"), deactivateStudent);

export default router;