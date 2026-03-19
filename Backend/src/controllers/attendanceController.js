import prisma from "../prisma/client.js";

/* ========================================
   ADMIN METHODS
   ======================================== */

/* -----------------------------------------
GET ALL ATTENDANCE RECORDS (ADMIN)
------------------------------------------*/
export const getAllAttendance = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      courseId, 
      date, 
      studentId,
      status 
    } = req.query;

    // Build filter conditions
    const where = {};
    
    if (courseId) where.courseId = Number(courseId);
    if (studentId) where.studentId = Number(studentId);
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Get total count for pagination
    const total = await prisma.attendance.count({ where });

    // Get attendance records with pagination
    const attendances = await prisma.attendance.findMany({
      where,
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
            name: true,
            department: true,
            semester: true
          }
        },
        markedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { date: "desc" },
        { markedAt: "desc" }
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: {
        attendances,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records"
    });
  }
};

/* -----------------------------------------
GET ATTENDANCE STATISTICS (ADMIN)
------------------------------------------*/
export const getAttendanceStats = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    // Date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate) {
      start.setMonth(start.getMonth() - 1); // Default to last 30 days
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Build filter
    const where = {
      date: {
        gte: start,
        lte: end
      }
    };
    if (courseId) where.courseId = Number(courseId);

    // Get overall statistics
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Get daily statistics
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(date) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late
      FROM attendance
      WHERE date >= ${start} AND date <= ${end}
      ${courseId ? prisma.$raw`AND courseId = ${Number(courseId)}` : prisma.$raw``}
      GROUP BY DATE(date)
      ORDER BY date DESC
    `;

    // Calculate percentages
    const total = stats.reduce((acc, curr) => acc + curr._count, 0);
    const presentCount = stats.find(s => s.status === 'PRESENT')?._count || 0;
    const absentCount = stats.find(s => s.status === 'ABSENT')?._count || 0;
    const lateCount = stats.find(s => s.status === 'LATE')?._count || 0;

    res.json({
      success: true,
      data: {
        summary: {
          total,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          presentPercentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
          absentPercentage: total > 0 ? Math.round((absentCount / total) * 100) : 0,
          latePercentage: total > 0 ? Math.round((lateCount / total) * 100) : 0
        },
        byStatus: stats,
        daily: dailyStats
      }
    });

  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics"
    });
  }
};

/* -----------------------------------------
GET ATTENDANCE BY DATE (ADMIN)
------------------------------------------*/
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { courseId } = req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const where = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    if (courseId) where.courseId = Number(courseId);

    const attendances = await prisma.attendance.findMany({
      where,
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
            name: true,
            department: true
          }
        }
      },
      orderBy: [
        { courseId: "asc" },
        { student: { name: "asc" } }
      ]
    });

    // Group by course
    const byCourse = {};
    attendances.forEach(a => {
      const courseKey = a.course.code;
      if (!byCourse[courseKey]) {
        byCourse[courseKey] = {
          course: a.course,
          students: []
        };
      }
      byCourse[courseKey].students.push({
        id: a.student.id,
        name: a.student.name,
        rollNo: a.student.rollNo,
        status: a.status,
        markedAt: a.markedAt
      });
    });

    res.json({
      success: true,
      data: {
        date,
        total: attendances.length,
        byCourse
      }
    });

  } catch (error) {
    console.error("Get attendance by date error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance by date"
    });
  }
};

/* -----------------------------------------
GET ATTENDANCE BY COURSE (ADMIN)
------------------------------------------*/
export const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    // Date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate) {
      start.setDate(start.getDate() - 30); // Last 30 days
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
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

    if (!course || course.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where: {
        courseId: Number(courseId),
        date: {
          gte: start,
          lte: end
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
      },
      orderBy: [
        { date: "desc" },
        { student: { name: "asc" } }
      ]
    });

    // Group by date
    const byDate = {};
    attendances.forEach(a => {
      const dateStr = a.date.toISOString().split('T')[0];
      if (!byDate[dateStr]) {
        byDate[dateStr] = {
          date: a.date,
          records: []
        };
      }
      byDate[dateStr].records.push({
        studentId: a.student.id,
        studentName: a.student.name,
        rollNo: a.student.rollNo,
        status: a.status
      });
    });

    // Calculate statistics per student
    const studentStats = {};
    attendances.forEach(a => {
      if (!studentStats[a.student.id]) {
        studentStats[a.student.id] = {
          studentId: a.student.id,
          studentName: a.student.name,
          rollNo: a.student.rollNo,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      studentStats[a.student.id].total++;
      studentStats[a.student.id][a.status.toLowerCase()]++;
    });

    // Calculate percentages
    Object.values(studentStats).forEach(stat => {
      stat.percentage = Math.round((stat.present / stat.total) * 100) || 0;
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          code: course.code,
          name: course.name,
          department: course.department,
          semester: course.semester,
          teacher: course.teacher
        },
        dateRange: {
          start,
          end
        },
        summary: {
          totalRecords: attendances.length,
          uniqueDates: Object.keys(byDate).length,
          totalStudents: Object.keys(studentStats).length
        },
        byDate,
        studentStats: Object.values(studentStats)
      }
    });

  } catch (error) {
    console.error("Get attendance by course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance by course"
    });
  }
};

/* -----------------------------------------
GET ATTENDANCE BY STUDENT (ADMIN)
------------------------------------------*/
export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, limit = 50 } = req.query;

    // Build filter
    const where = {
      studentId: Number(studentId)
    };
    if (courseId) where.courseId = Number(courseId);

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!student || student.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            department: true,
            semester: true
          }
        }
      },
      orderBy: { date: "desc" },
      take: Number(limit)
    });

    // Group by course
    const byCourse = {};
    attendances.forEach(a => {
      const courseKey = a.course.code;
      if (!byCourse[courseKey]) {
        byCourse[courseKey] = {
          course: a.course,
          records: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0
          }
        };
      }
      byCourse[courseKey].records.push({
        date: a.date,
        status: a.status,
        markedAt: a.markedAt
      });
      byCourse[courseKey].stats.total++;
      byCourse[courseKey].stats[a.status.toLowerCase()]++;
    });

    // Calculate percentages per course
    Object.values(byCourse).forEach(course => {
      course.stats.percentage = Math.round((course.stats.present / course.stats.total) * 100) || 0;
    });

    // Overall statistics
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          course: student.course,
          semester: student.semester,
          batch: student.batch
        },
        summary: {
          total,
          present,
          absent,
          late,
          attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0
        },
        byCourse,
        recent: attendances.slice(0, 10)
      }
    });

  } catch (error) {
    console.error("Get attendance by student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance by student"
    });
  }
};

/* ========================================
   TEACHER METHODS
   ======================================== */

/* -----------------------------------------
MARK ATTENDANCE (TEACHER)
------------------------------------------*/
export const markAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id; // From auth middleware
    const { courseId, date, records } = req.body;

    // Validate input
    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Course ID, date, and records array are required"
      });
    }

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

    // Verify teacher owns this course
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
        message: "You don't have permission to mark attendance for this course"
      });
    }

    // Parse date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if attendance already marked for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        courseId: Number(courseId),
        date: {
          gte: attendanceDate,
          lt: nextDay
        }
      }
    });

    // Use transaction to mark all attendance records
    const result = await prisma.$transaction(async (tx) => {
      // If attendance exists, delete old records first (if teacher wants to override)
      if (existingAttendance && req.body.override === true) {
        await tx.attendance.deleteMany({
          where: {
            courseId: Number(courseId),
            date: {
              gte: attendanceDate,
              lt: nextDay
            }
          }
        });
      }

      // Create new attendance records
      const createdRecords = await Promise.all(
        records.map(record => 
          tx.attendance.upsert({
            where: {
              studentId_courseId_date: {
                studentId: Number(record.studentId),
                courseId: Number(courseId),
                date: attendanceDate
              }
            },
            update: {
              status: record.status,
              markedById: teacher.userId,
              markedAt: new Date()
            },
            create: {
              studentId: Number(record.studentId),
              courseId: Number(courseId),
              date: attendanceDate,
              status: record.status,
              markedById: teacher.userId
            }
          })
        )
      );

      return createdRecords;
    });

    // Get statistics for response
    const presentCount = result.filter(r => r.status === 'PRESENT').length;
    const absentCount = result.filter(r => r.status === 'ABSENT').length;
    const lateCount = result.filter(r => r.status === 'LATE').length;

    res.json({
      success: true,
      data: {
        courseId: Number(courseId),
        date: attendanceDate,
        total: result.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        records: result
      },
      message: `Attendance marked successfully for ${result.length} students`
    });

  } catch (error) {
    console.error("Mark attendance error:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for some students on this date"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to mark attendance"
    });
  }
};

/* -----------------------------------------
GET COURSE ATTENDANCE FOR TEACHER
------------------------------------------*/
export const getTeacherCourseAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { date } = req.query;

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

    // Verify teacher owns this course
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
                }
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "Course not found or access denied"
      });
    }

    // If date is provided, get attendance for that date
    let attendanceRecords = [];
    let selectedDate = null;

    if (date) {
      selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      attendanceRecords = await prisma.attendance.findMany({
        where: {
          courseId: Number(courseId),
          date: {
            gte: selectedDate,
            lt: nextDay
          }
        }
      });
    }

    // Combine student list with attendance status
    const studentsWithAttendance = course.enrollments.map(enrollment => {
      const attendance = attendanceRecords.find(a => a.studentId === enrollment.student.id);
      return {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        rollNo: enrollment.student.rollNo,
        phone: enrollment.student.phone,
        status: attendance?.status || "NOT_MARKED",
        markedAt: attendance?.markedAt || null
      };
    });

    // Get recent attendance dates
    const recentDates = await prisma.attendance.findMany({
      where: {
        courseId: Number(courseId)
      },
      select: {
        date: true
      },
      distinct: ['date'],
      orderBy: {
        date: "desc"
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          code: course.code,
          name: course.name,
          department: course.department,
          semester: course.semester,
          schedule: course.schedule,
          room: course.room
        },
        date: selectedDate,
        totalStudents: course.enrollments.length,
        markedCount: attendanceRecords.length,
        students: studentsWithAttendance,
        recentDates: recentDates.map(d => d.date)
      }
    });

  } catch (error) {
    console.error("Get teacher course attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course attendance"
    });
  }
};

/* -----------------------------------------
GET TEACHER ATTENDANCE STATS
------------------------------------------*/
export const getTeacherAttendanceStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

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

    // Get all courses for this teacher
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { 
        id: true, 
        code: true, 
        name: true,
        semester: true 
      }
    });

    const courseIds = courses.map(c => c.id);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Get statistics for different periods
    const [todayStats, weekStats, monthStats, courseStats] = await Promise.all([
      // Today's stats
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          courseId: { in: courseIds },
          date: {
            gte: today,
            lt: tomorrow
          }
        },
        _count: true
      }),

      // This week's stats
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          courseId: { in: courseIds },
          date: {
            gte: weekStart,
            lt: weekEnd
          }
        },
        _count: true
      }),

      // This month's stats
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          courseId: { in: courseIds },
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _count: true
      }),

      // Per course stats
      Promise.all(courses.map(async (course) => {
        const stats = await prisma.attendance.groupBy({
          by: ['status'],
          where: {
            courseId: course.id
          },
          _count: true
        });

        const total = stats.reduce((acc, curr) => acc + curr._count, 0);
        const present = stats.find(s => s.status === 'PRESENT')?._count || 0;

        return {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          semester: course.semester,
          stats,
          total,
          attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
      }))
    ]);

    // Helper function to format stats
    const formatStats = (stats) => {
      const total = stats.reduce((acc, curr) => acc + curr._count, 0);
      const present = stats.find(s => s.status === 'PRESENT')?._count || 0;
      const absent = stats.find(s => s.status === 'ABSENT')?._count || 0;
      const late = stats.find(s => s.status === 'LATE')?._count || 0;

      return {
        total,
        present,
        absent,
        late,
        presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalCourses: courses.length,
          today: formatStats(todayStats),
          thisWeek: formatStats(weekStats),
          thisMonth: formatStats(monthStats)
        },
        byCourse: courseStats
      }
    });

  } catch (error) {
    console.error("Get teacher attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics"
    });
  }
};

/* -----------------------------------------
GET TEACHER RECENT ATTENDANCE
------------------------------------------*/
export const getTeacherRecentAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { limit = 20 } = req.query;

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

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        deletedAt: null
      },
      select: { id: true }
    });

    const courseIds = courses.map(c => c.id);

    // Get recent attendance records
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds }
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
      },
      orderBy: {
        markedAt: "desc"
      },
      take: Number(limit)
    });

    res.json({
      success: true,
      data: recentAttendance
    });

  } catch (error) {
    console.error("Get teacher recent attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent attendance"
    });
  }
};