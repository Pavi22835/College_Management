import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import * as staffController from '../controllers/staffController.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics about users by role and status
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                       example: 150
 *                     active:
 *                       type: integer
 *                       example: 140
 *                     inactive:
 *                       type: integer
 *                       example: 10
 *                     byRole:
 *                       type: object
 *                       properties:
 *                         students:
 *                           type: integer
 *                           example: 100
 *                         teachers:
 *                           type: integer
 *                           example: 40
 *                         admins:
 *                           type: integer
 *                           example: 10
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users/stats', adminController.getUserStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users with optional filtering
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [STUDENT, STAFF, ADMIN]
 *         description: Filter users by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter users by active status
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
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       role:
 *                         type: string
 *                         enum: [STUDENT, STAFF, ADMIN]
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       lastLogin:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/activate:
 *   patch:
 *     summary: Activate a user
 *     description: Activate a deactivated user account
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to activate
 *     responses:
 *       200:
 *         description: User activated successfully
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
 *                   example: "User activated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       enum: [STUDENT, STAFF, ADMIN]
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - User already active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/activate', adminController.activateUser);

/**
 * @swagger
 * /api/admin/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     description: Deactivate an active user account
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
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
 *                   example: "User deactivated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       enum: [STUDENT, STAFF, ADMIN]
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - User already inactive or trying to deactivate own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/deactivate', adminController.deactivateUser);

/**
 * @swagger
 * /api/admin/users/{id}/reset-password:
 *   put:
 *     summary: Reset user password
 *     description: Reset a user's password to a new value
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID whose password to reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password for the user
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       enum: [STUDENT, STAFF, ADMIN]
 *       400:
 *         description: Bad request - Invalid password or trying to reset own password
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// ==================== STUDENT ROUTES ====================

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all active students
 *     tags: [Admin - Student Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       rollNumber:
 *                         type: string
 *                         example: "CS2024001"
 *                       semester:
 *                         type: integer
 *                         example: 4
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           email:
 *                             type: string
 *                             example: "student@example.com"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/students', adminController.getAllStudents);

/**
 * @swagger
 * /api/admin/students/trash:
 *   get:
 *     summary: Get trashed students
 *     description: Retrieve a list of soft-deleted students
 *     tags: [Admin - Student Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       rollNumber:
 *                         type: string
 *                         example: "CS2024001"
 *                       semester:
 *                         type: integer
 *                         example: 4
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           email:
 *                             type: string
 *                             example: "student@example.com"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/students/trash', adminController.getTrashedStudents);

/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student account with user credentials
 *     tags: [Admin - Student Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - rollNumber
 *               - semester
 *               - department
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "student@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               rollNumber:
 *                 type: string
 *                 example: "CS2024001"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 4
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     rollNumber:
 *                       type: string
 *                       example: "CS2024001"
 *                     semester:
 *                       type: integer
 *                       example: 4
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "student@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Email or roll number already exists
 *       500:
 *         description: Server error
 */
