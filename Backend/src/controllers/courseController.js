import prisma from "../prisma/client.js";

/* ========================================
   COURSE MANAGEMENT
   ======================================== */

// Get all courses with filters
export const getCourses = async (req, res) => {
  try {
    const { includeTrashed, batch, department, semester, status } = req.query;
    
    let whereClause = {};
    
    if (includeTrashed !== 'true') {
      whereClause.deletedAt = null;
    }
    
    if (batch) whereClause.batch = batch;
    if (department) whereClause.department = department;
    if (semester) whereClause.semester = parseInt(semester);
    if (status) whereClause.status = status;
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        enrollments: {
          where: { status: "ACTIVE" },
          select: { studentId: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    const coursesWithCount = courses.map(course => ({
      ...course,
      studentsCount: course.enrollments.length,
      enrollments: undefined
    }));
    
    res.json({
      success: true,
      data: coursesWithCount
    });
  } catch (error) {
    console.error("Error in getCourses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        lessons: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" }
            },
            materials: true
          }
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error("Error in getCourseById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course"
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      credits,
      department,
      semester,
      teacherId,
      schedule,
      room,
      batch
    } = req.body;
    
    if (!code || !name || !department || !credits) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, name, department, credits"
      });
    }
    
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists`
      });
    }
    
    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        credits: parseInt(credits),
        department,
        semester: semester ? parseInt(semester) : null,
        teacherId: teacherId ? parseInt(teacherId) : null,
        schedule,
        room,
        batch: batch || null,
        status: "ACTIVE"
      }
    });
    
    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully"
    });
  } catch (error) {
    console.error("Error in createCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course"
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        code: updateData.code,
        name: updateData.name,
        description: updateData.description,
        credits: updateData.credits ? parseInt(updateData.credits) : undefined,
        department: updateData.department,
        semester: updateData.semester ? parseInt(updateData.semester) : undefined,
        teacherId: updateData.teacherId ? parseInt(updateData.teacherId) : null,
        schedule: updateData.schedule,
        room: updateData.room,
        batch: updateData.batch,
        status: updateData.status
      }
    });
    
    res.json({
      success: true,
      data: course,
      message: "Course updated successfully"
    });
  } catch (error) {
    console.error("Error in updateCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course"
    });
  }
};

// Soft delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    
    res.json({
      success: true,
      message: "Course moved to trash successfully"
    });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course"
    });
  }
};

// Get trashed courses
export const getTrashedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { deletedAt: { not: null } },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { deletedAt: "desc" }
    });
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error("Error in getTrashedCourses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trashed courses"
    });
  }
};

// Restore course from trash
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null }
    });
    
    res.json({
      success: true,
      message: "Course restored successfully"
    });
  } catch (error) {
    console.error("Error in restoreCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore course"
    });
  }
};

// Permanently delete course
export const permanentDeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: "Course permanently deleted"
    });
  } catch (error) {
    console.error("Error in permanentDeleteCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete course"
    });
  }
};

/* ========================================
   TEACHER COURSE METHODS
   ======================================== */

export const getCoursesByTeacher = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const teacher = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" }
            }
          }
        },
        enrollments: {
          select: { studentId: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    const coursesWithCount = courses.map(course => ({
      ...course,
      studentsCount: course.enrollments.length
    }));
    
    res.json({
      success: true,
      data: coursesWithCount
    });
  } catch (error) {
    console.error("Error in getCoursesByTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher courses"
    });
  }
};

export const getTeacherCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const teacher = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }
    
    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(courseId),
        teacherId: teacher.id,
        deletedAt: null
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" }
            },
            materials: true
          }
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied"
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error("Error in getTeacherCourseDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course details"
    });
  }
};

export const getAvailableBatches = async (req, res) => {
  try {
    const batches = await prisma.course.findMany({
      where: { deletedAt: null },
      select: { batch: true },
      distinct: ['batch']
    });
    
    const uniqueBatches = batches
      .map(b => b.batch)
      .filter(batch => batch && batch.trim().length > 0)
      .sort((a, b) => {
        const yearA = parseInt(a.split('-')[0]);
        const yearB = parseInt(b.split('-')[0]);
        return yearB - yearA;
      });
    
    res.json({
      success: true,
      data: uniqueBatches
    });
  } catch (error) {
    console.error("Error in getAvailableBatches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches"
    });
  }
};

/* ========================================
   ENROLLMENT METHODS
   ======================================== */

export const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required"
      });
    }
    
    const results = [];
    for (const studentId of studentIds) {
      try {
        const enrollment = await prisma.enrollment.upsert({
          where: {
            studentId_courseId: {
              studentId: parseInt(studentId),
              courseId: parseInt(courseId)
            }
          },
          create: {
            studentId: parseInt(studentId),
            courseId: parseInt(courseId),
            status: "ACTIVE"
          },
          update: {
            status: "ACTIVE"
          }
        });
        results.push({ success: true, studentId, enrollment });
      } catch (err) {
        results.push({ success: false, studentId, error: err.message });
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Processed ${results.length} students`
    });
  } catch (error) {
    console.error("Error in enrollStudent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enroll students"
    });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId)
        }
      }
    });
    
    res.json({
      success: true,
      message: "Student removed from course successfully"
    });
  } catch (error) {
    console.error("Error in removeStudent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove student from course"
    });
  }
};

