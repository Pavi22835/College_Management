import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ========================================
   ADMIN METHODS
   ======================================== */

/*
---------------------------------------
GET ALL STUDENTS (ADMIN)
---------------------------------------
*/
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true
          }
        },
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
            course: {
              deletedAt: null
            }
          },
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                department: true
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    });

    const studentsWithCount = students.map(student => ({
      ...student,
      enrolledCoursesCount: student.enrollments.length,
      enrolledCourses: student.enrollments.map(e => e.course)
    }));

    res.json({
      success: true,
      data: studentsWithCount
    });

  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load students"
    });
  }
};

/*
---------------------------------------
GET STUDENT BY ID (ADMIN)
---------------------------------------
*/
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true,
            deactivatedAt: true,
            deactivatedReason: true,
            lastLogin: true
          }
        },
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
            course: {
              deletedAt: null
            }
          },
          include: {
            course: {
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
            }
          }
        },
        attendances: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          },
          orderBy: {
            date: "desc"
          },
          take: 20
        }
      }
    });

    if (!student || student.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const totalAttendances = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.status === "PRESENT").length;
    const absentCount = student.attendances.filter(a => a.status === "ABSENT").length;
    const lateCount = student.attendances.filter(a => a.status === "LATE").length;
    
    const attendancePercentage = totalAttendances > 0 
      ? Math.round((presentCount / totalAttendances) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        ...student,
        attendanceStats: {
          total: totalAttendances,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          percentage: attendancePercentage
        }
      }
    });

  } catch (error) {
    console.error("Get student by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student"
    });
  }
};

/*
---------------------------------------
CREATE STUDENT (ADMIN)
---------------------------------------
*/
export const createStudent = async (req, res) => {
  try {
    console.log("📥 Received student data:", JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      password,
      rollNo,
      age,
      gender,
      course,
      courseId,
      semester,
      batch,
      phone,
      address,
      dateOfBirth,
      guardianName,
      guardianPhone,
      teacherId,
      enrollmentNo,
      admissionYear,
      admissionType,
      fatherName,
      motherName,
      previousCollege,
      previousPercentage,
      section
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!rollNo) missingFields.push('rollNo');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Check if student with same rollNo exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll number already exists"
      });
    }

    // Check if enrollmentNo is unique if provided
    if (enrollmentNo) {
      const existingEnrollment = await prisma.student.findUnique({
        where: { enrollmentNo }
      });
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: "Student with this enrollment number already exists"
        });
      }
    }

    // Check if teacher exists if teacherId is provided
    let parsedTeacherId = null;
    if (teacherId) {
      parsedTeacherId = parseInt(teacherId);
      if (isNaN(parsedTeacherId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID format"
        });
      }

      const teacher = await prisma.staff.findUnique({
        where: { id: parsedTeacherId }
      });
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: `Teacher with ID ${teacherId} does not exist`
        });
      }
    }

    // Check if course exists if courseId is provided
    let courseRecord = null;
    let parsedCourseId = null;
    if (courseId) {
      parsedCourseId = parseInt(courseId);
      if (isNaN(parsedCourseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID format"
        });
      }

      courseRecord = await prisma.course.findUnique({
        where: { id: parsedCourseId }
      });
      if (!courseRecord) {
        return res.status(400).json({
          success: false,
          message: `Course with ID ${courseId} does not exist`
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password || "student123", 10);

    // Use transaction to create both user and student
    const result = await prisma.$transaction(async (prisma) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
          isActive: true,
          status: "active"
        }
      });

      console.log("✅ User created:", user.id);

      // Then create student linked to user
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          name,
          email,
          rollNo,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          course: courseRecord?.name || course || null,
          semester: semester ? parseInt(semester) : null,
          batch: batch || null,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          guardianPhone: guardianPhone || null,
          teacherId: parsedTeacherId,
          enrollmentNo: enrollmentNo || null,
          admissionYear: admissionYear || null,
          admissionType: admissionType || null,
          fatherName: fatherName || guardianName || null,
          motherName: motherName || null,
          previousCollege: previousCollege || null,
          previousPercentage: previousPercentage ? parseFloat(previousPercentage) : null,
          section: section || null
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true,
              status: true
            }
          },
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

      // Create enrollment record for the selected course if provided
      if (courseRecord) {
        try {
          await prisma.enrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: student.id,
                courseId: courseRecord.id
              }
            },
            create: {
              studentId: student.id,
              courseId: courseRecord.id
            },
            update: {}
          });
        } catch (err) {
          console.warn("⚠️ Failed to create enrollment record:", err.message);
        }
      }

      console.log("✅ Student created:", student.id);
      return student;
    });

    console.log("✅ Student created successfully:", result.id);
    res.status(201).json({
      success: true,
      data: result,
      message: "Student created successfully"
    });

  } catch (error) {
    console.error("❌ Create student error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `A student with this ${target} already exists`
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Foreign key constraint failed - teacher may not exist"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create student"
    });
  }
};

