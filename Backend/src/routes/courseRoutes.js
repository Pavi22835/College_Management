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
router.post("/lessons/:lessonId/topics", protect, authorize("STAFF", "ADMIN"), createTopic);
router.get("/lessons/:lessonId/topics", protect, getTopicsByLesson);
router.put("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), updateTopic);
router.delete("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), deleteTopic);

// ========== MATERIAL ROUTES ==========
router.post("/lessons/:lessonId/materials", protect, authorize("STAFF", "ADMIN"), uploadMaterial);
router.get("/lessons/:lessonId/materials", protect, getMaterialsByLesson);
router.delete("/materials/:materialId", protect, authorize("STAFF", "ADMIN"), deleteMaterial);

// ========== LESSON ROUTES ==========
router.post("/courses/:courseId/lessons", protect, authorize("STAFF", "ADMIN"), createLesson);
router.get("/courses/:courseId/lessons", protect, getLessonsByCourse);
router.get("/lessons/:lessonId", protect, getLessonById);
router.put("/lessons/:lessonId", protect, authorize("STAFF", "ADMIN"), updateLesson);
router.delete("/lessons/:lessonId", protect, authorize("STAFF", "ADMIN"), deleteLesson);
router.put("/courses/:courseId/lessons/reorder", protect, authorize("STAFF", "ADMIN"), reorderLessons);

// ========== ADMIN ROUTES ==========
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

// ========== PUBLIC ROUTES ==========
router.get("/courses", protect, getCourses);
router.get("/courses/:id", protect, getCourseById);
router.get("/batches/available", protect, getAvailableBatches);

// ========== TEACHER ROUTES ==========
router.get("/staff/my-courses", protect, authorize("STAFF"), getCoursesByTeacher);
router.get("/staff/:courseId", protect, authorize("STAFF"), getTeacherCourseDetails);

export default router;