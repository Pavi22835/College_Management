import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons
} from "../controllers/lessonController.js";

const router = express.Router();

// All lesson routes require authentication
router.use(protect);

// Admin and Staff can manage lessons
router.post("/courses/:courseId/lessons", authorize("ADMIN", "STAFF"), createLesson);
router.get("/courses/:courseId/lessons", authorize("ADMIN", "STAFF", "STUDENT"), getLessonsByCourse);
router.get("/lessons/:id", authorize("ADMIN", "STAFF", "STUDENT"), getLessonById);
router.put("/lessons/:id", authorize("ADMIN", "STAFF"), updateLesson);
router.delete("/lessons/:id", authorize("ADMIN", "STAFF"), deleteLesson);
router.put("/courses/:courseId/lessons/reorder", authorize("ADMIN", "STAFF"), reorderLessons);

export default router;