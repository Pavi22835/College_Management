import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

/* ========================================
   ADMIN STAFF MANAGEMENT
   ======================================== */

/* -----------------------------------------
GET ALL STAFF (WITH OPTION TO INCLUDE TRASHED)
------------------------------------------*/
export const getAllStaff = async (req, res) => {
  try {
    const { includeTrashed } = req.query;
    
    let whereCondition = {};
    
    // If includeTrashed is false or not provided, exclude deleted staff
    if (includeTrashed !== 'true') {
      whereCondition = { deletedAt: null };
    }
    
    const staff = await prisma.staff.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true,
            lastLogin: true,
            deactivatedAt: true,
            deactivatedReason: true
          }
        },
        courses: {
          where: { deletedAt: null },
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
GET TRASHED STAFF (DELETED STAFF)
------------------------------------------*/
export const getTrashedStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
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
            status: true,
            lastLogin: true,
            deactivatedAt: true,
            deactivatedReason: true
          }
        },
        courses: {
          where: { deletedAt: null },
          select: {
            id: true,
            code: true,
            name: true,
            semester: true
          }
        }
      },
      orderBy: { deletedAt: "desc" }
    });

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Get trashed staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trashed staff"
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
            status: true,
            lastLogin: true,
            deactivatedAt: true,
            deactivatedReason: true
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

    if (!staff) {
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
CREATE STAFF
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

    // Create user and staff in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STAFF",
          isActive: true,
          status: "active",
          activatedAt: new Date()
        }
      });

        const staff = await tx.staff.create({
        data: {
          userId: user.id,
          name,
          email,
          department,
          designation,
          employeeId: finalEmployeeId,
          phone: phone || null,
          deletedAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true,
              status: true,
              activatedAt: true
            }
          }
        }
      });

      return staff;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Staff created successfully`
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
UPDATE STAFF
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

    // Check if staff is in trash
    if (existingStaff.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Cannot update staff that is in trash. Please restore first."
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
          employeeId: employeeId || existingStaff.employeeId,
          phone: phone !== undefined ? phone : existingStaff.phone
        }
      });

      if (name || email || isActive !== undefined) {
        await tx.user.update({
          where: { id: existingStaff.userId },
          data: {
            name: name || existingStaff.name,
            email: email || existingStaff.email,
            isActive: isActive !== undefined ? isActive : existingStaff.user.isActive,
            status: isActive !== undefined ? (isActive ? "active" : "deactivated") : existingStaff.user.status
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
SOFT DELETE STAFF (MOVE TO TRASH)
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

    if (staff.deletedAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Staff is already in trash" 
      });
    }

    const now = new Date();
    
    await prisma.$transaction([
      prisma.staff.update({ 
        where: { id: Number(id) }, 
        data: { deletedAt: now } 
      }),
      prisma.user.update({ 
        where: { id: staff.userId }, 
        data: { 
          isActive: false,
          status: "deactivated",
          deactivatedAt: now,
          deactivatedReason: "Staff moved to trash",
          deactivatedBy: req.user?.id || null
        } 
      })
    ]);

    res.json({ 
      success: true, 
      message: "Staff moved to trash successfully",
      data: {
        id: staff.id,
        name: staff.name,
        deletedAt: now
      }
    });

  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to move staff to trash" 
    });
  }
};

/* -----------------------------------------
RESTORE STAFF FROM TRASH
------------------------------------------*/
export const restoreStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (!staff.deletedAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Staff is not in trash" 
      });
    }

    const now = new Date();
    
    await prisma.$transaction([
      prisma.staff.update({ 
        where: { id: Number(id) }, 
        data: { deletedAt: null } 
      }),
      prisma.user.update({ 
        where: { id: staff.userId }, 
        data: { 
          isActive: true,
          status: "active",
          deactivatedAt: null,
          deactivatedReason: null,
          deactivatedBy: null,
          activatedAt: now
        } 
      })
    ]);

    const restoredStaff = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            status: true,
            activatedAt: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      message: "Staff restored successfully",
      data: restoredStaff
    });

  } catch (error) {
    console.error("Restore staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to restore staff" 
    });
  }
};

/* -----------------------------------------
PERMANENTLY DELETE STAFF (HARD DELETE)
------------------------------------------*/
export const permanentDeleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const staffName = staff.name;
    const userEmail = staff.user?.email;

    await prisma.$transaction([
      prisma.staff.delete({ where: { id: Number(id) } }),
      prisma.user.delete({ where: { id: staff.userId } })
    ]);

    res.json({ 
      success: true, 
      message: `Staff "${staffName}" (${userEmail}) permanently deleted`,
      data: {
        id: staff.id,
        name: staffName,
        email: userEmail
      }
    });

  } catch (error) {
    console.error("Permanent delete staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to permanently delete staff" 
    });
  }
};

/* -----------------------------------------
GET HODs ONLY
------------------------------------------*/
export const getHODs = async (req, res) => {
  try {
    const hods = await prisma.staff.findMany({
      where: { 
        staffRole: 'HOD', 
        deletedAt: null 
      },
      include: {
        user: { 
          select: { 
            id: true, 
            email: true, 
            name: true, 
            isActive: true,
            status: true,
            lastLogin: true 
          } 
        },
        courses: { 
          where: { deletedAt: null },
          select: { id: true, code: true, name: true } 
        }
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
      where: { 
        staffRole: 'FACULTY', 
        deletedAt: null 
      },
      include: {
        user: { 
          select: { 
            id: true, 
            email: true, 
            name: true, 
            isActive: true,
            status: true,
            lastLogin: true 
          } 
        },
        courses: { 
          where: { deletedAt: null },
          select: { id: true, code: true, name: true } 
        }
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
      where: { 
        staffRole: 'MENTOR', 
        deletedAt: null 
      },
      include: {
        user: { 
          select: { 
            id: true, 
            email: true, 
            name: true, 
            isActive: true,
            status: true,
            lastLogin: true 
          } 
        }
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
    const trashedStaff = await prisma.staff.count({ where: { deletedAt: { not: null } } });
    const activeStaff = await prisma.staff.count({ 
      where: { 
        deletedAt: null, 
        user: { 
          isActive: true,
          status: "active"
        } 
      } 
    });
    const inactiveStaff = await prisma.staff.count({ 
      where: { 
        deletedAt: null, 
        user: { 
          isActive: false,
          status: "deactivated"
        } 
      } 
    });
    const hodsCount = await prisma.staff.count({ 
      where: { 
        staffRole: 'HOD', 
        deletedAt: null 
      } 
    });
    const facultyCount = await prisma.staff.count({ 
      where: { 
        staffRole: 'FACULTY', 
        deletedAt: null 
      } 
    });
    const mentorsCount = await prisma.staff.count({ 
      where: { 
        staffRole: 'MENTOR', 
        deletedAt: null 
      } 
    });
    
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
        trashed: trashedStaff,
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
        user: { 
          select: { 
            id: true, 
            email: true, 
            name: true, 
            isActive: true,
            status: true,
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
      include: { user: { select: { id: true, email: true, name: true, isActive: true, status: true } } }
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
    const courses = await prisma.course.findMany({ where: { teacherId: staff.id, deletedAt: null }, select: { id: true, batch: true } });
    const courseIds = courses.map(c => c.id);
    let enrolledStudentIds = new Set();
    if (courseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({ where: { courseId: { in: courseIds }, student: { deletedAt: null } }, select: { studentId: true } });
      enrollments.forEach(e => enrolledStudentIds.add(e.studentId));
    }

    const courseBatches = [...new Set(courses.map(c => c.batch).filter(Boolean))];
    let batchStudentIds = new Set();
    if (courseBatches.length > 0) {
      const batchStudents = await prisma.student.findMany({ where: { batch: { in: courseBatches }, deletedAt: null }, select: { id: true } });
      batchStudents.forEach(s => batchStudentIds.add(s.id));
    }

    const totalStudents = new Set([...directlyAssignedIds, ...enrolledStudentIds, ...batchStudentIds]).size;

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
      include: { 
        enrollments: { where: { student: { deletedAt: null } }, select: { studentId: true } },
        lessons: { orderBy: { order: 'asc' } },
        materials: true
      },
      orderBy: [{ semester: "asc" }, { name: "asc" }]
    });

    const courseBatches = [...new Set(courses.map(c => c.batch).filter(Boolean))];
    let batchStudentMap = new Map();
    if (courseBatches.length > 0) {
      const batchStudents = await prisma.student.findMany({ where: { batch: { in: courseBatches }, deletedAt: null }, select: { id: true, batch: true } });
      batchStudents.forEach(s => {
        const batch = s.batch || '';
        if (!batchStudentMap.has(batch)) {
          batchStudentMap.set(batch, new Set());
        }
        batchStudentMap.get(batch).add(s.id);
      });
    }

    const enhancedCourses = courses.map(c => {
      const enrolledIds = new Set(c.enrollments.map(e => e.studentId));
      const batchIds = c.batch ? batchStudentMap.get(c.batch) || new Set() : new Set();
      const uniqueIds = new Set([...enrolledIds, ...batchIds]);
      return { ...c, studentsCount: uniqueIds.size };
    });

    res.json({ success: true, data: enhancedCourses });
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
    const staffCourses = await prisma.course.findMany({ where: { teacherId: staff.id, deletedAt: null }, select: { id: true, batch: true } });
    const courseIds = staffCourses.map(c => c.id);
    let enrolledStudents = [];
    if (courseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({ where: { courseId: { in: courseIds }, student: { deletedAt: null } }, include: { student: { include: { user: { select: { email: true, name: true } } } } } });
      enrolledStudents = enrollments.map(e => e.student);
    }

    const courseBatches = [...new Set(staffCourses.map(c => c.batch).filter(Boolean))];
    let batchMatchedStudents = [];
    if (courseBatches.length > 0) {
      batchMatchedStudents = await prisma.student.findMany({
        where: { batch: { in: courseBatches }, deletedAt: null },
        include: { user: { select: { email: true, name: true } } }
      });
    }

    const studentsMap = new Map();
    const addStudent = (s) => {
      studentsMap.set(s.id, {
        id: s.id,
        name: s.name || s.user?.name || '',
        email: s.email || s.user?.email || '',
        rollNo: s.rollNo || '',
        phone: s.phone || '',
        course: s.course || '',
        semester: s.semester || null,
        batch: s.batch || '',
        section: s.section || '',
        teacherId: s.teacherId
      });
    };

    directlyAssignedStudents.forEach(addStudent);
    enrolledStudents.forEach(addStudent);
    batchMatchedStudents.forEach(addStudent);

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

/* ========================================
   NEW: STAFF COURSE MANAGEMENT METHODS
   ======================================== */

// Create a new course (Staff)
export const createStaffCourse = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      semester, 
      department, 
      batch, 
      description, 
      credits 
    } = req.body;
    
    const userId = req.user.id;
    
    // Get staff ID from user ID
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found"
      });
    }
    
    // Validate required fields
    if (!name || !code || !semester || !department) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, code, semester, department"
      });
    }
    
    // Check if course code already exists
    const existingCourse = await prisma.course.findFirst({
      where: { code: code.toUpperCase() }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists`
      });
    }
    
    // Create the course - FIXED: Use 'teacher' connect instead of teacherId
    const course = await prisma.course.create({
      data: {
        name,
        code: code.toUpperCase(),
        semester: parseInt(semester),
        department,
        batch: batch || null,
        description: description || "",
        credits: credits || 3,
        teacher: {
          connect: { id: staff.id }
        },
        status: "ACTIVE"
      }
    });
    
    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully"
    });
    
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create course"
    });
  }
};

