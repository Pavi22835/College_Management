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

/* ========================================
   STAFF SELF ROUTES
   ======================================== */

/**
 * @swagger
 * /api/staff/profile:
 *   get:
 *     summary: Get staff profile
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 */
router.get("/profile", protect, authorize("STAFF"), getStaffProfile);

/**
 * @swagger
 * /api/staff/profile:
 *   put:
 *     summary: Update staff profile
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dr. Jane Smith"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "456 College St, City, State"
 *               qualification:
 *                 type: string
 *                 example: "PhD in Computer Science"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 */
router.put("/profile", protect, authorize("STAFF"), updateStaffProfile);

/**
 * @swagger
 * /api/staff/password:
 *   put:
 *     summary: Update staff password
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "currentpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: "Password updated successfully"
 */
router.put("/password", protect, authorize("STAFF"), updateStaffPassword);

/**
 * @swagger
 * /api/staff/dashboard/stats:
 *   get:
 *     summary: Get staff dashboard statistics
 *     tags: [Staff, Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
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
 *                       example: 5
 *                     totalStudents:
 *                       type: integer
 *                       example: 120
 *                     todayAttendance:
 *                       type: integer
 *                       example: 95
 *                     pendingTasks:
 *                       type: integer
 *                       example: 3
 */
router.get("/dashboard/stats", protect, authorize("STAFF"), getStaffDashboardStats);

/**
 * @swagger
 * /api/staff/dashboard/courses:
 *   get:
 *     summary: Get staff's assigned courses
 *     tags: [Staff, Courses]
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
router.get("/dashboard/courses", protect, authorize("STAFF"), getStaffCourses);

/**
 * @swagger
 * /api/staff/dashboard/students:
 *   get:
 *     summary: Get staff's students
 *     tags: [Staff, Students]
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
router.get("/dashboard/students", protect, authorize("STAFF"), getStaffStudents);

/**
 * @swagger
 * /api/staff/dashboard/schedule/today:
 *   get:
 *     summary: Get today's schedule for staff
 *     tags: [Staff, Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's schedule retrieved successfully
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
 *                       time:
 *                         type: string
 *                         example: "10:00 AM - 11:00 AM"
 *                       room:
 *                         type: string
 *                         example: "Room 101"
 */
router.get("/dashboard/schedule/today", protect, authorize("STAFF"), getStaffTodaySchedule);

/* ========================================
   COURSE MANAGEMENT ROUTES
   ======================================== */

/**
 * @swagger
 * /api/staff/courses:
 *   post:
 *     summary: Create new course for staff
 *     tags: [Staff, Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - department
 *               - semester
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS101"
 *               name:
 *                 type: string
 *                 example: "Introduction to Programming"
 *               description:
 *                 type: string
 *                 example: "Basic programming concepts"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               semester:
 *                 type: integer
 *                 example: 1
 *               credits:
 *                 type: integer
 *                 example: 3
 *               maxStudents:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: "Course created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 */
router.post("/courses", protect, authorize("STAFF", "ADMIN"), createStaffCourse);

/**
 * @swagger
 * /api/staff/courses/{id}:
 *   get:
 *     summary: Get course by ID for staff
 *     tags: [Staff, Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
router.get("/courses/:id", protect, authorize("STAFF", "ADMIN"), getStaffCourseById);

/**
 * @swagger
 * /api/staff/courses/{id}:
 *   put:
 *     summary: Update course for staff
 *     tags: [Staff, Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Advanced Programming"
 *               description:
 *                 type: string
 *                 example: "Advanced programming concepts"
 *               credits:
 *                 type: integer
 *                 example: 4
 *               maxStudents:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                   example: "Course updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 */
router.put("/courses/:id", protect, authorize("STAFF", "ADMIN"), updateStaffCourse);

/**
 * @swagger
 * /api/staff/courses/{id}:
 *   delete:
 *     summary: Delete course for staff
 *     tags: [Staff, Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
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
 *                   example: "Course deleted successfully"
 */
router.delete("/courses/:id", protect, authorize("STAFF", "ADMIN"), deleteStaffCourse);

/* ========================================
   ADMIN ROUTES
   ======================================== */

