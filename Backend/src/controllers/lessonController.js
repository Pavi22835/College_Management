import prisma from "../prisma/client.js";

/* ========================================
   LESSON CONTROLLER
   ======================================== */

/* ===============================
   CREATE LESSON
================================ */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, content, videoUrl, pdfUrl, order } = req.body;

    console.log("📝 Creating lesson for courseId:", courseId);
    console.log("📋 Lesson data:", { title, description, duration });

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required"
      });
    }

    // Validate and parse courseId
    const parsedCourseId = parseInt(courseId);
    if (isNaN(parsedCourseId)) {
      console.error("❌ Invalid courseId format:", courseId);
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format"
      });
    }

    // Check if course exists
    console.log("🔍 Looking for course with ID:", parsedCourseId);
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId }
    });

    if (!course) {
      console.error("❌ Course not found with ID:", parsedCourseId);
      return res.status(404).json({
        success: false,
        message: "Course not found",
        details: `Course with ID ${parsedCourseId} does not exist in database`
      });
    }

    console.log("✅ Course found:", course.name);

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        duration,
        content,
        videoUrl,
        pdfUrl,
        order: order || 0,
        courseId: parsedCourseId
      }
    });

    console.log("✅ Lesson created successfully:", lesson.id);

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson
    });

  } catch (error) {
    console.error("❌ Error creating lesson:", error.message);
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
      error: error.message
    });
  }
};

/* ===============================
   GET LESSONS BY COURSE
================================ */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Get lessons ordered by order field with materials
    const lessons = await prisma.lesson.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        materials: true
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: lessons
    });

  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: error.message
    });
  }
};

/* ===============================
   GET LESSON BY ID
================================ */
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    res.json({
      success: true,
      data: lesson
    });

  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson",
      error: error.message
    });
  }
};

/* ===============================
   UPDATE LESSON
================================ */
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, content, videoUrl, pdfUrl, order } = req.body;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson
    });

  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson",
      error: error.message
    });
  }
};

/* ===============================
   DELETE LESSON
================================ */
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // Delete lesson
    await prisma.lesson.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Lesson deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
      error: error.message
    });
  }
};

/* ===============================
   REORDER LESSONS
================================ */
export const reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(lessonOrders)) {
      return res.status(400).json({
        success: false,
        message: "lessonOrders must be an array"
      });
    }

    // Update order for each lesson
    const updatePromises = lessonOrders.map(({ id, order }) =>
      prisma.lesson.update({
        where: { id: parseInt(id) },
        data: { order: parseInt(order) }
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Lessons reordered successfully"
    });

  } catch (error) {
    console.error("Error reordering lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder lessons",
      error: error.message
    });
  }
};