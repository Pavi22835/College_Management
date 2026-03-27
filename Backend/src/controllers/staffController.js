import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

/* ========================================
   ADMIN STAFF MANAGEMENT
   ======================================== */

/* -----------------------------------------
GET ALL STAFF
------------------------------------------*/
export const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
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
      data: staff
    });

  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff"
    });
  }
};

/* -----------------------------------------
GET STAFF BY ID
------------------------------------------*/
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
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

    if (!staff || staff.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Get staff by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff"
    });
  }
};

/* -----------------------------------------
CREATE STAFF - REMOVED address field
------------------------------------------*/
export const createStaff = async (req, res) => {
  try {
    console.log("📥 Received staff data:", JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      password,
      department,
      designation,
      staffRole,
      phone,
      employeeId,
      appointedDate
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!department) missingFields.push('department');
    if (!designation) missingFields.push('designation');

    if (missingFields.length > 0) {
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
        message: `User with email "${email}" already exists`
      });
    }

    // Check if staff with same employeeId exists
    if (employeeId) {
      const existingStaff = await prisma.staff.findUnique({
        where: { employeeId }
      });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: `Staff with employee ID "${employeeId}" already exists`
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalEmployeeId = employeeId || `STAFF${Date.now().toString().slice(-6)}`;
    const finalStaffRole = staffRole || 'FACULTY';

    console.log("Creating staff with:", {
      name,
      email,
      department,
      designation,
      staffRole: finalStaffRole,
      employeeId: finalEmployeeId
    });

    // Create user and staff in transaction - REMOVED address field
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STAFF",
          isActive: true
        }
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          name,
          email,
          department,
          designation,
          staffRole: finalStaffRole,
          employeeId: finalEmployeeId,
          phone: phone || null,
          appointedDate: appointedDate ? new Date(appointedDate) : null
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

      return staff;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Staff (${result.staffRole}) created successfully`
    });

  } catch (error) {
    console.error("❌ Create staff error:", error.message);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: `A staff with this ${error.meta?.target?.[0] || 'field'} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create staff"
    });
  }
};

/* -----------------------------------------
UPDATE STAFF - REMOVED address field
------------------------------------------*/
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      designation,
      staffRole,
      phone,
      employeeId,
      appointedDate,
      isActive
    } = req.body;

    const existingStaff = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    // Check email uniqueness
    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    // Check employeeId uniqueness
    if (employeeId && employeeId !== existingStaff.employeeId) {
      const empIdExists = await prisma.staff.findUnique({ where: { employeeId } });
      if (empIdExists) {
        return res.status(400).json({ success: false, message: "Employee ID already in use" });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const staff = await tx.staff.update({
        where: { id: Number(id) },
        data: {
          name: name || existingStaff.name,
          email: email || existingStaff.email,
          department: department || existingStaff.department,
          designation: designation || existingStaff.designation,
          staffRole: staffRole || existingStaff.staffRole,
          employeeId: employeeId || existingStaff.employeeId,
          phone: phone !== undefined ? phone : existingStaff.phone,
          appointedDate: appointedDate ? new Date(appointedDate) : existingStaff.appointedDate
        }
      });

      if (name || email || isActive !== undefined) {
        await tx.user.update({
          where: { id: existingStaff.userId },
          data: {
            name: name || existingStaff.name,
            email: email || existingStaff.email,
            isActive: isActive !== undefined ? isActive : existingStaff.user.isActive
          }
        });
      }

      return staff;
    });

    res.json({
      success: true,
      data: result,
      message: "Staff updated successfully"
    });

  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ success: false, message: "Failed to update staff" });
  }
};

/* -----------------------------------------
DELETE STAFF (SOFT DELETE)
------------------------------------------*/
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    await prisma.$transaction([
      prisma.staff.update({ where: { id: Number(id) }, data: { deletedAt: new Date() } }),
      prisma.user.update({ where: { id: staff.userId }, data: { isActive: false } })
    ]);

    res.json({ success: true, message: "Staff deleted successfully" });

  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ success: false, message: "Failed to delete staff" });
  }
};

/* -----------------------------------------
GET HODs ONLY
------------------------------------------*/
export const getHODs = async (req, res) => {
  try {
    const hods = await prisma.staff.findMany({
      where: { staffRole: 'HOD', deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true, isActive: true, lastLogin: true } },
        courses: { select: { id: true, code: true, name: true } }
      },
      orderBy: { department: "asc" }
    });

    res.json({ success: true, data: hods });
  } catch (error) {
    console.error("Get HODs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch HODs" });
  }
};

/* -----------------------------------------
GET FACULTY ONLY
------------------------------------------*/
export const getFaculty = async (req, res) => {
  try {
    const faculty = await prisma.staff.findMany({
      where: { staffRole: 'FACULTY', deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true, isActive: true, lastLogin: true } },
        courses: { select: { id: true, code: true, name: true } }
      },
      orderBy: { department: "asc" }
    });

    res.json({ success: true, data: faculty });
  } catch (error) {
    console.error("Get Faculty error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch faculty" });
  }
};

/* -----------------------------------------
GET MENTORS ONLY
------------------------------------------*/
export const getMentors = async (req, res) => {
  try {
    const mentors = await prisma.staff.findMany({
      where: { staffRole: 'MENTOR', deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true, isActive: true, lastLogin: true } }
      },
      orderBy: { department: "asc" }
    });

    res.json({ success: true, data: mentors });
  } catch (error) {
    console.error("Get Mentors error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentors" });
  }
};