/**
 * @swagger
 * /api/staff/trash:
 *   get:
 *     summary: Get trashed (soft-deleted) staff
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trashed staff retrieved successfully
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
 *                     $ref: '#/components/schemas/Staff'
 */
router.get("/trash", protect, authorize("ADMIN"), getTrashedStaff);

/**
 * @swagger
 * /api/staff/stats:
 *   get:
 *     summary: Get staff statistics
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff statistics retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     active:
 *                       type: integer
 *                       example: 22
 *                     inactive:
 *                       type: integer
 *                       example: 2
 *                     trashed:
 *                       type: integer
 *                       example: 1
 *                     departments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Computer Science"
 *                           count:
 *                             type: integer
 *                             example: 8
 */
router.get("/stats", protect, authorize("ADMIN"), getStaffStats);

/**
 * @swagger
 * /api/staff/hods:
 *   get:
 *     summary: Get all HODs (Heads of Department)
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HODs retrieved successfully
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
 *                     $ref: '#/components/schemas/Staff'
 */
router.get("/hods", protect, authorize("ADMIN"), getHODs);

/**
 * @swagger
 * /api/staff/faculty:
 *   get:
 *     summary: Get all faculty members
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty retrieved successfully
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
 *                     $ref: '#/components/schemas/Staff'
 */
router.get("/faculty", protect, authorize("ADMIN"), getFaculty);

/**
 * @swagger
 * /api/staff/mentors:
 *   get:
 *     summary: Get all mentors
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentors retrieved successfully
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
 *                     $ref: '#/components/schemas/Staff'
 */
router.get("/mentors", protect, authorize("ADMIN"), getMentors);

/**
 * @swagger
 * /api/staff/{id}/restore:
 *   get:
 *     summary: Restore staff from trash
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff restored successfully
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
 *                   example: "Staff restored successfully"
 */
router.get("/:id/restore", protect, authorize("ADMIN"), restoreStaff);

/**
 * @swagger
 * /api/staff/{id}/permanent:
 *   delete:
 *     summary: Permanently delete staff
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff permanently deleted successfully
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
 *                   example: "Staff permanently deleted successfully"
 */
router.delete("/:id/permanent", protect, authorize("ADMIN"), permanentDeleteStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Get staff by ID
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 */
router.get("/:id", protect, authorize("ADMIN"), getStaffById);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update staff
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dr. Jane Smith Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.smith.updated@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567891"
 *               department:
 *                 type: string
 *                 example: "Information Technology"
 *               designation:
 *                 type: string
 *                 example: "Associate Professor"
 *               qualification:
 *                 type: string
 *                 example: "PhD in Information Technology"
 *               address:
 *                 type: string
 *                 example: "789 Updated St, City, State"
 *     responses:
 *       200:
 *         description: Staff updated successfully
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
 *                   example: "Staff updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 */
router.put("/:id", protect, authorize("ADMIN"), updateStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     summary: Soft delete staff (move to trash)
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff moved to trash successfully
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
 *                   example: "Staff moved to trash successfully"
 */
router.delete("/:id", protect, authorize("ADMIN"), deleteStaff);

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff (Admin)
 *     tags: [Staff, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeTrashed
 *         schema:
 *           type: string
 *           enum: [true]
 *         description: Include soft-deleted staff
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
 *         description: Staff retrieved successfully
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
 *                     $ref: '#/components/schemas/Staff'
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
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 */
router.get("/", protect, authorize("ADMIN"), getAllStaff);

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Create new staff
 *     tags: [Staff, Admin]
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
 *               - department
 *               - designation
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dr. Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.smith@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               designation:
 *                 type: string
 *                 example: "Professor"
 *               staffRole:
 *                 type: string
 *                 enum: [HOD, FACULTY, MENTOR]
 *                 example: "FACULTY"
 *               employeeId:
 *                 type: string
 *                 example: "EMP001"
 *               qualification:
 *                 type: string
 *                 example: "PhD in Computer Science"
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 example: "2020-01-01"
 *               address:
 *                 type: string
 *                 example: "456 College St, City, State"
 *     responses:
 *       201:
 *         description: Staff created successfully
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
 *                   example: "Staff created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 */
router.post("/", protect, authorize("ADMIN"), createStaff);

export default router;