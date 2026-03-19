import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  // Admin methods
  getAllAttendance,
  getAttendanceStats,
  getAttendanceByDate,
  getAttendanceByCourse,
  getAttendanceByStudent,
  
  // Teacher methods
  markAttendance,
  getTeacherCourseAttendance,
  getTeacherAttendanceStats,
  getTeacherRecentAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

/* ========================================
   PROTECT ALL ROUTES
   ======================================== */
router.use(protect);

/* ========================================
   ADMIN ROUTES
   ======================================== */
// Admin attendance management
router.get('/admin', authorize('ADMIN'), getAllAttendance);
router.get('/admin/stats', authorize('ADMIN'), getAttendanceStats);
router.get('/admin/date/:date', authorize('ADMIN'), getAttendanceByDate);
router.get('/admin/course/:courseId', authorize('ADMIN'), getAttendanceByCourse);
router.get('/admin/student/:studentId', authorize('ADMIN'), getAttendanceByStudent);

/* ========================================
   STAFF ROUTES
   ======================================== */
// Staff attendance management
router.post('/mark', authorize('STAFF'), markAttendance);
router.get('/course/:courseId', authorize('STAFF'), getTeacherCourseAttendance);
router.get('/staff/stats', authorize('STAFF'), getTeacherAttendanceStats);
router.get('/staff/recent', authorize('STAFF'), getTeacherRecentAttendance);

export default router;