/* -----------------------------------------
GET STAFF STATISTICS
------------------------------------------*/
export const getStaffStats = async (req, res) => {
  try {
    const totalStaff = await prisma.staff.count({ where: { deletedAt: null } });
    const activeStaff = await prisma.staff.count({ where: { deletedAt: null, user: { isActive: true } } });
    const inactiveStaff = await prisma.staff.count({ where: { deletedAt: null, user: { isActive: false } } });
    const hodsCount = await prisma.staff.count({ where: { staffRole: 'HOD', deletedAt: null } });
    const facultyCount = await prisma.staff.count({ where: { staffRole: 'FACULTY', deletedAt: null } });
    const mentorsCount = await prisma.staff.count({ where: { staffRole: 'MENTOR', deletedAt: null } });
    
    const departments = await prisma.staff.groupBy({
      by: ['department'],
      where: { deletedAt: null },
      _count: true
    });

    res.json({
      success: true,
      data: {
        total: totalStaff,
        active: activeStaff,
        inactive: inactiveStaff,
        byRole: { HOD: hodsCount, FACULTY: facultyCount, MENTOR: mentorsCount },
        departments: departments.map(d => ({ name: d.department, count: d._count }))
      }
    });
  } catch (error) {
    console.error("Get staff stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch staff statistics" });
  }
};

/* ========================================
   STAFF SELF METHODS
   ======================================== */

export const getStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { id: true, email: true, name: true, isActive: true, lastLogin: true } },
        courses: { where: { deletedAt: null }, select: { id: true, code: true, name: true, semester: true, department: true, status: true } }
      }
    });

    if (!staff) return res.status(404).json({ success: false, message: "Staff profile not found" });
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error("Get staff profile error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch staff profile" });
  }
};

export const updateStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, department, designation } = req.body;

    const staff = await prisma.staff.findUnique({ where: { userId: userId } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const updatedStaff = await prisma.staff.update({
      where: { id: staff.id },
      data: {
        name: name || staff.name,
        phone: phone !== undefined ? phone : staff.phone,
        department: department || staff.department,
        designation: designation || staff.designation
      },
      include: { user: { select: { id: true, email: true, name: true, isActive: true } } }
    });

    if (name) await prisma.user.update({ where: { id: userId }, data: { name } });
    res.json({ success: true, data: updatedStaff, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update staff profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const updateStaffPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Current and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update staff password error:", error);
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
};

export const getStaffDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: userId } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const coursesCount = await prisma.course.count({ where: { teacherId: staff.id, deletedAt: null } });
    const directlyAssignedStudents = await prisma.student.findMany({ where: { teacherId: staff.id, deletedAt: null }, select: { id: true } });
    const directlyAssignedIds = new Set(directlyAssignedStudents.map(s => s.id));
    const courses = await prisma.course.findMany({ where: { teacherId: staff.id, deletedAt: null }, select: { id: true } });
    const courseIds = courses.map(c => c.id);
    let enrolledStudentIds = new Set();
    if (courseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({ where: { courseId: { in: courseIds }, student: { deletedAt: null } }, select: { studentId: true } });
      enrollments.forEach(e => enrolledStudentIds.add(e.studentId));
    }
    const totalStudents = new Set([...directlyAssignedIds, ...enrolledStudentIds]).size;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    let todayAttendance = 0;
    if (courseIds.length > 0) {
      todayAttendance = await prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today, lt: tomorrow } } });
    }

    res.json({ success: true, data: { stats: { totalCourses: coursesCount, totalStudents, todayAttendance, averageAttendance: totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0 } } });
  } catch (error) {
    console.error("Get staff dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

export const getStaffCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: userId } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const courses = await prisma.course.findMany({
      where: { teacherId: staff.id, deletedAt: null },
      include: { enrollments: { where: { student: { deletedAt: null } }, select: { studentId: true } } },
      orderBy: [{ semester: "asc" }, { name: "asc" }]
    });

    res.json({ success: true, data: courses.map(c => ({ ...c, studentsCount: c.enrollments.length })) });
  } catch (error) {
    console.error("Get staff courses error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};

export const getStaffStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: userId } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const directlyAssignedStudents = await prisma.student.findMany({ where: { teacherId: staff.id, deletedAt: null }, include: { user: { select: { email: true, name: true } } } });
    const staffCourses = await prisma.course.findMany({ where: { teacherId: staff.id, deletedAt: null }, select: { id: true } });
    const courseIds = staffCourses.map(c => c.id);
    let enrolledStudents = [];
    if (courseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({ where: { courseId: { in: courseIds }, student: { deletedAt: null } }, include: { student: { include: { user: { select: { email: true, name: true } } } } } });
      enrolledStudents = enrollments.map(e => e.student);
    }

    const studentsMap = new Map();
    directlyAssignedStudents.forEach(s => studentsMap.set(s.id, { id: s.id, name: s.name || '', email: s.email || s.user?.email || '', rollNo: s.rollNo || '', phone: s.phone || '', course: s.course || '', semester: s.semester || null, batch: s.batch || '', section: s.section || '', teacherId: s.teacherId }));
    enrolledStudents.forEach(s => studentsMap.set(s.id, { id: s.id, name: s.name || '', email: s.email || s.user?.email || '', rollNo: s.rollNo || '', phone: s.phone || '', course: s.course || '', semester: s.semester || null, batch: s.batch || '', section: s.section || '', teacherId: s.teacherId }));

    res.json({ success: true, data: Array.from(studentsMap.values()) });
  } catch (error) {
    console.error("Get staff students error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
};

export const getStaffTodaySchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: userId } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[new Date().getDay()];
    const courses = await prisma.course.findMany({ where: { teacherId: staff.id, deletedAt: null, schedule: { contains: dayOfWeek } }, orderBy: { schedule: "asc" } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error("Get staff schedule error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch schedule" });
  }
};