/*
---------------------------------------
UPDATE STUDENT (ADMIN)
---------------------------------------
*/
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("📥 Updating student:", id, "with data:", updateData);

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.attendances;
    delete updateData.enrollments;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Check if rollNo is being changed and already exists
    if (updateData.rollNo && updateData.rollNo !== existingStudent.rollNo) {
      const rollExists = await prisma.student.findUnique({
        where: { rollNo: updateData.rollNo }
      });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: "Roll number already in use"
        });
      }
    }

    // Check if teacher exists if teacherId is provided
    if (updateData.teacherId) {
      const teacher = await prisma.staff.findUnique({
        where: { id: parseInt(updateData.teacherId) }
      });
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Selected teacher does not exist"
        });
      }
    }

    // Check if course exists if courseId is provided
    let courseRecord = null;
    if (updateData.courseId) {
      const parsedCourseId = parseInt(updateData.courseId);
      if (isNaN(parsedCourseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID format"
        });
      }

      courseRecord = await prisma.course.findUnique({
        where: { id: parsedCourseId }
      });
      if (!courseRecord) {
        return res.status(400).json({
          success: false,
          message: "Selected course does not exist"
        });
      }
    }

    // Update student and user in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update student
      const student = await prisma.student.update({
        where: { id: Number(id) },
        data: {
          name: updateData.name,
          email: updateData.email,
          rollNo: updateData.rollNo,
          age: updateData.age ? parseInt(updateData.age) : null,
          gender: updateData.gender,
          course: courseRecord?.name || updateData.course,
          semester: updateData.semester ? parseInt(updateData.semester) : null,
          batch: updateData.batch,
          phone: updateData.phone,
          address: updateData.address,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
          guardianPhone: updateData.guardianPhone,
          teacherId: updateData.teacherId ? parseInt(updateData.teacherId) : null,
          enrollmentNo: updateData.enrollmentNo,
          admissionYear: updateData.admissionYear,
          admissionType: updateData.admissionType,
          fatherName: updateData.fatherName || updateData.guardianName,
          motherName: updateData.motherName,
          previousCollege: updateData.previousCollege,
          previousPercentage: updateData.previousPercentage ? parseFloat(updateData.previousPercentage) : null,
          section: updateData.section
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true,
              status: true
            }
          },
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

      // Create/ensure enrollment if courseId was provided
      if (courseRecord) {
        try {
          await prisma.enrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: student.id,
                courseId: courseRecord.id
              }
            },
            create: {
              studentId: student.id,
              courseId: courseRecord.id
            },
            update: {}
          });
        } catch (err) {
          console.warn("⚠️ Failed to create/update enrollment record:", err.message);
        }
      }

      // Update user name and email if changed
      if (updateData.name || updateData.email) {
        await prisma.user.update({
          where: { id: existingStudent.userId },
          data: {
            name: updateData.name,
            email: updateData.email
          }
        });
      }

      return student;
    });

    res.json({
      success: true,
      data: result,
      message: "Student updated successfully"
    });

  } catch (error) {
    console.error("❌ Update student error:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Email or roll number already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
};

/*
---------------------------------------
DELETE STUDENT (SOFT DELETE) - ADMIN - UPDATED WITH DEACTIVATION
---------------------------------------
*/
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Soft delete student and deactivate user
    await prisma.$transaction([
      prisma.student.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: student.userId },
        data: { 
          isActive: false,
          status: "deactivated",
          deactivatedAt: new Date(),
          deactivatedReason: "Student moved to trash",
          deactivatedBy: req.user.id
        }
      })
    ]);

    res.json({
      success: true,
      message: "Student moved to trash successfully"
    });

  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student"
    });
  }
};

/*
---------------------------------------
ACTIVATE STUDENT (ADMIN)
---------------------------------------
*/
export const activateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await prisma.user.update({
      where: { id: student.userId },
      data: {
        isActive: true,
        status: "active",
        deactivatedAt: null,
        deactivatedReason: null,
        activatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: "Student activated successfully"
    });

  } catch (error) {
    console.error("Activate student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate student"
    });
  }
};

