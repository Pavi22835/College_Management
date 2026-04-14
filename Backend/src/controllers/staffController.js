import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

/* -----------------------------------------
GET ALL STAFF (WITH OPTION TO INCLUDE TRASHED)
------------------------------------------*/
export const getAllStaff = async (req, res) => {
  try {
    const { includeTrashed } = req.query;
    
    let whereCondition = {};
    
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
      message: "Failed to fetch staff",
      error: error.message
    });
  }
};

/* -----------------------------------------
GET TRASHED STAFF (DELETED STAFF)
------------------------------------------*/
export const getTrashedStaff = async (req, res) => {
  try {
    console.log("=== Fetching trashed staff ===");
    
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

    console.log(`Found ${staff.length} trashed staff`);
    
    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Get trashed staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message
    });
  }
};

/* -----------------------------------------
GET STAFF BY ID
------------------------------------------*/
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const staffId = parseInt(id);
    if (isNaN(staffId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID"
      });
    }
    
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
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
          staffRole: finalStaffRole,
          employeeId: finalEmployeeId,
          phone: phone || null,
          appointedDate: appointedDate ? new Date(appointedDate) : null,
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

    if (existingStaff.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Cannot update staff that is in trash. Please restore first."
      });
    }

    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

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
        departments: departments.map(d => ({ name: d.department, count: d._count }))
      }
    });
  } catch (error) {
    console.error("Get staff stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch staff statistics" });
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

