import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve general statistics for the admin dashboard including total counts and recent students
 *     tags: [Dashboard]
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
 *                           example: 150
 *                           description: Total number of active students
 *                         teachers:
 *                           type: integer
 *                           example: 25
 *                           description: Total number of active teachers/staff
 *                         courses:
 *                           type: integer
 *                           example: 45
 *                           description: Total number of active courses
 *                     recentStudents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Alice Johnson"
 *                           email:
 *                             type: string
 *                             example: "alice.johnson@student.edu"
 *                           rollNumber:
 *                             type: string
 *                             example: "CS2023001"
 *                           department:
 *                             type: string
 *                             example: "Computer Science"
 *                           batch:
 *                             type: string
 *                             example: "2023-2027"
 *                           semester:
 *                             type: integer
 *                             example: 1
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       description: List of 5 most recently added students
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/stats", getDashboardStats);

export default router;