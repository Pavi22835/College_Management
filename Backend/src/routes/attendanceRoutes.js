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

/**
 * @swagger
 * /api/attendance/admin:
 *   get:
 *     summary: Get all attendance records (Admin)
 *     description: Retrieve paginated attendance records with optional filtering
 *     tags: [Admin - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Number of records per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-04-16T10:00:00.000Z"
 *                       status:
 *                         type: string
 *                         enum: [PRESENT, ABSENT, LATE]
 *                         example: "PRESENT"
 *                       courseId:
 *                         type: integer
 *                         example: 1
 *                       studentId:
 *                         type: integer
 *                         example: 1
 *                       markedById:
 *                         type: integer
 *                         example: 2
 *                       student:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           rollNumber:
 *                             type: string
 *                             example: "CS2024001"
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                       course:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           code:
 *                             type: string
 *                             example: "CS101"
 *                           name:
 *                             type: string
 *                             example: "Introduction to Programming"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 1000
 *                     total:
 *                       type: integer
 *                       example: 1500
 *                     pages:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin', authorize('ADMIN'), getAllAttendance);

/**
 * @swagger
 * /api/attendance/admin/stats:
 *   get:
 *     summary: Get attendance statistics (Admin)
 *     description: Retrieve comprehensive attendance statistics for admin dashboard
 *     tags: [Admin - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 1500
 *                     presentCount:
 *                       type: integer
 *                       example: 1200
 *                     absentCount:
 *                       type: integer
 *                       example: 250
 *                     lateCount:
 *                       type: integer
 *                       example: 50
 *                     attendanceRate:
 *                       type: number
 *                       format: float
 *                       example: 85.5
 *                     todayStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         present:
 *                           type: integer
 *                           example: 85
 *                         absent:
 *                           type: integer
 *                           example: 12
 *                         late:
 *                           type: integer
 *                           example: 3
 *                     weeklyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-04-16"
 *                           present:
 *                             type: integer
 *                             example: 85
 *                           absent:
 *                             type: integer
 *                             example: 12
 *                           late:
 *                             type: integer
 *                             example: 3
 *                     monthlyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "April 2024"
 *                           present:
 *                             type: integer
 *                             example: 2500
 *                           absent:
 *                             type: integer
 *                             example: 400
 *                           late:
 *                             type: integer
 *                             example: 100
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/stats', authorize('ADMIN'), getAttendanceStats);

/**
 * @swagger
 * /api/attendance/admin/date/{date}:
 *   get:
 *     summary: Get attendance by date (Admin)
 *     description: Retrieve all attendance records for a specific date
 *     tags: [Admin - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Attendance records for the date retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [PRESENT, ABSENT, LATE]
 *                       courseId:
 *                         type: integer
 *                       studentId:
 *                         type: integer
 *                       student:
 *                         type: object
 *                         properties:
 *                           rollNumber:
 *                             type: string
 *                             example: "CS2024001"
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                       course:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "CS101"
 *                           name:
 *                             type: string
 *                             example: "Introduction to Programming"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/date/:date', authorize('ADMIN'), getAttendanceByDate);

/**
 * @swagger
 * /api/attendance/admin/course/{courseId}:
 *   get:
 *     summary: Get attendance by course (Admin)
 *     description: Retrieve all attendance records for a specific course
 *     tags: [Admin - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Course attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         code:
 *                           type: string
 *                           example: "CS101"
 *                         name:
 *                           type: string
 *                           example: "Introduction to Programming"
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-04-16"
 *                           records:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 status:
 *                                   type: string
 *                                   enum: [PRESENT, ABSENT, LATE]
 *                                 student:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 1
 *                                     rollNumber:
 *                                       type: string
 *                                       example: "CS2024001"
 *                                     user:
 *                                       type: object
 *                                       properties:
 *                                         name:
 *                                           type: string
 *                                           example: "John Doe"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalClasses:
 *                           type: integer
 *                           example: 20
 *                         totalStudents:
 *                           type: integer
 *                           example: 50
 *                         averageAttendance:
 *                           type: number
 *                           format: float
 *                           example: 85.5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/admin/course/:courseId', authorize('ADMIN'), getAttendanceByCourse);

/**
 * @swagger
 * /api/attendance/admin/student/{studentId}:
 *   get:
 *     summary: Get attendance by student (Admin)
 *     description: Retrieve all attendance records for a specific student
 *     tags: [Admin - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by specific course
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Student attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         rollNumber:
 *                           type: string
 *                           example: "CS2024001"
 *                         user:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [PRESENT, ABSENT, LATE]
 *                           course:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               code:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalClasses:
 *                           type: integer
 *                           example: 45
 *                         presentCount:
 *                           type: integer
 *                           example: 38
 *                         absentCount:
 *                           type: integer
 *                           example: 5
 *                         lateCount:
 *                           type: integer
 *                           example: 2
 *                         attendancePercentage:
 *                           type: number
 *                           format: float
 *                           example: 84.4
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/admin/student/:studentId', authorize('ADMIN'), getAttendanceByStudent);

/* ========================================
   STAFF ROUTES
   ======================================== */

/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance for a course session (Staff)
 *     description: Mark attendance for all students in a course for a specific date
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - date
 *               - attendance
 *             properties:
 *               courseId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-16"
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE]
 *                       example: "PRESENT"
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Attendance marked successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-04-16"
 *                     markedCount:
 *                       type: integer
 *                       example: 45
 *                     presentCount:
 *                       type: integer
 *                       example: 38
 *                     absentCount:
 *                       type: integer
 *                       example: 5
 *                     lateCount:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - Validation error or attendance already marked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required or not authorized for this course
 *       404:
 *         description: Course or student not found
 *       500:
 *         description: Server error
 */