/* ========================================
   LESSON METHODS
   ======================================== */

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, content, videoUrl, pdfUrl, order } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required"
      });
    }
    
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    const maxOrder = await prisma.lesson.aggregate({
      where: { courseId: parseInt(courseId) },
      _max: { order: true }
    });
    
    const newOrder = order !== undefined ? order : (maxOrder._max.order ?? -1) + 1;
    
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        duration: duration || null,
        content: content || null,
        videoUrl: videoUrl || null,
        pdfUrl: pdfUrl || null,
        order: newOrder,
        courseId: parseInt(courseId)
      }
    });
    
    res.status(201).json({
      success: true,
      data: lesson,
      message: "Lesson created successfully"
    });
  } catch (error) {
    console.error("Error in createLesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson"
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const lessons = await prisma.lesson.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        topics: {
          orderBy: { order: "asc" }
        },
        materials: true
      },
      orderBy: { order: "asc" }
    });
    
    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error("Error in getLessonsByCourse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons"
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      include: {
        topics: {
          orderBy: { order: "asc" }
        },
        materials: true
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
    console.error("Error in getLessonById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson"
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, duration, content, videoUrl, pdfUrl, order } = req.body;
    
    const lesson = await prisma.lesson.update({
      where: { id: parseInt(lessonId) },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        duration: duration !== undefined ? duration : undefined,
        content: content !== undefined ? content : undefined,
        videoUrl: videoUrl !== undefined ? videoUrl : undefined,
        pdfUrl: pdfUrl !== undefined ? pdfUrl : undefined,
        order: order !== undefined ? order : undefined
      }
    });
    
    res.json({
      success: true,
      data: lesson,
      message: "Lesson updated successfully"
    });
  } catch (error) {
    console.error("Error in updateLesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson"
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    await prisma.lesson.delete({
      where: { id: parseInt(lessonId) }
    });
    
    res.json({
      success: true,
      message: "Lesson deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteLesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson"
    });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonOrders } = req.body;
    
    if (!lessonOrders || !Array.isArray(lessonOrders)) {
      return res.status(400).json({
        success: false,
        message: "Lesson orders array is required"
      });
    }
    
    for (const item of lessonOrders) {
      await prisma.lesson.update({
        where: { id: item.id },
        data: { order: item.order }
      });
    }
    
    res.json({
      success: true,
      message: "Lessons reordered successfully"
    });
  } catch (error) {
    console.error("Error in reorderLessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder lessons"
    });
  }
};

/* ========================================
   MATERIAL METHODS
   ======================================== */

export const uploadMaterial = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }
    
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) }
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }
    
    const material = await prisma.material.create({
      data: {
        title: title || file.originalname,
        description: description || null,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedBy: req.user.id,
        lessonId: parseInt(lessonId),
        courseId: lesson.courseId
      }
    });
    
    res.status(201).json({
      success: true,
      data: material,
      message: "Material uploaded successfully"
    });
  } catch (error) {
    console.error("Error in uploadMaterial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload material"
    });
  }
};

export const getMaterialsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const materials = await prisma.material.findMany({
      where: { lessonId: parseInt(lessonId) },
      orderBy: { createdAt: "desc" }
    });
    
    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error("Error in getMaterialsByLesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials"
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    
    await prisma.material.delete({
      where: { id: parseInt(materialId) }
    });
    
    res.json({
      success: true,
      message: "Material deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteMaterial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete material"
    });
  }
};