/* ========================================
   STAFF SELF METHODS (Placeholders)
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
  res.json({ success: true, message: "Profile updated" });
};

export const updateStaffPassword = async (req, res) => {
  res.json({ success: true, message: "Password updated" });
};

export const getStaffDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Get the staff member
    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    // Get all courses taught by this staff
    const courses = await prisma.course.findMany({
      where: {
        teacherId: staff.id,
        deletedAt: null
      },
      select: {
        id: true,
        batch: true
      }
    });

    const totalCourses = courses.length;

    // Count total students based on course batches
    let totalStudents = 0;
    const uniqueBatches = [...new Set(courses.map(c => c.batch).filter(Boolean))];
    
    if (uniqueBatches.length > 0) {
      totalStudents = await prisma.student.count({
        where: {
          batch: { in: uniqueBatches },
          deletedAt: null
        }
      });
    }

    // Get today's attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const courseIds = courses.map(c => c.id);
    
    const todayAttendanceRecords = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds },
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const todayPresent = todayAttendanceRecords.filter(a => a.status === 'PRESENT').length;
    const todayTotal = todayAttendanceRecords.length;
    const todayAttendance = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // Get overall attendance stats
    const allAttendanceRecords = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds }
      }
    });

    const totalPresent = allAttendanceRecords.filter(a => a.status === 'PRESENT').length;
    const totalAttendance = allAttendanceRecords.length;
    const averageAttendance = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalCourses,
          totalStudents,
          todayAttendance,
          averageAttendance
        }
      }
    });
  } catch (error) {
    console.error("Get staff dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff dashboard stats"
    });
  }
};

export const getStaffCourses = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Get the staff member's ID from the User
    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    // Get courses taught by this staff member
    const courses = await prisma.course.findMany({
      where: {
        teacherId: staff.id,
        deletedAt: null  // Only active courses
      },
      include: {
        enrollments: {
          select: {
            id: true,
            studentId: true
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
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add studentsCount to each course based on batch match
    const coursesWithCount = await Promise.all(courses.map(async (course) => {
      let count = 0;
      
      if (course.batch) {
        // Count students in the Student table that match this course's batch
        count = await prisma.student.count({
          where: {
            batch: course.batch,
            deletedAt: null
          }
        });
        console.log(`📊 Course "${course.name}" (${course.code}) - Batch: ${course.batch} - Students in batch: ${count}`);
      } else {
        // If no batch, count enrolled students
        count = course.enrollments?.length || 0;
        console.log(`📊 Course "${course.name}" (${course.code}) - No batch - Enrolled students: ${count}`);
      }
      
      return {
        ...course,
        studentsCount: count
      };
    }));

    console.log(`✅ Found ${coursesWithCount.length} courses for staff ${staff.name}`);
    console.log('📤 Sending response with studentsCount:', coursesWithCount.map(c => ({ name: c.name, batch: c.batch, studentsCount: c.studentsCount })));

    res.json({
      success: true,
      data: coursesWithCount
    });
  } catch (error) {
    console.error("Get staff courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff courses"
    });
  }
};

export const getStaffStudents = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Get the staff member
    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    // Get all courses taught by this staff to find their batches
    const staffCourses = await prisma.course.findMany({
      where: {
        teacherId: staff.id,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        code: true,
        batch: true
      }
    });

    // Get unique batches from staff's courses
    const uniqueBatches = [...new Set(staffCourses.map(c => c.batch).filter(Boolean))];

    console.log(`📚 Staff ${staff.name} teaches ${staffCourses.length} courses:`, staffCourses.map(c => ({ name: c.name, batch: c.batch })));
    console.log(`📚 Unique batches found:`, uniqueBatches);

    // If no batches found, return empty array
    if (uniqueBatches.length === 0) {
      console.log('⚠️ No batches found in staff courses, returning empty array');
      return res.json({
        success: true,
        data: []
      });
    }

    // Get all students that match these batches
    console.log(`🔍 Searching for students with batch in:`, uniqueBatches);
    const students = await prisma.student.findMany({
      where: {
        batch: { in: uniqueBatches },
        deletedAt: null
      },
      include: {
        user: {
          select: {
            email: true,
            isActive: true
          }
        },
        enrollments: {
          where: {
            course: {
              teacherId: staff.id,
              deletedAt: null
            }
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { rollNo: 'asc' }
    });

    console.log(`✅ Found ${students.length} students in batches: ${uniqueBatches.join(', ')}`);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error("Get staff students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff students"
    });
  }
};

export const getStaffTodaySchedule = async (req, res) => {
  res.json({ success: true, data: [] });
};

export const createStaffCourse = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    const { name, code, semester, department, description, batch, credits } = req.body;

    if (!name || !code || !semester || !department) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, code, semester, department"
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: `Course with code "${code}" already exists`
      });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        semester: parseInt(semester),
        department,
        description: description || null,
        batch: batch || null,
        credits: credits || 3,
        teacherId: staff.id,
        status: 'active'
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
    console.error("Create staff course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course"
    });
  }
};

export const getStaffCourseById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(id),
        teacherId: staff.id,
        deletedAt: null
      },
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
          include: {
            student: true
          }
        },
        lessons: {
          include: {
            topics: {
              include: {
                materials: true
              }
            },
            materials: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const formattedCourse = {
      ...course,
      lessons: course.lessons.map(lesson => ({
        ...lesson,
        subjects: lesson.topics || []
      }))
    };

    res.json({
      success: true,
      data: formattedCourse
    });
  } catch (error) {
    console.error("Get staff course by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course"
    });
  }
};

export const updateStaffCourse = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        id: parseInt(id),
        teacherId: staff.id,
        deletedAt: null
      }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to update it"
      });
    }

    const { name, code, semester, department, description, batch, credits } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingCourse.name,
        code: code || existingCourse.code,
        semester: semester ? parseInt(semester) : existingCourse.semester,
        department: department || existingCourse.department,
        description: description !== undefined ? description : existingCourse.description,
        batch: batch !== undefined ? batch : existingCourse.batch,
        credits: credits !== undefined ? credits : existingCourse.credits
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
    console.error("Update staff course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course"
    });
  }
};

export const deleteStaffCourse = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(id),
        teacherId: staff.id,
        deletedAt: null
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to delete it"
      });
    }

    await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (error) {
    console.error("Delete staff course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course"
    });
  }
};