router.post('/mark', authorize('STAFF'), markAttendance);

/**
 * @swagger
 * /api/attendance/mark/{courseId}/{studentId}:
 *   post:
 *     summary: Mark attendance for a single student (Staff)
 *     description: Mark attendance for a specific student in a course
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - status
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-16"
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE]
 *                 example: "PRESENT"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Attendance marked successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     courseId:
 *                       type: integer
 *                       example: 1
 *                     studentId:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-04-16"
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE]
 *                       example: "PRESENT"
 *       400:
 *         description: Bad request - Validation error or attendance already marked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required or not authorized for this course
 *       404:
 *         description: Course or student not found
 *       500:
 *         description: Server error
 */
router.post('/mark/:courseId/:studentId', authorize('STAFF'), markSingleAttendance);

/**
 * @swagger
 * /api/attendance/mark/bulk:
 *   post:
 *     summary: Mark bulk attendance (Staff)
 *     description: Mark attendance for multiple students across different courses
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - records
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-16"
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - courseId
 *                     - studentId
 *                     - status
 *                   properties:
 *                     courseId:
 *                       type: integer
 *                       example: 1
 *                     studentId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE]
 *                       example: "PRESENT"
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bulk attendance marked successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 150
 *                     successCount:
 *                       type: integer
 *                       example: 145
 *                     failedCount:
 *                       type: integer
 *                       example: 5
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: integer
 *                             example: 1
 *                           studentId:
 *                             type: integer
 *                             example: 1
 *                           status:
 *                             type: string
 *                             enum: [PRESENT, ABSENT, LATE]
 *                             example: "PRESENT"
 *                           success:
 *                             type: boolean
 *                             example: true
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       500:
 *         description: Server error
 */
router.post('/mark/bulk', authorize('STAFF'), markBulkAttendance);

/**
 * @swagger
 * /api/attendance/course/{courseId}:
 *   get:
 *     summary: Get course attendance (Staff)
 *     description: Retrieve attendance records for a course taught by the staff member
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Course attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         code:
 *                           type: string
 *                           example: "CS101"
 *                         name:
 *                           type: string
 *                           example: "Introduction to Programming"
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-04-16"
 *                           records:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 status:
 *                                   type: string
 *                                   enum: [PRESENT, ABSENT, LATE]
 *                                 student:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 1
 *                                     rollNumber:
 *                                       type: string
 *                                       example: "CS2024001"
 *                                     user:
 *                                       type: object
 *                                       properties:
 *                                         name:
 *                                           type: string
 *                                           example: "John Doe"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalClasses:
 *                           type: integer
 *                           example: 20
 *                         totalStudents:
 *                           type: integer
 *                           example: 45
 *                         averageAttendance:
 *                           type: number
 *                           format: float
 *                           example: 85.5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 900
 *                     pages:
 *                       type: integer
 *                       example: 18
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required or not authorized for this course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/course/:courseId', authorize('STAFF'), getTeacherCourseAttendance);

/**
 * @swagger
 * /api/attendance/staff/stats:
 *   get:
 *     summary: Get staff attendance statistics (Staff)
 *     description: Retrieve attendance statistics for courses taught by the staff member
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff attendance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: integer
 *                       example: 3
 *                     totalClasses:
 *                       type: integer
 *                       example: 60
 *                     totalAttendanceRecords:
 *                       type: integer
 *                       example: 2700
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: integer
 *                             example: 1
 *                           courseName:
 *                             type: string
 *                             example: "Introduction to Programming"
 *                           courseCode:
 *                             type: string
 *                             example: "CS101"
 *                           totalClasses:
 *                             type: integer
 *                             example: 20
 *                           totalStudents:
 *                             type: integer
 *                             example: 45
 *                           averageAttendance:
 *                             type: number
 *                             format: float
 *                             example: 85.5
 *                           presentCount:
 *                             type: integer
 *                             example: 765
 *                           absentCount:
 *                             type: integer
 *                             example: 135
 *                           lateCount:
 *                             type: integer
 *                             example: 0
 *                     overall:
 *                       type: object
 *                       properties:
 *                         averageAttendance:
 *                           type: number
 *                           format: float
 *                           example: 84.2
 *                         totalPresent:
 *                           type: integer
 *                           example: 2295
 *                         totalAbsent:
 *                           type: integer
 *                           example: 405
 *                         totalLate:
 *                           type: integer
 *                           example: 0
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       500:
 *         description: Server error
 */
router.get('/staff/stats', authorize('STAFF'), getTeacherAttendanceStats);

/**
 * @swagger
 * /api/attendance/staff/recent:
 *   get:
 *     summary: Get recent attendance records (Staff)
 *     description: Retrieve recent attendance records marked by the staff member
 *     tags: [Staff - Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of recent records to retrieve
 *     responses:
 *       200:
 *         description: Recent attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-04-16T10:00:00.000Z"
 *                       status:
 *                         type: string
 *                         enum: [PRESENT, ABSENT, LATE]
 *                         example: "PRESENT"
 *                       course:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           code:
 *                             type: string
 *                             example: "CS101"
 *                           name:
 *                             type: string
 *                             example: "Introduction to Programming"
 *                       student:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           rollNumber:
 *                             type: string
 *                             example: "CS2024001"
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       500:
 *         description: Server error
 */
router.get('/staff/recent', authorize('STAFF'), getTeacherRecentAttendance);

export default router;