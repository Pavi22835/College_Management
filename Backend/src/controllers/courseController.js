import prisma from "../prisma/client.js";

/* ========================================
   ADMIN METHODS
   ======================================== */

/* ===============================
   GET ALL COURSES (ADMIN)
================================ */
export const getCourses = async (req, res) => {
  try {
    const { includeTrashed, batch, department, semester, status } = req.query;
    
    let whereCondition = {};
    
    // If includeTrashed is false or not provided, exclude deleted courses
    if (includeTrashed !== 'true') {
      whereCondition = { deletedAt: null };
    }
    
    // Apply filters
    if (batch) {
      whereCondition.batch = batch;
    }
    if (department) {
      whereCondition.department = department;
    }
    if (semester) {
      whereCondition.semester = Number(semester);
    }
    if (status) {
      whereCondition.status = status.toUpperCase();
    }
    
    const courses = await prisma.course.findMany({
      where: whereCondition,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true
          }
        },
        enrollments: {
          where: {
            student: {
              deletedAt: null
            }
          },
          select: {
            id: true,
            studentId: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Add student count to each course
    const coursesWithCount = courses.map(course => ({
      ...course,
      studentsCount: course.enrollments.length
    }));

    res.json({
      success: true,
      data: coursesWithCount
    });

  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load courses"
    });
  }
};

/* ===============================
   GET TRASHED COURSES (ADMIN)
================================ */
export const getTrashedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        deletedAt: { not: null }
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
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
    console.error("Get trashed courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trashed courses"
    });
  }
};

/* ===============================
   GET COURSE BY ID
================================ */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true
          }
        },
        enrollments: {
          where: {
            student: {
              deletedAt: null
            }
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
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
      data: {
        ...course,
        studentsCount: course.enrollments.length
      }
    });

  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course"
    });
  }
};

/* ===============================
   CREATE COURSE (ADMIN)
================================ */
export const createCourse = async (req, res) => {
  try {
    console.log("📥 Received course data:", JSON.stringify(req.body, null, 2));
    
    const {
      code,
      name,
      description,
      credits,
      department,
      semester,
      schedule,
      room,
      teacherId,
      batch
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!code) missingFields.push('code');
    if (!name) missingFields.push('name');
    if (!department) missingFields.push('department');
    if (!credits) missingFields.push('credits');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this code already exists"
      });
    }

    // Check if teacher exists if teacherId is provided
    let parsedTeacherId = null;
    if (teacherId) {
      parsedTeacherId = Number(teacherId);
      const teacher = await prisma.staff.findUnique({
        where: { id: parsedTeacherId }
      });
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Selected teacher does not exist"
        });
      }
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: description || null,
        credits: Number(credits),
        department,
        semester: semester ? Number(semester) : null,
        schedule: schedule || null,
        room: room || null,
        teacherId: parsedTeacherId,
        status: "ACTIVE",
        batch: batch || null
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully"
    });

  } catch (error) {
    console.error("Create course error:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Course with this code already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create course: " + error.message
    });
  }
};

/* ===============================
   UPDATE COURSE (ADMIN)
================================ */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      credits,
      department,
      semester,
      schedule,
      room,
      teacherId,
      status,
      batch
    } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if course is in trash
    if (existingCourse.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Cannot update course that is in trash. Please restore first."
      });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingCourse.code) {
      const codeExists = await prisma.course.findUnique({
        where: { code }
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "Course with this code already exists"
        });
      }
    }

    // Check if teacher exists if teacherId is provided
    let parsedTeacherId = null;
    if (teacherId) {
      parsedTeacherId = Number(teacherId);
      const teacher = await prisma.staff.findUnique({
        where: { id: parsedTeacherId }
      });
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Selected teacher does not exist"
        });
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        code: code || existingCourse.code,
        name: name || existingCourse.name,
        description: description !== undefined ? description : existingCourse.description,
        credits: credits ? Number(credits) : existingCourse.credits,
        department: department || existingCourse.department,
        semester: semester ? Number(semester) : existingCourse.semester,
        schedule: schedule !== undefined ? schedule : existingCourse.schedule,
        room: room !== undefined ? room : existingCourse.room,
        teacherId: teacherId ? parsedTeacherId : existingCourse.teacherId,
        status: status || existingCourse.status,
        batch: batch !== undefined ? batch : existingCourse.batch
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedCourse,
      message: "Course updated successfully"
    });

  } catch (error) {
    console.error("Update course error:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Course with this code already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update course"
    });
  }
};

/* ===============================
   DELETE COURSE (SOFT DELETE) - ADMIN
================================ */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await prisma.course.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if already deleted
    if (existingCourse.deletedAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Course is already in trash" 
      });
    }

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: { 
        deletedAt: new Date(),
        deletedBy: req.user?.id || null
      }
    });

    res.json({
      success: true,
      data: course,
      message: "Course moved to trash successfully"
    });

  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course"
    });
  }
};

/* ===============================
   RESTORE COURSE FROM TRASH (ADMIN)
================================ */
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await prisma.course.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if not in trash
    if (!existingCourse.deletedAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Course is not in trash" 
      });
    }

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: { 
        deletedAt: null,
        deletedBy: null
      }
    });

    res.json({
      success: true,
      data: course,
      message: "Course restored successfully"
    });

  } catch (error) {
    console.error("Restore course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore course"
    });
  }
};