/*
---------------------------------------
DEACTIVATE STUDENT (ADMIN)
---------------------------------------
*/
export const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await prisma.user.update({
      where: { id: student.userId },
      data: {
        isActive: false,
        status: "deactivated",
        deactivatedAt: new Date(),
        deactivatedReason: reason || "Deactivated by admin",
        deactivatedBy: req.user.id
      }
    });

    res.json({
      success: true,
      message: "Student deactivated successfully"
    });

  } catch (error) {
    console.error("Deactivate student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate student"
    });
  }
};

/* ========================================
   STUDENT DASHBOARD METHODS - WITH DEBUG LOGGING
   ======================================== */

/*
---------------------------------------
GET STUDENT DASHBOARD DATA - WITH DEBUG
---------------------------------------
*/
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("\n========== STUDENT DASHBOARD DEBUG ==========");
    console.log("1. User ID from token:", userId);
    console.log("2. Full user object:", req.user);

    // Get student details
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true
          }
        },
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

    console.log("3. Student found?", !!student);
    if (student) {
      console.log("4. Student ID:", student.id);
      console.log("5. Student name:", student.name);
      console.log("6. Student rollNo:", student.rollNo);
      console.log("7. Student course:", student.course);
      console.log("8. Student semester:", student.semester);
    } else {
      console.log("❌ Student not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: "ACTIVE",
        course: {
          deletedAt: null
        }
      },
      include: {
        course: {
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
        }
      },
      orderBy: {
        enrollmentDate: "desc"
      }
    });

    console.log(`9. Found ${enrollments.length} enrolled courses`);
    enrollments.forEach((e, i) => {
      console.log(`   Course ${i+1}: ${e.course.name} (${e.course.code}) - Teacher: ${e.course.teacher?.name || 'N/A'}`);
    });

    // Fallback: if no enrollments but student has a course name set, show it in dashboard
    if (enrollments.length === 0 && student.course) {
      console.log("⚠️ No enrollments found; using student.course as fallback");
      enrollments.push({
        course: {
          id: null,
          name: student.course,
          code: '',
          schedule: 'TBD',
          room: 'TBD',
          teacher: {
            name: student.teacher?.name || 'Not Assigned'
          }
        }
      });
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: student.id
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    console.log(`10. Found ${attendances.length} attendance records`);
    attendances.slice(0, 3).forEach((a, i) => {
      console.log(`    Attendance ${i+1}: ${a.course.name} - ${a.status} on ${a.date}`);
    });

    // Calculate attendance percentage
    const totalClasses = attendances.length;
    const presentCount = attendances.filter(a => a.status === "PRESENT").length;
    const attendancePercentage = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100) 
      : 0;

    console.log(`11. Attendance: ${presentCount}/${totalClasses} = ${attendancePercentage}%`);

    // Format courses with progress
    const courses = enrollments.map(enrollment => {
      const courseAttendances = attendances.filter(a => a.courseId === enrollment.courseId);
      const courseTotal = courseAttendances.length;
      const coursePresent = courseAttendances.filter(a => a.status === "PRESENT").length;
      const courseAttendance = courseTotal > 0 ? Math.round((coursePresent / courseTotal) * 100) : 0;

      return {
        id: enrollment.course.id,
        name: enrollment.course.name,
        code: enrollment.course.code,
        instructor: enrollment.course.teacher?.name || student.teacher?.name || "Not Assigned",
        progress: courseAttendance,
        attendance: courseAttendance,
        schedule: enrollment.course.schedule || "Schedule TBD",
        room: enrollment.course.room || "Room TBD",
        color: "#3b82f6"
      };
    });

    const responseData = {
      student: {
        name: student.name,
        rollNo: student.rollNo,
        course: student.course,
        semester: student.semester,
        email: student.email,
        phone: student.phone,
        teacher: student.teacher?.name || "Not Assigned"
      },
      stats: {
        enrolledCourses: enrollments.length,
        attendance: attendancePercentage,
        assignments: 0,
        cgpa: 0
      },
      courses: courses,
      recentAttendance: attendances.slice(0, 5).map(a => ({
        date: a.date,
        status: a.status,
        course: a.course
      }))
    };

    console.log("12. Sending response data:", JSON.stringify(responseData, null, 2));
    console.log("==========================================\n");

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("❌ Get student dashboard error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
};

