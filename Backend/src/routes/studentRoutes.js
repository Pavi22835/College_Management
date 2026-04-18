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
  getStudentAttendanceStats,
  getStudentAttendanceByCourse,
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

/**
 * @swagger
 * /api/students/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                       $ref: '#/components/schemas/Student'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalCourses:
 *                           type: integer
 *                           example: 5
 *                         completedCourses:
 *                           type: integer
 *                           example: 3
 *                         attendancePercentage:
 *                           type: number
 *                           format: float
 *                           example: 85.5
 *                         cgpa:
 *                           type: number
 *                           format: float
 *                           example: 8.2
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/dashboard", protect, authorize("STUDENT"), getStudentDashboard);

/**
 * @swagger
 * /api/students/courses:
 *   get:
 *     summary: Get student's enrolled courses
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 */
router.get("/courses", protect, authorize("STUDENT"), getStudentCourses);

/**
 * @swagger
 * /api/students/courses/{courseId}:
 *   get:
 *     summary: Get detailed course information for student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 */
router.get("/courses/:courseId", protect, authorize("STUDENT"), getStudentCourseDetail);

/**
 * @swagger
 * /api/students/attendance:
 *   get:
 *     summary: Get student's attendance records
 *     tags: [Students, Attendance]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Attendance'
 */
router.get("/attendance", protect, authorize("STUDENT"), getStudentAttendance);

/**
 * @swagger
 * /api/students/attendance/stats:
 *   get:
 *     summary: Get student's attendance statistics
 *     tags: [Students, Attendance]
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
 *                     totalClasses:
 *                       type: integer
 *                       example: 50
 *                     presentCount:
 *                       type: integer
 *                       example: 42
 *                     absentCount:
 *                       type: integer
 *                       example: 5
 *                     lateCount:
 *                       type: integer
 *                       example: 3
 *                     percentage:
 *                       type: number
 *                       format: float
 *                       example: 84.0
 */
router.get("/attendance/stats", protect, authorize("STUDENT"), getStudentAttendanceStats);

/**
 * @swagger
 * /api/students/attendance/course/{courseId}:
 *   get:
 *     summary: Get student's attendance for specific course
 *     tags: [Students, Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course attendance retrieved successfully
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
 *                     $ref: '#/components/schemas/Attendance'
 */
router.get("/attendance/course/:courseId", protect, authorize("STUDENT"), getStudentAttendanceByCourse);

/**
 * @swagger
 * /api/students/grades:
 *   get:
 *     summary: Get student's grades
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
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
 *                       courseId:
 *                         type: integer
 *                         example: 1
 *                       courseName:
 *                         type: string
 *                         example: "Data Structures"
 *                       grade:
 *                         type: string
 *                         example: "A"
 *                       gradePoint:
 *                         type: number
 *                         format: float
 *                         example: 9.0
 *                       semester:
 *                         type: integer
 *                         example: 3
 */
router.get("/grades", protect, authorize("STUDENT"), getStudentGrades);

/* ========================================
   STAFF ROUTES
   ======================================== */

/**
 * @swagger
 * /api/students/staff/all:
 *   get:
 *     summary: Get all students for staff/teacher
 *     tags: [Students, Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
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
 *                     $ref: '#/components/schemas/Student'
 */
router.get("/staff/all", protect, authorize("STAFF"), getTeacherAllStudents);

/**
 * @swagger
 * /api/students/staff/batches:
 *   get:
 *     summary: Get student batches for staff
 *     tags: [Students, Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student batches retrieved successfully
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
 *                       batchId:
 *                         type: integer
 *                         example: 1
 *                       batchName:
 *                         type: string
 *                         example: "2024-2028"
 *                       studentCount:
 *                         type: integer
 *                         example: 120
 */
router.get("/staff/batches", protect, authorize("STAFF"), getStaffStudentBatches);

