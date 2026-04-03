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

    const { lessonId } = req.params;
    const file = req.file;

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) }
    });

    if (!lesson) {
      console.log("❌ Lesson not found:", lessonId);
      // Delete the uploaded file if lesson doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    console.log("✅ Lesson found, creating material record");

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
        lessonId: parseInt(lessonId),
        courseId: lesson.courseId
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
        // Material should relate to lesson through course
        // For now, we filter by any materials (you may need to adjust based on your schema)
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      success: true,
      data: materials
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