// Get course by ID (Staff)
export const getStaffCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found"
      });
    }
    
    const course = await prisma.course.findFirst({
      where: { 
        id: parseInt(id),
        teacherId: staff.id
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                materials: true
              }
            },
            materials: true
          }
        },
        materials: true,
        enrollments: {
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
    
    res.status(200).json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update course (Staff)
export const updateStaffCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, code, semester, department, batch, description, credits } = req.body;
    
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found"
      });
    }
    
    const course = await prisma.course.findFirst({
      where: { 
        id: parseInt(id),
        teacherId: staff.id
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to update it"
      });
    }
    
    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        name: name || course.name,
        code: code ? code.toUpperCase() : course.code,
        semester: semester || course.semester,
        department: department || course.department,
        batch: batch !== undefined ? batch : course.batch,
        description: description !== undefined ? description : course.description,
        credits: credits || course.credits
      }
    });
    
    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: "Course updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete course (Soft delete - Staff)
export const deleteStaffCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const staff = await prisma.staff.findUnique({
      where: { userId: userId }
    });
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found"
      });
    }
    
    const course = await prisma.course.findFirst({
      where: { 
        id: parseInt(id),
        teacherId: staff.id
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to delete it"
      });
    }
    
    // Soft delete (set deletedAt)
    await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    
    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};