/**
 * @swagger
 * /api/students/staff/{teacherId}:
 *   get:
 *     summary: Get students assigned to specific teacher
 *     tags: [Students, Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher/Staff ID
 *     responses:
 *       200:
 *         description: Students retrieved successfully
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
 *                     $ref: '#/components/schemas/Student'
 */
router.get("/staff/:teacherId", protect, authorize("ADMIN", "STAFF"), getStudentsByTeacher);

/**
 * @swagger
 * /api/students/staff/attendance/{studentId}:
 *   get:
 *     summary: Get specific student's attendance for teacher
 *     tags: [Students, Staff, Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student attendance retrieved successfully
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
 *                     $ref: '#/components/schemas/Attendance'
 */
router.get("/staff/attendance/:studentId", protect, authorize("STAFF"), getStudentAttendanceForTeacher);

/**
 * @swagger
 * /api/students/course/{courseId}:
 *   get:
 *     summary: Get students enrolled in specific course
 *     tags: [Students, Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course students retrieved successfully
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
 *                     $ref: '#/components/schemas/Student'
 */
router.get("/course/:courseId", protect, authorize("STAFF"), getStudentsByCourse);

/* ========================================
   ADMIN ROUTES (MUST BE LAST)
   Generic :id route comes last to avoid matching specific routes
   ======================================== */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students (Admin)
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeTrashed
 *         schema:
 *           type: string
 *           enum: [true]
 *         description: Include soft-deleted students
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Students retrieved successfully
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
 *                     $ref: '#/components/schemas/Student'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 15
 */
router.get("/", protect, authorize("ADMIN"), getAllStudents);

/**
 * @swagger
 * /api/students/trash:
 *   get:
 *     summary: Get trashed (soft-deleted) students
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trashed students retrieved successfully
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
 *                     $ref: '#/components/schemas/Student'
 */
router.get("/trash", protect, authorize("ADMIN"), getTrashedStudents);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create new student
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - enrollmentNumber
 *               - batchId
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               enrollmentNumber:
 *                 type: string
 *                 example: "EN2024001"
 *               batchId:
 *                 type: integer
 *                 example: 1
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 1
 *     responses:
 *       201:
 *         description: Student created successfully
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
 *                   example: "Student created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 */
router.post("/", protect, authorize("ADMIN"), createStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", protect, authorize("ADMIN"), getStudentById);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe.updated@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567891"
 *               address:
 *                 type: string
 *                 example: "456 Updated St, City, State"
 *               department:
 *                 type: string
 *                 example: "Information Technology"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated, suspended]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Student updated successfully
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
 *                   example: "Student updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 */
router.put("/:id", protect, authorize("ADMIN"), updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Soft delete student (move to trash)
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student moved to trash successfully
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
 *                   example: "Student moved to trash successfully"
 */
router.delete("/:id", protect, authorize("ADMIN"), deleteStudent);

/**
 * @swagger
 * /api/students/{id}/restore:
 *   post:
 *     summary: Restore student from trash
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student restored successfully
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
 *                   example: "Student restored successfully"
 */
router.post("/:id/restore", protect, authorize("ADMIN"), restoreStudent);

/**
 * @swagger
 * /api/students/{id}/permanent:
 *   delete:
 *     summary: Permanently delete student
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student permanently deleted successfully
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
 *                   example: "Student permanently deleted successfully"
 */
router.delete("/:id/permanent", protect, authorize("ADMIN"), permanentDeleteStudent);

/**
 * @swagger
 * /api/students/{id}/activate:
 *   post:
 *     summary: Activate student account
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student activated successfully
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
 *                   example: "Student account activated successfully"
 */
router.post("/:id/activate", protect, authorize("ADMIN"), activateStudent);

/**
 * @swagger
 * /api/students/{id}/deactivate:
 *   post:
 *     summary: Deactivate student account
 *     tags: [Students, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deactivated successfully
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
 *                   example: "Student account deactivated successfully"
 */
router.post("/:id/deactivate", protect, authorize("ADMIN"), deactivateStudent);

export default router;