/* ===============================
   PERMANENTLY DELETE COURSE (ADMIN)
================================ */
export const permanentDeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await prisma.course.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const courseName = existingCourse.name;

    // First delete related enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: Number(id) }
    });

    // Then delete the course
    await prisma.course.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: `Course "${courseName}" permanently deleted`
    });

  } catch (error) {
    console.error("Permanent delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete course"
    });
  }
};

/* ===============================
   ENROLL STUDENT IN COURSE (ADMIN)
================================ */
export const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one student ID"
      });
    }

    const results = [];
    
    for (const studentId of studentIds) {
      try {
        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: Number(studentId),
              courseId: Number(courseId)
            }
          }
        });

        if (!existingEnrollment) {
          const enrollment = await prisma.enrollment.create({
            data: {
              studentId: Number(studentId),
              courseId: Number(courseId),
              status: "ACTIVE"
            }
          });
          results.push({ success: true, studentId, enrollment });
        } else {
          results.push({ success: false, studentId, message: "Already enrolled" });
        }
      } catch (err) {
        results.push({ success: false, studentId, error: err.message });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `${results.filter(r => r.success).length} students enrolled successfully`
    });

  } catch (error) {
    console.error("Enroll student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enroll student"
    });
  }
};

/* ===============================
   REMOVE STUDENT FROM COURSE (ADMIN)
================================ */
export const removeStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId)
        }
      }
    });

    res.json({
      success: true,
      message: "Student removed from course successfully"
    });

  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove student"
    });
  }
};

/* ========================================
   TEACHER-SPECIFIC COURSE METHODS
   ======================================== */

/* ===============================
   GET COURSES BY TEACHER ID
================================ */
export const getCoursesByTeacher = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get staff record
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    const courses = await prisma.course.findMany({
      where: {
        teacherId: staff.id,
        deletedAt: null
      },
      include: {
        enrollments: {
          where: {
            student: {
              deletedAt: null
            }
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { semester: "asc" },
        { name: "asc" }
      ]
    });

    // Format response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      credits: course.credits,
      department: course.department,
      semester: course.semester,
      schedule: course.schedule,
      room: course.room,
      batch: course.batch,
      status: course.status,
      studentsCount: course.enrollments.length,
      students: course.enrollments.map(e => ({
        id: e.student.id,
        name: e.student.name,
        email: e.student.email,
        rollNo: e.student.rollNo,
        phone: e.student.phone
      }))
    }));

    res.json({
      success: true,
      data: formattedCourses
    });

  } catch (error) {
    console.error("Get courses by teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher courses"
    });
  }
};

/* ===============================
   GET COURSE DETAILS FOR TEACHER
================================ */
export const getTeacherCourseDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Get staff record
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: Number(courseId),
        teacherId: staff.id,
        deletedAt: null
      },
      include: {
        enrollments: {
          where: {
            student: {
              deletedAt: null
            }
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                },
                attendances: {
                  where: {
                    courseId: Number(courseId)
                  },
                  orderBy: {
                    date: "desc"
                  },
                  take: 10
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

    // Calculate attendance statistics
    const studentsWithStats = course.enrollments.map(enrollment => {
      const attendances = enrollment.student.attendances || [];
      const totalClasses = attendances.length;
      const presentCount = attendances.filter(a => a.status === "PRESENT").length;
      const attendancePercentage = totalClasses > 0 
        ? Math.round((presentCount / totalClasses) * 100) 
        : 0;

      return {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        rollNo: enrollment.student.rollNo,
        phone: enrollment.student.phone,
        batch: enrollment.student.batch,
        attendancePercentage,
        lastAttendance: attendances[0]?.date || null,
        attendances: attendances.slice(0, 5)
      };
    });

    res.json({
      success: true,
      data: {
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
        credits: course.credits,
        department: course.department,
        semester: course.semester,
        schedule: course.schedule,
        room: course.room,
        batch: course.batch,
        studentsCount: studentsWithStats.length,
        students: studentsWithStats
      }
    });

  } catch (error) {
    console.error("Get teacher course details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course details"
    });
  }
};

/* ===============================
   GET COURSES BY BATCH (ADMIN/TEACHER)
================================ */
export const getCoursesByBatch = async (req, res) => {
  try {
    const { batch } = req.params;
    const { includeTrashed } = req.query;
    
    let whereCondition = { batch: batch };
    
    if (includeTrashed !== 'true') {
      whereCondition.deletedAt = null;
    }
    
    const courses = await prisma.course.findMany({
      where: whereCondition,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          where: {
            student: { deletedAt: null }
          },
          select: { studentId: true }
        }
      },
      orderBy: { name: "asc" }
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
    console.error("Get courses by batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses by batch"
    });
  }
};

/* ===============================
   GET AVAILABLE BATCHES (ADMIN/TEACHER)
================================ */
export const getAvailableBatches = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      select: { batch: true },
      distinct: ['batch']
    });
    
    const batches = courses.map(c => c.batch).filter(b => b);
    
    res.json({
      success: true,
      data: batches.sort()
    });

  } catch (error) {
    console.error("Get available batches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available batches"
    });
  }
};