import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

/* ========================================
   ADMIN METHODS
   ======================================== */

/* -----------------------------------------
GET ALL TEACHERS (ADMIN)
------------------------------------------*/
export const getAllStaff = async (req, res) => {
  try {
    const teachers = await prisma.staff.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            lastLogin: true
          }
        },
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true
          }
        }
      },
      orderBy: { name: "asc" }
    });

    res.json({
      success: true,
      data: teachers
    });

  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers"
    });
  }
};

/* -----------------------------------------
GET TEACHER BY ID (ADMIN)
------------------------------------------*/
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            lastLogin: true
          }
        },
        courses: {
          where: { deletedAt: null },
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            department: true,
            status: true
          }
        }
      }
    });

    if (!teacher || teacher.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    console.error("Get teacher by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher"
    });
  }
};

/* -----------------------------------------
CREATE TEACHER (ADMIN)
------------------------------------------*/
export const createStaff = async (req, res) => {
  try {
    console.log("📥 Received teacher data:", JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      password,
      department,
      designation,
      phone,
      employeeId
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!department) missingFields.push('department');
    if (!designation) missingFields.push('designation');

    if (missingFields.length > 0) {
      console.log("❌ Validation errors:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
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

    // Check if teacher with same employeeId exists (if provided)
    if (employeeId) {
      const existingTeacher = await prisma.staff.findUnique({
        where: { employeeId }
      });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: "Teacher with this employee ID already exists"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate employeeId if not provided
    const finalEmployeeId = employeeId || `TCH${Date.now().toString().slice(-6)}`;

    console.log("Creating teacher with:", {
      name,
      email,
      department,
      designation,
      finalEmployeeId
    });

    // Use transaction to create both user and teacher
    const result = await prisma.$transaction(async (prisma) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TEACHER",
          isActive: true
        }
      });

      console.log("✅ User created:", user.id);

      // Then create teacher linked to user
      const teacher = await prisma.staff.create({
        data: {
          userId: user.id,
          name,
          email,
          department,
          designation,
          employeeId: finalEmployeeId,
          phone: phone || null
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true
            }
          }
        }
      });

      console.log("✅ Teacher created:", teacher.id);
      return teacher;
    });

    console.log("✅ Teacher created successfully:", result.id);
    res.status(201).json({
      success: true,
      data: result,
      message: "Teacher created successfully"
    });

  } catch (error) {
    console.error("❌ Create teacher error - FULL DETAILS:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error meta:", error.meta);
    console.error("Error stack:", error.stack);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `A teacher with this ${target} already exists`
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Foreign key constraint failed"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create teacher"
    });
  }
};

/* -----------------------------------------
UPDATE TEACHER (ADMIN)
------------------------------------------*/
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      designation,
      phone,
      employeeId,
      isActive
    } = req.body;

    // Check if teacher exists
    const existingTeacher = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingTeacher.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Check if employeeId is being changed and already exists
    if (employeeId && employeeId !== existingTeacher.employeeId) {
      const empIdExists = await prisma.staff.findUnique({
        where: { employeeId }
      });
      if (empIdExists) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already in use"
        });
      }
    }

    // Update teacher and user in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update teacher
      const teacher = await prisma.staff.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          department,
          designation,
          employeeId,
          phone
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true
            }
          }
        }
      });

      // Update user
      await prisma.user.update({
        where: { id: existingTeacher.userId },
        data: {
          name,
          email,
          isActive: isActive !== undefined ? isActive : existingTeacher.user.isActive
        }
      });

      return teacher;
    });

    res.json({
      success: true,
      data: result,
      message: "Teacher updated successfully"
    });

  } catch (error) {
    console.error("Update teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher"
    });
  }
};

/* -----------------------------------------
DELETE TEACHER (SOFT DELETE) - ADMIN
------------------------------------------*/
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Soft delete teacher and deactivate user
    await prisma.$transaction([
      prisma.staff.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive: false }
      })
    ]);

    res.json({
      success: true,
      message: "Teacher deleted successfully"
    });

  } catch (error) {
    console.error("Delete teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher"
    });
  }
};

/* ========================================
   TEACHER METHODS (Self)
   ======================================== */

/* -----------------------------------------
GET TEACHER PROFILE (SELF)
------------------------------------------*/
export const getTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await prisma.staff.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            lastLogin: true
          }
        },
        courses: {
          where: { deletedAt: null },
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            department: true,
            status: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found"
      });
    }

    res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    console.error("Get teacher profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher profile"
    });
  }
};

