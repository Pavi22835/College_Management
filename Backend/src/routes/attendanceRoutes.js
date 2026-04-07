import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  // Admin methods
  getAllAttendance,
  getAttendanceStats,
  getAttendanceByDate,
  getAttendanceByCourse,
  getAttendanceByStudent,
  
  // Staff methods
  markAttendance,
  markSingleAttendance,
  markBulkAttendance,
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
router.get('/admin', authorize('ADMIN'), getAllAttendance);
router.get('/admin/stats', authorize('ADMIN'), getAttendanceStats);
router.get('/admin/date/:date', authorize('ADMIN'), getAttendanceByDate);
router.get('/admin/course/:courseId', authorize('ADMIN'), getAttendanceByCourse);
router.get('/admin/student/:studentId', authorize('ADMIN'), getAttendanceByStudent);

/* ========================================
   STAFF ROUTES
   ======================================== */
router.post('/mark', authorize('STAFF'), markAttendance);
router.post('/mark/:courseId/:studentId', authorize('STAFF'), markSingleAttendance);
router.post('/mark/bulk', authorize('STAFF'), markBulkAttendance);
router.get('/course/:courseId', authorize('STAFF'), getTeacherCourseAttendance);
router.get('/staff/stats', authorize('STAFF'), getTeacherAttendanceStats);
router.get('/staff/recent', authorize('STAFF'), getTeacherRecentAttendance);

export default router;