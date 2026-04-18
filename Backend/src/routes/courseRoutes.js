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
  getAvailableBatches,
  
  // Enrollment methods
  enrollStudent,
  removeStudent,
  
  // Trash methods
  getTrashedCourses,
  restoreCourse,
  permanentDeleteCourse,
  
  // Lesson methods
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
  
  // Material methods
  uploadMaterial,
  getMaterialsByLesson,
  deleteMaterial
} from "../controllers/courseController.js";

// Import topic controller
import {
  createTopic,
  getTopicsByLesson,
  updateTopic,
  deleteTopic
} from "../controllers/topicController.js";

const router = express.Router();

// ========== TOPIC ROUTES (MUST BE FIRST) ==========

/**
 * @swagger
 * /api/courses/lessons/{lessonId}/topics:
 *   post:
 *     summary: Create a topic for a lesson
 *     description: Create a new topic under a specific lesson
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Variables"
 *               content:
 *                 type: string
 *                 example: "Variables are containers for storing data values..."
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Topic created successfully
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
 *                   example: "Topic created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Introduction to Variables"
 *                     content:
 *                       type: string
 *                       example: "Variables are containers for storing data values..."
 *                     order:
 *                       type: integer
 *                       example: 1
 *                     lessonId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.post("/lessons/:lessonId/topics", protect, authorize("STAFF", "ADMIN"), createTopic);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}/topics:
 *   get:
 *     summary: Get topics by lesson
 *     description: Retrieve all topics for a specific lesson
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
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
 *                       title:
 *                         type: string
 *                         example: "Introduction to Variables"
 *                       content:
 *                         type: string
 *                         example: "Variables are containers for storing data values..."
 *                       order:
 *                         type: integer
 *                         example: 1
 *                       lessonId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.get("/lessons/:lessonId/topics", protect, getTopicsByLesson);

/**
 * @swagger
 * /api/courses/topics/{topicId}:
 *   put:
 *     summary: Update a topic
 *     description: Update an existing topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Topic Title"
 *               content:
 *                 type: string
 *                 example: "Updated content..."
 *               order:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Topic updated successfully
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
 *                   example: "Topic updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Updated Topic Title"
 *                     content:
 *                       type: string
 *                       example: "Updated content..."
 *                     order:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Server error
 */