/* -----------------------------------------
UPDATE TEACHER PROFILE (SELF)
------------------------------------------*/
export const updateTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      department,
      designation
    } = req.body;

    const teacher = await prisma.staff.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Update teacher
    const updatedTeacher = await prisma.staff.update({
      where: { id: teacher.id },
      data: {
        name,
        phone,
        department,
        designation
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    res.json({
      success: true,
      data: updatedTeacher,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Update teacher profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

/* -----------------------------------------
GET STAFF DASHBOARD STATS - FIXED (No duplicate counting)
------------------------------------------*/
export const getStaffDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📊 Fetching dashboard stats for teacher:", userId);

    const teacher = await prisma.staff.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      console.log("❌ Teacher not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    console.log("✅ Teacher found:", teacher.id, teacher.name);

    // Get courses count
    const coursesCount = await prisma.course.count({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      }
    });

    // Get students directly assigned via teacherId
    const directlyAssignedStudents = await prisma.student.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { id: true }
    });

    const directlyAssignedIds = new Set(directlyAssignedStudents.map(s => s.id));
    console.log(`👥 Directly assigned students: ${directlyAssignedIds.size}`);

    // Get students from course enrollments
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { id: true }
    });

    const courseIds = courses.map(c => c.id);
    
    let enrolledStudentIds = new Set();
    if (courseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: { in: courseIds },
          student: { deletedAt: null }
        },
        select: { studentId: true }
      });
      
      enrollments.forEach(e => enrolledStudentIds.add(e.studentId));
    }
    
    console.log(`👥 Students from enrollments: ${enrolledStudentIds.size}`);

    // Combine both sets (remove duplicates)
    const allStudentIds = new Set([...directlyAssignedIds, ...enrolledStudentIds]);
    const totalStudents = allStudentIds.size;
    
    console.log(`✅ Total unique students: ${totalStudents}`);
    console.log('📋 Student IDs:', Array.from(allStudentIds));

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayAttendance = 0;
    if (courseIds.length > 0) {
      todayAttendance = await prisma.attendance.count({
        where: {
          courseId: { in: courseIds },
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      });
    }

    const averageAttendance = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalCourses: coursesCount,
          totalStudents: totalStudents,
          todayAttendance,
          averageAttendance
        }
      }
    });

  } catch (error) {
    console.error("❌ Get staff dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
};

/* -----------------------------------------
GET TEACHER COURSES
------------------------------------------*/
export const getTeacherCourses = async (req, res) => {
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
        enrollments: {
          where: {
            student: { deletedAt: null }
          },
          select: { studentId: true }
        }
      },
      orderBy: [
        { semester: "asc" },
        { name: "asc" }
      ]
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
    console.error("Get teacher courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

/* -----------------------------------------
GET TEACHER STUDENTS - FIXED (No duplicates)
------------------------------------------*/
export const getTeacherStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("👥 Fetching students for teacher user ID:", userId);

    // Get teacher details
    const teacher = await prisma.staff.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      console.log("❌ Teacher not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    console.log("✅ Teacher found:", teacher.id, teacher.name, teacher.department);

    // Get students directly assigned via teacherId
    const directlyAssignedStudents = await prisma.student.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`👥 Found ${directlyAssignedStudents.length} students directly assigned`);

    // Get students from courses taught by this teacher
    const teacherCourses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { id: true, name: true, code: true }
    });

    const courseIds = teacherCourses.map(c => c.id);
    
    let enrolledStudents = [];
    if (courseIds.length > 0) {
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
                  email: true,
                  name: true
                }
              }
            }
          }
        }
      });

      enrolledStudents = enrollments.map(e => e.student);
      console.log(`👥 Found ${enrolledStudents.length} students from course enrollments`);
    }

    // Combine using Map to ensure uniqueness by student ID
    const studentsMap = new Map();
    
    // Add directly assigned students
    directlyAssignedStudents.forEach(student => {
      studentsMap.set(student.id, {
        id: student.id,
        name: student.name || '',
        email: student.email || student.user?.email || '',
        rollNo: student.rollNo || '',
        phone: student.phone || '',
        course: student.course || '',
        semester: student.semester || null,
        batch: student.batch || '',
        section: student.section || '',
        attendance: student.attendance || 0,
        teacherId: student.teacherId
      });
    });

    // Add enrolled students (will overwrite if same ID, but that's fine)
    enrolledStudents.forEach(student => {
      studentsMap.set(student.id, {
        id: student.id,
        name: student.name || '',
        email: student.email || student.user?.email || '',
        rollNo: student.rollNo || '',
        phone: student.phone || '',
        course: student.course || '',
        semester: student.semester || null,
        batch: student.batch || '',
        section: student.section || '',
        attendance: student.attendance || 0,
        teacherId: student.teacherId
      });
    });

    const allStudents = Array.from(studentsMap.values());
    console.log(`✅ Total unique students for teacher: ${allStudents.length}`);

    res.json({
      success: true,
      data: allStudents
    });

  } catch (error) {
    console.error("❌ Get teacher students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/* -----------------------------------------
GET TEACHER TODAY'S SCHEDULE
------------------------------------------*/
export const getTeacherTodaySchedule = async (req, res) => {
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

    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[today.getDay()];

    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null,
        schedule: {
          contains: dayOfWeek
        }
      },
      orderBy: { schedule: "asc" }
    });

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error("Get teacher schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule"
    });
  }
};

/* -----------------------------------------
UPDATE TEACHER PASSWORD (SELF)
------------------------------------------*/
export const updateTeacherPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Update teacher password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
};