/*
---------------------------------------
GET STUDENT COURSES
---------------------------------------
*/
export const getStudentCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: { teacher: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: "ACTIVE",
        course: {
          deletedAt: null
        }
      },
      include: {
        course: {
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
        }
      },
      orderBy: {
        enrollmentDate: "desc"
      }
    });

    // Fallback: if no enrollments but student has a course string, show it
    if (enrollments.length === 0 && student.course) {
      enrollments.push({
        course: {
          id: null,
          code: '',
          name: student.course,
          semester: student.semester,
          schedule: 'TBD',
          room: 'TBD',
          teacher: {
            name: student.teacher?.name || 'Not Assigned'
          }
        }
      });
    }

    // Get attendance for each course
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: student.id
      }
    });

    const courses = enrollments.map(enrollment => {
      const courseAttendances = attendances.filter(a => a.courseId === enrollment.courseId);
      const totalClasses = courseAttendances.length;
      const presentCount = courseAttendances.filter(a => a.status === "PRESENT").length;
      const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

      return {
        id: enrollment.course.id,
        code: enrollment.course.code,
        title: enrollment.course.name,
        instructor: enrollment.course.teacher?.name || student.teacher?.name || "Not Assigned",
        credits: enrollment.course.credits || 3,
        semester: enrollment.course.semester,
        status: "in-progress",
        progress: attendancePercentage,
        attendance: attendancePercentage,
        schedule: enrollment.course.schedule || "Schedule TBD",
        room: enrollment.course.room || "Room TBD",
        color: "#3b82f6"
      };
    });

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error("❌ Get student courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

/*
---------------------------------------
GET STUDENT ATTENDANCE
---------------------------------------
*/
export const getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: student.id
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    // Group by course
    const byCourse = {};
    attendances.forEach(a => {
      const courseName = a.course.name;
      if (!byCourse[courseName]) {
        byCourse[courseName] = {
          course: a.course,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          records: []
        };
      }
      byCourse[courseName].total++;
      if (a.status === "PRESENT") byCourse[courseName].present++;
      else if (a.status === "ABSENT") byCourse[courseName].absent++;
      else if (a.status === "LATE") byCourse[courseName].late++;
      
      byCourse[courseName].records.push({
        date: a.date,
        status: a.status,
        markedAt: a.markedAt
      });
    });

    // Calculate percentages
    Object.keys(byCourse).forEach(key => {
      byCourse[key].percentage = Math.round((byCourse[key].present / byCourse[key].total) * 100);
    });

    res.json({
      success: true,
      data: {
        total: attendances.length,
        present: attendances.filter(a => a.status === "PRESENT").length,
        absent: attendances.filter(a => a.status === "ABSENT").length,
        late: attendances.filter(a => a.status === "LATE").length,
        byCourse: byCourse,
        records: attendances.slice(0, 20)
      }
    });

  } catch (error) {
    console.error("❌ Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance"
    });
  }
};

/*
---------------------------------------
GET STUDENT GRADES
---------------------------------------
*/
export const getStudentGrades = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // No grades table in schema, return empty data
    res.json({
      success: true,
      data: {
        cgpa: 0,
        totalSubmissions: 0,
        byCourse: {},
        submissions: []
      }
    });

  } catch (error) {
    console.error("❌ Get student grades error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch grades"
    });
  }
};

/* ========================================
   TEACHER-SPECIFIC STUDENT METHODS
   ======================================== */