router.put("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), updateTopic);

/**
 * @swagger
 * /api/courses/topics/{topicId}:
 *   delete:
 *     summary: Delete a topic
 *     description: Delete an existing topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic deleted successfully
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
 *                   example: "Topic deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Server error
 */
router.delete("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), deleteTopic);

// ========== MATERIAL ROUTES ==========

/**
 * @swagger
 * /api/courses/lessons/{lessonId}/materials:
 *   post:
 *     summary: Upload material for a lesson
 *     description: Upload a file or material for a specific lesson
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               title:
 *                 type: string
 *                 example: "Lecture Notes - Week 1"
 *               description:
 *                 type: string
 *                 example: "Comprehensive notes covering the first week topics"
 *               type:
 *                 type: string
 *                 enum: [PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG, MP4, WEBM, OTHER]
 *                 example: "PDF"
 *     responses:
 *       201:
 *         description: Material uploaded successfully
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
 *                   example: "Material uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Lecture Notes - Week 1"
 *                     filename:
 *                       type: string
 *                       example: "lecture_week1.pdf"
 *                     originalName:
 *                       type: string
 *                       example: "Lecture Notes Week 1.pdf"
 *                     type:
 *                       type: string
 *                       example: "PDF"
 *                     size:
 *                       type: integer
 *                       example: 2048576
 *                     url:
 *                       type: string
 *                       example: "/uploads/materials/lecture_week1.pdf"
 *                     lessonId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request - Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Lesson not found
 *       413:
 *         description: File too large
 *       500:
 *         description: Server error
 */
router.post("/lessons/:lessonId/materials", protect, authorize("STAFF", "ADMIN"), uploadMaterial);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}/materials:
 *   get:
 *     summary: Get materials by lesson
 *     description: Retrieve all materials for a specific lesson
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                       title:
 *                         type: string
 *                         example: "Lecture Notes - Week 1"
 *                       filename:
 *                         type: string
 *                         example: "lecture_week1.pdf"
 *                       originalName:
 *                         type: string
 *                       type:
 *                         type: string
 *                         example: "PDF"
 *                       size:
 *                         type: integer
 *                         example: 2048576
 *                       url:
 *                         type: string
 *                         example: "/uploads/materials/lecture_week1.pdf"
 *                       lessonId:
 *                         type: integer
 *                         example: 1
 *                       uploadedBy:
 *                         type: integer
 *                         example: 2
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.get("/lessons/:lessonId/materials", protect, getMaterialsByLesson);

/**
 * @swagger
 * /api/courses/materials/{materialId}:
 *   delete:
 *     summary: Delete a material
 *     description: Delete an uploaded material file
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
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
 *                   example: "Material deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.delete("/materials/:materialId", protect, authorize("STAFF", "ADMIN"), deleteMaterial);

// ========== LESSON ROUTES ==========

/**
 * @swagger
 * /api/courses/courses/{courseId}/lessons:
 *   post:
 *     summary: Create a lesson for a course
 *     description: Create a new lesson under a specific course
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Programming"
 *               description:
 *                 type: string
 *                 example: "Basic concepts and fundamentals of programming"
 *               order:
 *                 type: integer
 *                 example: 1
 *               duration:
 *                 type: integer
 *                 example: 60
 *                 description: Duration in minutes
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                   example: "Lesson created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Introduction to Programming"
 *                     description:
 *                       type: string
 *                       example: "Basic concepts and fundamentals of programming"
 *                     order:
 *                       type: integer
 *                       example: 1
 *                     duration:
 *                       type: integer
 *                       example: 60
 *                     courseId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post("/courses/:courseId/lessons", protect, authorize("STAFF", "ADMIN"), createLesson);

/**
 * @swagger
 * /api/courses/courses/{courseId}/lessons:
 *   get:
 *     summary: Get lessons by course
 *     description: Retrieve all lessons for a specific course
 *     tags: [Lessons]
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
 *         description: Lessons retrieved successfully
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
 *                       title:
 *                         type: string
 *                         example: "Introduction to Programming"
 *                       description:
 *                         type: string
 *                         example: "Basic concepts and fundamentals of programming"
 *                       order:
 *                         type: integer
 *                         example: 1
 *                       duration:
 *                         type: integer
 *                         example: 60
 *                       courseId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/courses/:courseId/lessons", protect, getLessonsByCourse);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson by ID
 *     description: Retrieve detailed information about a specific lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
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
 *                     title:
 *                       type: string
 *                       example: "Introduction to Programming"
 *                     description:
 *                       type: string
 *                       example: "Basic concepts and fundamentals of programming"
 *                     order:
 *                       type: integer
 *                       example: 1
 *                     duration:
 *                       type: integer
 *                       example: 60
 *                     courseId:
 *                       type: integer
 *                       example: 1
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
 *                           example: "Introduction to Computer Science"
 *                     topics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Variables and Data Types"
 *                           content:
 *                             type: string
 *                             example: "Understanding variables..."
 *                           order:
 *                             type: integer
 *                             example: 1
 *                     materials:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Lecture Slides"
 *                           filename:
 *                             type: string
 *                             example: "lecture1.pdf"
 *                           type:
 *                             type: string
 *                             example: "PDF"
 *                           url:
 *                             type: string
 *                             example: "/uploads/materials/lecture1.pdf"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.get("/lessons/:lessonId", protect, getLessonById);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}:
 *   put:
 *     summary: Update a lesson
 *     description: Update an existing lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Lesson Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               order:
 *                 type: integer
 *                 example: 2
 *               duration:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                   example: "Lesson updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Updated Lesson Title"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     order:
 *                       type: integer
 *                       example: 2
 *                     duration:
 *                       type: integer
 *                       example: 90
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.put("/lessons/:lessonId", protect, authorize("STAFF", "ADMIN"), updateLesson);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson
 *     description: Delete an existing lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
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
 *                   example: "Lesson deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.delete("/lessons/:lessonId", protect, authorize("STAFF", "ADMIN"), deleteLesson);

/**
 * @swagger
 * /api/courses/courses/{courseId}/lessons/reorder:
 *   put:
 *     summary: Reorder lessons in a course
 *     description: Update the order of lessons within a course
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *             required:
 *               - lessonOrder
 *             properties:
 *               lessonOrder:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 1, 2, 4]
 *                 description: Array of lesson IDs in the desired order
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
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
 *                   example: "Lessons reordered successfully"
 *       400:
 *         description: Bad request - Invalid lesson order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin access required
 *       404:
 *         description: Course or lesson not found
 *       500:
 *         description: Server error
 */
router.put("/courses/:courseId/lessons/reorder", protect, authorize("STAFF", "ADMIN"), reorderLessons);

router.put("/courses/:courseId/lessons/reorder", protect, authorize("STAFF", "ADMIN"), reorderLessons);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /api/courses/admin/courses:
 *   get:
 *     summary: Get all courses (Admin)
 *     description: Retrieve all courses with optional filtering and pagination
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 8
 *         description: Filter by semester
 *       - in: query
 *         name: batch
 *         schema:
 *           type: string
 *         description: Filter by batch
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by course code or name
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
 *                         example: "Fundamental concepts of computer science"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       semester:
 *                         type: integer
 *                         example: 1
 *                       credits:
 *                         type: integer
 *                         example: 3
 *                       batch:
 *                         type: string
 *                         example: "2023-2027"
 *                       teacherId:
 *                         type: integer
 *                         example: 2
 *                       teacher:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "Dr. John Smith"
 *                           email:
 *                             type: string
 *                             example: "john.smith@university.edu"
 *                       enrollmentCount:
 *                         type: integer
 *                         example: 45
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
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
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
router.get("/admin/courses", protect, authorize("ADMIN"), getCourses);

/**
 * @swagger
 * /api/courses/admin/courses/trash:
 *   get:
 *     summary: Get trashed courses (Admin)
 *     description: Retrieve all soft-deleted courses
 *     tags: [Courses]
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
 *                         example: 1
 *                       code:
 *                         type: string
 *                         example: "CS101"
 *                       name:
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       semester:
 *                         type: integer
 *                         example: 1
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
router.get("/admin/courses/trash", protect, authorize("ADMIN"), getTrashedCourses);

/**
 * @swagger
 * /api/courses/admin/courses:
 *   post:
 *     summary: Create a new course (Admin)
 *     description: Create a new course with teacher assignment
 *     tags: [Courses]
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
 *               - credits
 *               - batch
 *               - teacherId
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CS101"
 *                 description: Unique course code
 *               name:
 *                 type: string
 *                 example: "Introduction to Computer Science"
 *               description:
 *                 type: string
 *                 example: "Fundamental concepts of computer science"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 1
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 example: 3
 *               batch:
 *                 type: string
 *                 example: "2023-2027"
 *               teacherId:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the teacher assigned to this course
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
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     semester:
 *                       type: integer
 *                       example: 1
 *                     credits:
 *                       type: integer
 *                       example: 3
 *                     batch:
 *                       type: string
 *                       example: "2023-2027"
 *                     teacherId:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - Validation error or duplicate course code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 */
router.post("/admin/courses", protect, authorize("ADMIN"), createCourse);

/**
 * @swagger
 * /api/courses/admin/courses/{id}:
 *   get:
 *     summary: Get course by ID (Admin)
 *     description: Retrieve detailed information about a specific course
 *     tags: [Courses]
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
 *                         type: string
 *                         example: "CS101"
 *                     name:
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *                     description:
 *                         type: string
 *                         example: "Fundamental concepts of computer science"
 *                     department:
 *                         type: string
 *                         example: "Computer Science"
 *                     semester:
 *                         type: integer
 *                         example: 1
 *                     credits:
 *                         type: integer
 *                         example: 3
 *                     batch:
 *                         type: string
 *                         example: "2023-2027"
 *                     teacherId:
 *                         type: integer
 *                         example: 2
 *                     teacher:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "Dr. John Smith"
 *                           email:
 *                             type: string
 *                             example: "john.smith@university.edu"
 *                           department:
 *                             type: string
 *                             example: "Computer Science"
 *                     enrolledStudents:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Alice Johnson"
 *                             email:
 *                               type: string
 *                               example: "alice.johnson@student.edu"
 *                             rollNumber:
 *                               type: string
 *                               example: "CS2023001"
 *                     lessons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             title:
 *                               type: string
 *                               example: "Introduction to Programming"
 *                             order:
 *                               type: integer
 *                               example: 1
 *                             duration:
 *                               type: integer
 *                               example: 60
 *                     createdAt:
 *                         type: string
 *                         format: date-time
 *                     updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/admin/courses/:id", protect, authorize("ADMIN"), getCourseById);

/**
 * @swagger
 * /api/courses/admin/courses/{id}:
 *   put:
 *     summary: Update a course (Admin)
 *     description: Update an existing course
 *     tags: [Courses]
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
 *               code:
 *                 type: string
 *                 example: "CS102"
 *               name:
 *                 type: string
 *                 example: "Updated Course Name"
 *               description:
 *                 type: string
 *                 example: "Updated course description"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 2
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 example: 4
 *               batch:
 *                 type: string
 *                 example: "2023-2027"
 *               teacherId:
 *                 type: integer
 *                 example: 3
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
 *                       example: "CS102"
 *                     name:
 *                       type: string
 *                       example: "Updated Course Name"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     semester:
 *                       type: integer
 *                       example: 2
 *                     credits:
 *                       type: integer
 *                       example: 4
 *                     batch:
 *                       type: string
 *                       example: "2023-2027"
 *                     teacherId:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad request - Validation error or duplicate course code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course or teacher not found
 *       500:
 *         description: Server error
 */
router.put("/admin/courses/:id", protect, authorize("ADMIN"), updateCourse);

/**
 * @swagger
 * /api/courses/admin/courses/{id}:
 *   delete:
 *     summary: Delete a course (Admin)
 *     description: Soft delete a course (move to trash)
 *     tags: [Courses]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       409:
 *         description: Conflict - Course has enrolled students
 *       500:
 *         description: Server error
 */
router.delete("/admin/courses/:id", protect, authorize("ADMIN"), deleteCourse);

/**
 * @swagger
 * /api/courses/admin/courses/{id}/restore:
 *   post:
 *     summary: Restore a trashed course (Admin)
 *     description: Restore a soft-deleted course
 *     tags: [Courses]
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
router.post("/admin/courses/:id/restore", protect, authorize("ADMIN"), restoreCourse);

/**
 * @swagger
 * /api/courses/admin/courses/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a course (Admin)
 *     description: Permanently delete a trashed course and all its associated data
 *     tags: [Courses]
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
 *         description: Course permanently deleted successfully
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
 *                   example: "Course permanently deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete("/admin/courses/:id/permanent", protect, authorize("ADMIN"), permanentDeleteCourse);

/**
 * @swagger
 * /api/courses/admin/courses/{courseId}/students:
 *   post:
 *     summary: Enroll student in course (Admin)
 *     description: Enroll a student in a specific course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the student to enroll
 *     responses:
 *       200:
 *         description: Student enrolled successfully
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
 *                   example: "Student enrolled successfully"
 *       400:
 *         description: Bad request - Student already enrolled or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course or student not found
 *       500:
 *         description: Server error
 */
router.post("/admin/courses/:courseId/students", protect, authorize("ADMIN"), enrollStudent);

/**
 * @swagger
 * /api/courses/admin/courses/{courseId}/students/{studentId}:
 *   delete:
 *     summary: Remove student from course (Admin)
 *     description: Remove a student from a specific course
 *     tags: [Courses]
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
 *     responses:
 *       200:
 *         description: Student removed successfully
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
 *                   example: "Student removed from course successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course or student not found, or student not enrolled in course
 *       500:
 *         description: Server error
 */
router.delete("/admin/courses/:courseId/students/:studentId", protect, authorize("ADMIN"), removeStudent);

router.delete("/admin/courses/:courseId/students/:studentId", protect, authorize("ADMIN"), removeStudent);

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/courses/courses:
 *   get:
 *     summary: Get all courses (Public)
 *     description: Retrieve all courses accessible to authenticated users
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 8
 *         description: Filter by semester
 *       - in: query
 *         name: batch
 *         schema:
 *           type: string
 *         description: Filter by batch
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
 *                         example: "Fundamental concepts of computer science"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       semester:
 *                         type: integer
 *                         example: 1
 *                       credits:
 *                         type: integer
 *                         example: 3
 *                       batch:
 *                         type: string
 *                         example: "2023-2027"
 *                       teacher:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "Dr. John Smith"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/courses", protect, getCourses);

/**
 * @swagger
 * /api/courses/courses/{id}:
 *   get:
 *     summary: Get course by ID (Public)
 *     description: Retrieve basic information about a specific course
 *     tags: [Courses]
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
 *                       example: "Fundamental concepts of computer science"
 *                     department:
 *                       type: string
 *                       example: "Computer Science"
 *                     semester:
 *                       type: integer
 *                       example: 1
 *                     credits:
 *                       type: integer
 *                       example: 3
 *                     batch:
 *                       type: string
 *                       example: "2023-2027"
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         name:
 *                           type: string
 *                           example: "Dr. John Smith"
 *                         email:
 *                           type: string
 *                           example: "john.smith@university.edu"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/courses/:id", protect, getCourseById);

/**
 * @swagger
 * /api/courses/batches/available:
 *   get:
 *     summary: Get available batches
 *     description: Retrieve all available batch years for course filtering
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available batches retrieved successfully
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
 *                     type: string
 *                   example: ["2023-2027", "2024-2028", "2025-2029"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/batches/available", protect, getAvailableBatches);

// ========== TEACHER ROUTES ==========

/**
 * @swagger
 * /api/courses/staff/my-courses:
 *   get:
 *     summary: Get teacher's courses
 *     description: Retrieve all courses assigned to the authenticated teacher
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher's courses retrieved successfully
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
 *                         example: "Fundamental concepts of computer science"
 *                       department:
 *                         type: string
 *                         example: "Computer Science"
 *                       semester:
 *                         type: integer
 *                         example: 1
 *                       credits:
 *                         type: integer
 *                         example: 3
 *                       batch:
 *                         type: string
 *                         example: "2023-2027"
 *                       enrollmentCount:
 *                         type: integer
 *                         example: 45
 *                       lessonsCount:
 *                         type: integer
 *                         example: 12
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       500:
 *         description: Server error
 */
router.get("/staff/my-courses", protect, authorize("STAFF"), getCoursesByTeacher);

/**
 * @swagger
 * /api/courses/staff/{courseId}:
 *   get:
 *     summary: Get teacher's course details
 *     description: Retrieve detailed information about a specific course assigned to the teacher
 *     tags: [Courses]
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                         type: string
 *                         example: "CS101"
 *                     name:
 *                         type: string
 *                         example: "Introduction to Computer Science"
 *                     description:
 *                         type: string
 *                         example: "Fundamental concepts of computer science"
 *                     department:
 *                         type: string
 *                         example: "Computer Science"
 *                     semester:
 *                         type: integer
 *                         example: 1
 *                     credits:
 *                         type: integer
 *                         example: 3
 *                     batch:
 *                         type: string
 *                         example: "2023-2027"
 *                     enrolledStudents:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Alice Johnson"
 *                             email:
 *                               type: string
 *                               example: "alice.johnson@student.edu"
 *                             rollNumber:
 *                               type: string
 *                               example: "CS2023001"
 *                     lessons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             title:
 *                               type: string
 *                               example: "Introduction to Programming"
 *                             description:
 *                               type: string
 *                               example: "Basic concepts and fundamentals of programming"
 *                             order:
 *                               type: integer
 *                               example: 1
 *                             duration:
 *                               type: integer
 *                               example: 60
 *                             topicsCount:
 *                               type: integer
 *                               example: 5
 *                             materialsCount:
 *                               type: integer
 *                               example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required or course not assigned to teacher
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/staff/:courseId", protect, authorize("STAFF"), getTeacherCourseDetails);

export default router;