router.post('/students', adminController.createStudent);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information about a specific student
 *     tags: [Admin - Student Management]
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     rollNumber:
 *                       type: string
 *                       example: "CS2024001"
 *                     semester:
 *                       type: integer
 *                       example: 4
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     address:
 *                       type: string
 *                       example: "123 Main St, City, State"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "student@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/students/:id', adminController.getStudentById);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   put:
 *     summary: Update student
 *     description: Update student information
 *     tags: [Admin - Student Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to update
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
 *                 example: "student.updated@example.com"
 *               rollNumber:
 *                 type: string
 *                 example: "CS2024001"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 5
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "456 Updated St, City, State"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     rollNumber:
 *                       type: string
 *                       example: "CS2024001"
 *                     semester:
 *                       type: integer
 *                       example: 5
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "student.updated@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe Updated"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       409:
 *         description: Conflict - Email or roll number already exists
 *       500:
 *         description: Server error
 */
router.put('/students/:id', adminController.updateStudent);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   delete:
 *     summary: Delete student
 *     description: Soft delete a student (move to trash)
 *     tags: [Admin - Student Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to delete
 *     responses:
 *       200:
 *         description: Student deleted successfully
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
 *                   example: "Student deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.delete('/students/:id', adminController.deleteStudent);

/**
 * @swagger
 * /api/admin/students/{id}/restore:
 *   post:
 *     summary: Restore student
 *     description: Restore a soft-deleted student from trash
 *     tags: [Admin - Student Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to restore
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.post('/students/:id/restore', adminController.restoreStudent);

/**
 * @swagger
 * /api/admin/students/{id}/permanent:
 *   delete:
 *     summary: Permanently delete student
 *     description: Permanently delete a student from trash
 *     tags: [Admin - Student Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to permanently delete
 *     responses:
 *       200:
 *         description: Student permanently deleted
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
 *                   example: "Student permanently deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.delete('/students/:id/permanent', adminController.permanentDeleteStudent);

// ==================== STAFF ROUTES - USING STAFF CONTROLLER ====================
// IMPORTANT: Specific routes must come BEFORE generic /:id route
// Role-specific routes

/**
 * @swagger
 * /api/admin/staff/hods:
 *   get:
 *     summary: Get all HODs
 *     description: Retrieve a list of all Heads of Departments
 *     tags: [Admin - Staff Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       employeeId:
 *                         type: string
 *                         example: "EMP001"
 *                       name:
 *                         type: string
 *                         example: "Dr. Jane Smith"
 *                       email:
 *                         type: string
 *                         example: "jane.smith@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Professor & HOD"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           email:
 *                             type: string
 *                             example: "jane.smith@example.com"
 *                           name:
 *                             type: string
 *                             example: "Dr. Jane Smith"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff/hods', staffController.getHODs);

/**
 * @swagger
 * /api/admin/staff/faculty:
 *   get:
 *     summary: Get all faculty members
 *     description: Retrieve a list of all faculty members (non-HOD staff)
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty members retrieved successfully
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
 *                         example: 2
 *                       employeeId:
 *                         type: string
 *                         example: "EMP002"
 *                       name:
 *                         type: string
 *                         example: "Prof. John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Associate Professor"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           name:
 *                             type: string
 *                             example: "Prof. John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff/faculty', staffController.getFaculty);

/**
 * @swagger
 * /api/admin/staff/mentors:
 *   get:
 *     summary: Get all mentors
 *     description: Retrieve a list of all staff members who are assigned as mentors
 *     tags: [Admin - Staff Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       employeeId:
 *                         type: string
 *                         example: "EMP003"
 *                       name:
 *                         type: string
 *                         example: "Dr. Alice Johnson"
 *                       email:
 *                         type: string
 *                         example: "alice.johnson@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Assistant Professor"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           email:
 *                             type: string
 *                             example: "alice.johnson@example.com"
 *                           name:
 *                             type: string
 *                             example: "Dr. Alice Johnson"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff/mentors', staffController.getMentors);

/**
 * @swagger
 * /api/admin/staff/stats:
 *   get:
 *     summary: Get staff statistics
 *     description: Retrieve statistics about staff members
 *     tags: [Admin - Staff Management]
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
 *                       example: 45
 *                     hods:
 *                       type: integer
 *                       example: 5
 *                     faculty:
 *                       type: integer
 *                       example: 35
 *                     mentors:
 *                       type: integer
 *                       example: 20
 *                     byDepartment:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         "Computer Science": 15
 *                         "Mathematics": 10
 *                         "Physics": 8
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff/stats', staffController.getStaffStats);

/**
 * @swagger
 * /api/admin/staff/trash:
 *   get:
 *     summary: Get trashed staff
 *     description: Retrieve a list of soft-deleted staff members
 *     tags: [Admin - Staff Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 4
 *                       employeeId:
 *                         type: string
 *                         example: "EMP004"
 *                       name:
 *                         type: string
 *                         example: "Dr. Bob Wilson"
 *                       email:
 *                         type: string
 *                         example: "bob.wilson@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Professor"
 *                       department:
 *                         type: string
 *                         example: "Mathematics"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 4
 *                           email:
 *                             type: string
 *                             example: "bob.wilson@example.com"
 *                           name:
 *                             type: string
 *                             example: "Dr. Bob Wilson"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff/trash', staffController.getTrashedStaff);

// CRUD operations

/**
 * @swagger
 * /api/admin/staff:
 *   get:
 *     summary: Get all staff members
 *     description: Retrieve a list of all active staff members
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff members retrieved successfully
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
 *                       employeeId:
 *                         type: string
 *                         example: "EMP001"
 *                       name:
 *                         type: string
 *                         example: "Dr. Jane Smith"
 *                       email:
 *                         type: string
 *                         example: "jane.smith@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Professor & HOD"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       qualification:
 *                         type: string
 *                         example: "Ph.D. in Computer Science"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           email:
 *                             type: string
 *                             example: "jane.smith@example.com"
 *                           name:
 *                             type: string
 *                             example: "Dr. Jane Smith"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/staff', staffController.getAllStaff);

/**
 * @swagger
 * /api/admin/staff:
 *   post:
 *     summary: Create a new staff member
 *     description: Create a new staff member account with user credentials
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - employeeId
 *               - designation
 *               - department
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "staff@example.com"
 *               name:
 *                 type: string
 *                 example: "Dr. Jane Smith"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               employeeId:
 *                 type: string
 *                 example: "EMP001"
 *               designation:
 *                 type: string
 *                 example: "Professor & HOD"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               qualification:
 *                 type: string
 *                 example: "Ph.D. in Computer Science"
 *               isHOD:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               isMentor:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Staff member created successfully
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
 *                   example: "Staff member created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     employeeId:
 *                       type: string
 *                       example: "EMP001"
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith"
 *                     email:
 *                       type: string
 *                       example: "staff@example.com"
 *                     designation:
 *                       type: string
 *                       example: "Professor & HOD"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "staff@example.com"
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Email or employee ID already exists
 *       500:
 *         description: Server error
 */
router.post('/staff', staffController.createStaff);

/**
 * @swagger
 * /api/admin/staff/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     description: Retrieve detailed information about a specific staff member
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID
 *     responses:
 *       200:
 *         description: Staff member retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     employeeId:
 *                       type: string
 *                       example: "EMP001"
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith"
 *                     email:
 *                       type: string
 *                       example: "jane.smith@example.com"
 *                     designation:
 *                       type: string
 *                       example: "Professor & HOD"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     qualification:
 *                       type: string
 *                       example: "Ph.D. in Computer Science"
 *                     isHOD:
 *                       type: boolean
 *                       example: true
 *                     isMentor:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "jane.smith@example.com"
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
router.get('/staff/:id', staffController.getStaffById);

/**
 * @swagger
 * /api/admin/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     description: Update staff member information
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID to update
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
 *               employeeId:
 *                 type: string
 *                 example: "EMP001"
 *               designation:
 *                 type: string
 *                 example: "Professor & HOD"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               qualification:
 *                 type: string
 *                 example: "Ph.D. in Computer Science"
 *               isHOD:
 *                 type: boolean
 *                 example: true
 *               isMentor:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Staff member updated successfully
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
 *                   example: "Staff member updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     employeeId:
 *                       type: string
 *                       example: "EMP001"
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith Updated"
 *                     email:
 *                       type: string
 *                       example: "jane.smith.updated@example.com"
 *                     designation:
 *                       type: string
 *                       example: "Professor & HOD"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "jane.smith.updated@example.com"
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith Updated"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Staff member not found
 *       409:
 *         description: Conflict - Email or employee ID already exists
 *       500:
 *         description: Server error
 */
router.put('/staff/:id', staffController.updateStaff);

/**
 * @swagger
 * /api/admin/staff/{id}:
 *   delete:
 *     summary: Delete staff member
 *     description: Soft delete a staff member (move to trash)
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID to delete
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
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
 *                   example: "Staff member deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
router.delete('/staff/:id', staffController.deleteStaff);

/**
 * @swagger
 * /api/admin/staff/{id}/restore:
 *   post:
 *     summary: Restore staff member
 *     description: Restore a soft-deleted staff member from trash
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID to restore
 *     responses:
 *       200:
 *         description: Staff member restored successfully
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
 *                   example: "Staff member restored successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
router.post('/staff/:id/restore', staffController.restoreStaff);

/**
 * @swagger
 * /api/admin/staff/{id}/permanent:
 *   delete:
 *     summary: Permanently delete staff member
 *     description: Permanently delete a staff member from trash
 *     tags: [Admin - Staff Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID to permanently delete
 *     responses:
 *       200:
 *         description: Staff member permanently deleted
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
 *                   example: "Staff member permanently deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Server error
 */
router.delete('/staff/:id/permanent', staffController.permanentDeleteStaff);

// ==================== COURSE ROUTES ====================

/**
 * @swagger
 * /api/admin/courses:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all active courses
 *     tags: [Admin - Course Management]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       code:
 *                         type: string
 *                         example: "CS101"
 *                       name:
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *                       description:
 *                         type: string
 *                         example: "Basic concepts of computer science"
 *                       credits:
 *                         type: integer
 *                         example: 3
 *                       semester:
 *                         type: integer
 *                         example: 1
 *                       department:
 *                         type: string
 *                         example: "CS"
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE]
 *                         example: "ACTIVE"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/courses', adminController.getAllCourses);

/**
 * @swagger
 * /api/admin/courses/trash:
 *   get:
 *     summary: Get trashed courses
 *     description: Retrieve a list of soft-deleted courses
 *     tags: [Admin - Course Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trashed courses retrieved successfully
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
 *                         example: 2
 *                       code:
 *                         type: string
 *                         example: "CS102"
 *                       name:
 *                         type: string
 *                         example: "Data Structures"
 *                       description:
 *                         type: string
 *                         example: "Advanced data structures and algorithms"
 *                       credits:
 *                         type: integer
 *                         example: 4
 *                       semester:
 *                         type: integer
 *                         example: 2
 *                       department:
 *                         type: string
 *                         example: "CS"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/courses/trash', adminController.getTrashedCourses);

/**
 * @swagger
 * /api/admin/courses:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course in the system
 *     tags: [Admin - Course Management]
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
 *               - credits
 *               - semester
 *               - department
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS101"
 *               name:
 *                 type: string
 *                 example: "Introduction to Computer Science"
 *               description:
 *                 type: string
 *                 example: "Basic concepts of computer science"
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 example: 3
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 1
 *               department:
 *                 type: string
 *                 example: "CS"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *                 example: "ACTIVE"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS101"
 *                     name:
 *                       type: string
 *                       example: "Introduction to Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Basic concepts of computer science"
 *                     credits:
 *                       type: integer
 *                       example: 3
 *                     semester:
 *                       type: integer
 *                       example: 1
 *                     department:
 *                       type: string
 *                       example: "CS"
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE]
 *                       example: "ACTIVE"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Course code already exists
 *       500:
 *         description: Server error
 */
router.post('/courses', adminController.createCourse);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     description: Retrieve detailed information about a specific course
 *     tags: [Admin - Course Management]
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS101"
 *                     name:
 *                       type: string
 *                       example: "Introduction to Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Basic concepts of computer science"
 *                     credits:
 *                       type: integer
 *                       example: 3
 *                     semester:
 *                       type: integer
 *                       example: 1
 *                     department:
 *                       type: string
 *                       example: "CS"
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE]
 *                       example: "ACTIVE"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/courses/:id', adminController.getCourseById);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   put:
 *     summary: Update course
 *     description: Update course information
 *     tags: [Admin - Course Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS101"
 *               name:
 *                 type: string
 *                 example: "Introduction to Computer Science"
 *               description:
 *                 type: string
 *                 example: "Basic concepts of computer science"
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 example: 3
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 1
 *               department:
 *                 type: string
 *                 example: "CS"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: "ACTIVE"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS101"
 *                     name:
 *                       type: string
 *                       example: "Introduction to Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Basic concepts of computer science"
 *                     credits:
 *                       type: integer
 *                       example: 3
 *                     semester:
 *                       type: integer
 *                       example: 1
 *                     department:
 *                       type: string
 *                       example: "CS"
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE]
 *                       example: "ACTIVE"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       409:
 *         description: Conflict - Course code already exists
 *       500:
 *         description: Server error
 */
router.put('/courses/:id', adminController.updateCourse);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     description: Soft delete a course (move to trash)
 *     tags: [Admin - Course Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to delete
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete('/courses/:id', adminController.deleteCourse);

/**
 * @swagger
 * /api/admin/courses/{id}/restore:
 *   post:
 *     summary: Restore course
 *     description: Restore a soft-deleted course from trash
 *     tags: [Admin - Course Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to restore
 *     responses:
 *       200:
 *         description: Course restored successfully
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
 *                   example: "Course restored successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post('/courses/:id/restore', adminController.restoreCourse);

/**
 * @swagger
 * /api/admin/courses/{id}/permanent:
 *   delete:
 *     summary: Permanently delete course
 *     description: Permanently delete a course from trash
 *     tags: [Admin - Course Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to permanently delete
 *     responses:
 *       200:
 *         description: Course permanently deleted
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
 *                   example: "Course permanently deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete('/courses/:id/permanent', adminController.permanentDeleteCourse);

// ==================== DEPARTMENT ROUTES ====================

/**
 * @swagger
 * /api/admin/departments:
 *   get:
 *     summary: Get all departments
 *     description: Retrieve a list of all active departments with statistics
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
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
 *                       code:
 *                         type: string
 *                         example: "CS"
 *                       name:
 *                         type: string
 *                         example: "Computer Science"
 *                       description:
 *                         type: string
 *                         example: "Department of Computer Science"
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       email:
 *                         type: string
 *                         example: "cs@college.edu"
 *                       location:
 *                         type: string
 *                         example: "Building A, Floor 2"
 *                       hodId:
 *                         type: integer
 *                         example: 1
 *                       stats:
 *                         type: object
 *                         properties:
 *                           courses:
 *                             type: integer
 *                             example: 25
 *                           teachers:
 *                             type: integer
 *                             example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/departments', adminController.getAllDepartments);

/**
 * @swagger
 * /api/admin/departments/trash:
 *   get:
 *     summary: Get trashed departments
 *     description: Retrieve a list of soft-deleted departments
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trashed departments retrieved successfully
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
 *                         example: 2
 *                       code:
 *                         type: string
 *                         example: "MATH"
 *                       name:
 *                         type: string
 *                         example: "Mathematics"
 *                       description:
 *                         type: string
 *                         example: "Department of Mathematics"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/departments/trash', adminController.getTrashedDepartments);

/**
 * @swagger
 * /api/admin/departments:
 *   post:
 *     summary: Create a new department
 *     description: Create a new department in the system
 *     tags: [Admin - Department Management]
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
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS"
 *               name:
 *                 type: string
 *                 example: "Computer Science"
 *               description:
 *                 type: string
 *                 example: "Department of Computer Science"
 *               hodId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the staff member who will be the HOD
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "cs@college.edu"
 *               location:
 *                 type: string
 *                 example: "Building A, Floor 2"
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   example: "Department created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS"
 *                     name:
 *                       type: string
 *                       example: "Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Department of Computer Science"
 *                     hodId:
 *                       type: integer
 *                       example: 1
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     email:
 *                       type: string
 *                       example: "cs@college.edu"
 *                     location:
 *                       type: string
 *                       example: "Building A, Floor 2"
 *                     hod:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith"
 *                         email:
 *                           type: string
 *                           example: "jane.smith@example.com"
 *                         employeeId:
 *                           type: string
 *                           example: "EMP001"
 *       400:
 *         description: Bad request - Validation error or HOD already assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: HOD not found
 *       409:
 *         description: Conflict - Department code or name already exists
 *       500:
 *         description: Server error
 */
router.post('/departments', adminController.createDepartment);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Retrieve detailed information about a specific department including HOD, courses, and teachers
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS"
 *                     name:
 *                       type: string
 *                       example: "Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Department of Computer Science"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     email:
 *                       type: string
 *                       example: "cs@college.edu"
 *                     location:
 *                       type: string
 *                       example: "Building A, Floor 2"
 *                     hodId:
 *                       type: integer
 *                       example: 1
 *                     hod:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith"
 *                         email:
 *                           type: string
 *                           example: "jane.smith@example.com"
 *                         employeeId:
 *                           type: string
 *                           example: "EMP001"
 *                         designation:
 *                           type: string
 *                           example: "Professor & HOD"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                     courses:
 *                       type: array
 *                       items:
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
 *                             example: "Introduction to Computer Science"
 *                           credits:
 *                             type: integer
 *                             example: 3
 *                           semester:
 *                             type: integer
 *                             example: 1
 *                     teachers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "Prof. John Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           employeeId:
 *                             type: string
 *                             example: "EMP002"
 *                           designation:
 *                             type: string
 *                             example: "Associate Professor"
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalCourses:
 *                           type: integer
 *                           example: 25
 *                         totalTeachers:
 *                           type: integer
 *                           example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.get('/departments/:id', adminController.getDepartmentById);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   put:
 *     summary: Update department
 *     description: Update department information
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS"
 *               name:
 *                 type: string
 *                 example: "Computer Science"
 *               description:
 *                 type: string
 *                 example: "Department of Computer Science"
 *               hodId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the staff member who will be the HOD
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "cs@college.edu"
 *               location:
 *                 type: string
 *                 example: "Building A, Floor 2"
 *     responses:
 *       200:
 *         description: Department updated successfully
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
 *                   example: "Department updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "CS"
 *                     name:
 *                       type: string
 *                       example: "Computer Science"
 *                     description:
 *                       type: string
 *                       example: "Department of Computer Science"
 *                     hodId:
 *                       type: integer
 *                       example: 1
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     email:
 *                       type: string
 *                       example: "cs@college.edu"
 *                     location:
 *                       type: string
 *                       example: "Building A, Floor 2"
 *                     hod:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Dr. Jane Smith"
 *                         email:
 *                           type: string
 *                           example: "jane.smith@example.com"
 *                         employeeId:
 *                           type: string
 *                           example: "EMP001"
 *       400:
 *         description: Bad request - Validation error or HOD already assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department or HOD not found
 *       409:
 *         description: Conflict - Department code or name already exists
 *       500:
 *         description: Server error
 */
router.put('/departments/:id', adminController.updateDepartment);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     description: Soft delete a department (move to trash) - only if it has no active courses
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID to delete
 *     responses:
 *       200:
 *         description: Department deleted successfully
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
 *                   example: "Department deleted successfully"
 *       400:
 *         description: Bad request - Department has active courses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.delete('/departments/:id', adminController.deleteDepartment);

/**
 * @swagger
 * /api/admin/departments/{id}/restore:
 *   post:
 *     summary: Restore department
 *     description: Restore a soft-deleted department from trash
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID to restore
 *     responses:
 *       200:
 *         description: Department restored successfully
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
 *                   example: "Department restored successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.post('/departments/:id/restore', adminController.restoreDepartment);

/**
 * @swagger
 * /api/admin/departments/{id}/permanent:
 *   delete:
 *     summary: Permanently delete department
 *     description: Permanently delete a department from trash
 *     tags: [Admin - Department Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID to permanently delete
 *     responses:
 *       200:
 *         description: Department permanently deleted
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
 *                   example: "Department permanently deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.delete('/departments/:id/permanent', adminController.permanentDeleteDepartment);

// ==================== DASHBOARD & UTILITIES ====================

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Retrieve comprehensive dashboard statistics for admin overview
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     totals:
 *                       type: object
 *                       properties:
 *                         students:
 *                           type: integer
 *                           example: 500
 *                         teachers:
 *                           type: integer
 *                           example: 45
 *                         courses:
 *                           type: integer
 *                           example: 120
 *                         activeCourses:
 *                           type: integer
 *                           example: 100
 *                         admins:
 *                           type: integer
 *                           example: 5
 *                         users:
 *                           type: integer
 *                           example: 550
 *                         todayAttendance:
 *                           type: integer
 *                           example: 450
 *                     recentActivities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           description:
 *                             type: string
 *                             example: "Created new student account"
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Admin User"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Retrieve the current admin's profile information
 *     tags: [Admin - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Admin User"
 *                     email:
 *                       type: string
 *                       example: "admin@college.edu"
 *                     role:
 *                       type: string
 *                       example: "ADMIN"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "admin@college.edu"
 *                         name:
 *                           type: string
 *                           example: "Admin User"
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Admin profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile', adminController.getAdminProfile);

// ==================== TRASH MANAGEMENT ====================

/**
 * @swagger
 * /api/admin/trash:
 *   get:
 *     summary: Get trash contents
 *     description: Retrieve all items currently in the trash
 *     tags: [Admin - Trash Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trash contents retrieved successfully
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
 *                       entity:
 *                         type: string
 *                         enum: [STUDENT, TEACHER, COURSE, DEPARTMENT]
 *                         example: "STUDENT"
 *                       entityId:
 *                         type: integer
 *                         example: 123
 *                       data:
 *                         type: object
 *                         description: The original data of the deleted item
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/trash', adminController.getTrash);

/**
 * @swagger
 * /api/admin/trash/{id}/restore:
 *   post:
 *     summary: Restore item from trash
 *     description: Restore a soft-deleted item from trash back to active status
 *     tags: [Admin - Trash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trash item ID to restore
 *     responses:
 *       200:
 *         description: Item restored successfully
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
 *                   example: "Item restored successfully"
 *       400:
 *         description: Bad request - Unknown entity type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Trash item not found
 *       500:
 *         description: Server error
 */
router.post('/trash/:id/restore', adminController.restoreFromTrash);

/**
 * @swagger
 * /api/admin/trash/{id}/permanent:
 *   delete:
 *     summary: Permanently delete item from trash
 *     description: Permanently delete an item from trash (cannot be restored)
 *     tags: [Admin - Trash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trash item ID to permanently delete
 *     responses:
 *       200:
 *         description: Item permanently deleted
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
 *                   example: "Item permanently deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Trash item not found
 *       500:
 *         description: Server error
 */
router.delete('/trash/:id/permanent', adminController.permanentDelete);

/**
 * @swagger
 * /api/admin/trash/empty:
 *   delete:
 *     summary: Empty trash
 *     description: Delete all items from trash (expired items by default, or all items if force=true)
 *     tags: [Admin - Trash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: force
 *         schema:
 *           type: string
 *           enum: [true]
 *         description: Force delete all items (not just expired ones)
 *     responses:
 *       200:
 *         description: Trash emptied successfully
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
 *                   example: "Expired items deleted"
 *                 count:
 *                   type: integer
 *                   example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.delete('/trash/empty', adminController.emptyTrash);

export default router;