/*
---------------------------------------
GET STUDENTS BY TEACHER ID
---------------------------------------
*/
export const getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const students = await prisma.student.findMany({
      where: {
        teacherId: Number(teacherId),
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true
          }
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error("Get students by teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/*
---------------------------------------
GET STUDENTS BY COURSE (FOR TEACHERS)
---------------------------------------
*/
export const getStudentsByCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;

    const teacher = await prisma.staff.findUnique({
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
      }
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this course"
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: Number(courseId),
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
              }
            }
          }
        }
      },
      orderBy: {
        student: {
          name: "asc"
        }
      }
    });

    const students = enrollments.map(enrollment => {
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
        course: enrollment.student.course,
        semester: enrollment.student.semester,
        batch: enrollment.student.batch,
        guardianName: enrollment.student.fatherName || enrollment.student.guardianName,
        guardianPhone: enrollment.student.guardianPhone,
        attendanceStats: {
          total: totalClasses,
          present: presentCount,
          percentage: attendancePercentage,
          lastAttendance: attendances[0]?.date || null
        }
      };
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          code: course.code,
          name: course.name,
          department: course.department,
          semester: course.semester
        },
        totalStudents: students.length,
        students
      }
    });

  } catch (error) {
    console.error("Get students by course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/*
---------------------------------------
GET ALL STUDENTS FOR TEACHER (ACROSS ALL COURSES)
---------------------------------------
*/
export const getTeacherAllStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await prisma.staff.findUnique({
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
      select: { id: true, name: true, code: true }
    });

    const courseIds = courses.map(c => c.id);

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
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
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        student: {
          name: "asc"
        }
      }
    });

    // Group by course
    const studentsByCourse = {};
    courses.forEach(course => {
      studentsByCourse[course.name] = enrollments
        .filter(e => e.courseId === course.id)
        .map(e => ({
          id: e.student.id,
          name: e.student.name,
          email: e.student.email,
          rollNo: e.student.rollNo,
          phone: e.student.phone,
          semester: e.student.semester,
          batch: e.student.batch
        }));
    });

    // Get unique students list
    const uniqueStudents = [];
    const studentIds = new Set();
    
    enrollments.forEach(e => {
      if (!studentIds.has(e.student.id)) {
        studentIds.add(e.student.id);
        uniqueStudents.push({
          id: e.student.id,
          name: e.student.name,
          email: e.student.email,
          rollNo: e.student.rollNo,
          phone: e.student.phone,
          semester: e.student.semester,
          batch: e.student.batch,
          enrolledCourses: enrollments
            .filter(en => en.studentId === e.student.id)
            .map(en => ({
              id: en.course.id,
              name: en.course.name,
              code: en.course.code
            }))
        });
      }
    });

    res.json({
      success: true,
      data: {
        total: uniqueStudents.length,
        byCourse: studentsByCourse,
        students: uniqueStudents
      }
    });

  } catch (error) {
    console.error("Get teacher all students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/*
---------------------------------------
GET STUDENT ATTENDANCE FOR TEACHER
---------------------------------------
*/
export const getStudentAttendanceForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { userId: teacherId }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const teacherCourses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { id: true }
    });

    const courseIds = teacherCourses.map(c => c.id);

    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: Number(studentId),
        courseId: { in: courseIds }
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    // Group by course
    const attendanceByCourse = {};
    attendances.forEach(a => {
      const courseName = a.course.name;
      if (!attendanceByCourse[courseName]) {
        attendanceByCourse[courseName] = {
          course: a.course,
          records: []
        };
      }
      attendanceByCourse[courseName].records.push({
        date: a.date,
        status: a.status,
        markedAt: a.markedAt
      });
    });

    res.json({
      success: true,
      data: {
        total: attendances.length,
        byCourse: attendanceByCourse,
        attendances
      }
    });

  } catch (error) {
    console.error("❌ Get student attendance for teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance"
    });
  }
};

/* ========================================
   TRASH METHODS
   ======================================== */

/*
---------------------------------------
GET TRASHED STUDENTS (ADMIN)
---------------------------------------
*/
export const getTrashedStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true
          }
        },
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
      data: students
    });

  } catch (error) {
    console.error("Get trashed students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trashed students"
    });
  }
};

/*
---------------------------------------
RESTORE STUDENT FROM TRASH (ADMIN) - UPDATED
---------------------------------------
*/
export const restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await prisma.$transaction([
      prisma.student.update({
        where: { id: Number(id) },
        data: { deletedAt: null }
      }),
      prisma.user.update({
        where: { id: student.userId },
        data: { 
          isActive: true,
          status: "active",
          deactivatedAt: null,
          deactivatedReason: null,
          activatedAt: new Date()
        }
      })
    ]);

    res.json({
      success: true,
      message: "Student restored successfully"
    });

  } catch (error) {
    console.error("Restore student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore student"
    });
  }
};

/*
---------------------------------------
PERMANENTLY DELETE STUDENT (ADMIN)
---------------------------------------
*/
export const permanentDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: { studentId: Number(id) }
      }),
      prisma.enrollment.deleteMany({
        where: { studentId: Number(id) }
      }),
      prisma.student.delete({
        where: { id: Number(id) }
      }),
      prisma.user.delete({
        where: { id: student.userId }
      })
    ]);

    res.json({
      success: true,
      message: "Student permanently deleted"
    });

  } catch (error) {
    console.error("Permanent delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete student"
    });
  }
};

/* ========================================
   HELPER FUNCTIONS
   ======================================== */

const getGradeFromMarks = (obtained, total) => {
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const getGradePoint = (percentage) => {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 5;
  return 4;
};