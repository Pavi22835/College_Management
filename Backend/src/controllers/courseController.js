import prisma from "../prisma/client.js";

/* ========================================
   ADMIN METHODS (EXISTING - MODIFIED)
   ======================================== */

/* ===============================
   GET ALL COURSES (ADMIN)
================================ */
export const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
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

    if (!course || course.deletedAt) {
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
    const {
      code,
      name,
      description,
      credits,
      department,
      semester,
      schedule,
      room,
      teacherId
    } = req.body;

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

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        credits: Number(credits),
        department,
        semester: Number(semester),
        schedule,
        room,
        teacherId: teacherId ? Number(teacherId) : null
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
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
      message: "Failed to create course"
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
      status
    } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCourse || existingCourse.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
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

    const updatedCourse = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        description,
        credits: credits ? Number(credits) : undefined,
        department,
        semester: semester ? Number(semester) : undefined,
        schedule,
        room,
        teacherId: teacherId ? Number(teacherId) : null,
        status
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
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

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course"
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
    const teacherId = req.user.id; // From auth middleware

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId }
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
    const teacherId = req.user.id;
    const { courseId } = req.params;

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: Number(courseId),
        teacherId: teacher.id,
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
        attendancePercentage,
        lastAttendance: attendances[0]?.date || null,
        attendances: attendances.slice(0, 5) // Last 5 attendance records
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

/* ========================================
   COURSE ENROLLMENT METHODS
   ======================================== */

/* ===============================
   ENROLL STUDENT IN COURSE (ADMIN)
================================ */
export const enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId)
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Student already enrolled in this course"
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        status: "ACTIVE"
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
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: enrollment,
      message: "Student enrolled successfully"
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
   TRASH METHODS
   ======================================== */

/* ===============================
   GET TRASHED COURSES (ADMIN)
================================ */
export const getTrashedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        deletedAt: { not: null }
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
   RESTORE COURSE FROM TRASH (ADMIN)
================================ */
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: { deletedAt: null }
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
      message: "Course permanently deleted"
    });

  } catch (error) {
    console.error("Permanent delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete course"
    });
  }
};