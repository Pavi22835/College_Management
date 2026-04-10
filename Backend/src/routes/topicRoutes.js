import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createTopic,
  getTopicsByLesson,
  updateTopic,
  deleteTopic
} from "../controllers/topicController.js";

const router = express.Router();

router.post("/lessons/:lessonId/topics", protect, authorize("STAFF", "ADMIN"), createTopic);
router.get("/lessons/:lessonId/topics", protect, getTopicsByLesson);
router.put("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), updateTopic);
router.delete("/topics/:topicId", protect, authorize("STAFF", "ADMIN"), deleteTopic);

export default router;