import prisma from "../prisma/client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads/materials");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   UPLOAD MATERIAL FILE
================================ */
export const uploadMaterial = async (req, res) => {
  try {
    console.log("📤 Material upload request received");
    console.log("   - User attached?", !!req.user);
    console.log("   - User ID:", req.user?.id);
    console.log("   - File attached?", !!req.file);
    console.log("   - Lesson ID:", req.params.lessonId);
    console.log("   - Topic ID:", req.params.topicId);

    if (!req.user) {
      console.log("❌ No user attached to request - middleware may have failed");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user found"
      });
    }

    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { lessonId, topicId } = req.params;
    const file = req.file;

    // Check if we have either lessonId or topicId
    if (!lessonId && !topicId) {
      console.log("❌ Neither lessonId nor topicId provided");
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Either lessonId or topicId must be provided"
      });
    }

    let lesson, topic, courseId;

    if (topicId) {
      // Upload to topic
      topic = await prisma.topic.findUnique({
        where: { id: parseInt(topicId) },
        include: { lesson: true }
      });

      if (!topic) {
        console.log("❌ Topic not found:", topicId);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Topic not found"
        });
      }

      lesson = topic.lesson;
      courseId = lesson.courseId;
    } else {
      // Upload to lesson
      lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) }
      });

      if (!lesson) {
        console.log("❌ Lesson not found:", lessonId);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Lesson not found"
        });
      }

      courseId = lesson.courseId;
    }

    console.log("✅ Target found, creating material record");

    // Determine file type
    let fileType = "document";
    const mimeType = file.mimetype.toLowerCase();

    if (mimeType.includes("pdf")) {
      fileType = "pdf";
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      fileType = "word";
    } else if (mimeType.includes("video")) {
      fileType = "video";
    } else if (mimeType.includes("image")) {
      fileType = "image";
    }

    // Create material record
    const material = await prisma.material.create({
      data: {
        title: file.originalname,
        description: `Uploaded file: ${file.originalname}`,
        fileName: file.filename,
        filePath: `/uploads/materials/${file.filename}`,
        fileSize: Math.round(file.size / 1024), // Size in KB
        fileType: mimeType,
        uploadedBy: req.user.id,
        lessonId: lesson.id,
        topicId: topicId ? parseInt(topicId) : null,
        courseId: courseId
      }
    });

    res.status(201).json({
      success: true,
      message: "Material uploaded successfully",
      data: {
        id: material.id,
        title: material.title,
        type: fileType,
        url: material.filePath,
        size: material.fileSize,
        uploadedAt: material.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Error uploading material:", error.message);
    console.error("Error details:", error);
    
    // Delete the uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload material",
      error: error.message
    });
  }
};

/* ===============================
   GET MATERIALS BY LESSON
================================ */
export const getMaterialsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const materials = await prisma.material.findMany({
      where: {
        lessonId: parseInt(lessonId),
        topicId: null // Only get materials directly attached to lesson (not topics)
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`📦 Found ${materials.length} materials for lesson ${lessonId}`);
    materials.forEach(m => {
      console.log(`   - ${m.fileName} at ${m.filePath}`);
    });

    // Format materials for frontend
    const formattedMaterials = materials.map(material => ({
      id: material.id,
      title: material.title,
      fileName: material.fileName,
      filePath: material.filePath,
      url: material.filePath, // Add 'url' field as alias for filePath
      fileUrl: material.filePath, // Add 'fileUrl' field as alias
      fileSize: material.fileSize,
      type: material.fileType,
      fileType: material.fileType,
      uploadedBy: material.uploadedBy,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    }));

    res.json({
      success: true,
      data: formattedMaterials
    });

  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message
    });
  }
};

/* ===============================
   GET MATERIALS BY TOPIC
================================ */
export const getMaterialsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const materials = await prisma.material.findMany({
      where: {
        topicId: parseInt(topicId)
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`📦 Found ${materials.length} materials for topic ${topicId}`);
    materials.forEach(m => {
      console.log(`   - ${m.fileName} at ${m.filePath}`);
    });

    // Format materials for frontend
    const formattedMaterials = materials.map(material => ({
      id: material.id,
      title: material.title,
      fileName: material.fileName,
      filePath: material.filePath,
      url: material.filePath, // Add 'url' field as alias for filePath
      fileUrl: material.filePath, // Add 'fileUrl' field as alias
      fileSize: material.fileSize,
      type: material.fileType,
      fileType: material.fileType,
      uploadedBy: material.uploadedBy,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    }));

    res.json({
      success: true,
      data: formattedMaterials
    });

  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message
    });
  }
};

/* ===============================
   DELETE MATERIAL
================================ */
export const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: parseInt(materialId) }
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "../../uploads/materials", material.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.material.delete({
      where: { id: parseInt(materialId) }
    });

    res.json({
      success: true,
      message: "Material deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message
    });
  }
};
