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
      limit = 1000, 
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

    // Get attendance records - REMOVED markedBy relation
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
      data: attendances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message
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
      start.setMonth(start.getMonth() - 1);
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

    // Get all attendances for daily grouping (without $raw)
    const allAttendances = await prisma.attendance.findMany({
      where,
      select: {
        date: true,
        status: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Group by date manually
    const dailyMap = new Map();
    allAttendances.forEach(att => {
      const dateStr = att.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { date: att.date, present: 0, absent: 0, late: 0, total: 0 });
      }
      const dayStat = dailyMap.get(dateStr);
      dayStat.total++;
      if (att.status === 'PRESENT') dayStat.present++;
      else if (att.status === 'ABSENT') dayStat.absent++;
      else if (att.status === 'LATE') dayStat.late++;
    });

    const dailyStats = Array.from(dailyMap.values());

    // Calculate percentages
    const total = stats.reduce((acc, curr) => acc + curr._count, 0);
    const presentCount = stats.find(s => s.status === 'PRESENT')?._count || 0;
    const absentCount = stats.find(s => s.status === 'ABSENT')?._count || 0;
    const lateCount = stats.find(s => s.status === 'LATE')?._count || 0;

    // Get unique courses count
    const uniqueCourses = await prisma.attendance.groupBy({
      by: ['courseId'],
      where,
      _count: true
    });

    // Get unique students count
    const uniqueStudents = await prisma.attendance.groupBy({
      by: ['studentId'],
      where,
      _count: true
    });

    res.json({
      success: true,
      data: {
        summary: {
          total: total,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          average: total > 0 ? Math.round((presentCount / total) * 100) : 0,
          overallAverage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
          presentPercentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
          absentPercentage: total > 0 ? Math.round((absentCount / total) * 100) : 0,
          latePercentage: total > 0 ? Math.round((lateCount / total) * 100) : 0
        },
        today: {
          present: presentCount,
          absent: absentCount,
          late: lateCount
        },
        dailyStats,
        courseStats: [],
        totalCourses: uniqueCourses.length,
        totalStudents: uniqueStudents.length,
        byStatus: stats,
        daily: dailyStats
      }
    });

  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message
    });
  }
};

/* -----------------------------------------
MARK SINGLE ATTENDANCE
------------------------------------------*/
export const markSingleAttendance = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const { date, status } = req.body;
    
    // Validate required fields
    if (!courseId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and Student ID are required'
      });
    }
    
    // Validate status
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PRESENT, ABSENT, or LATE'
      });
    }
    
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        date: {
          gte: attendanceDate,
          lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    let attendance;
    
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          markedAt: new Date()
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          course: true
        }
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date: attendanceDate,
          status,
          markedAt: new Date()
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          course: true
        }
      });
    }
    
    res.json({
      success: true,
      data: attendance,
      message: `Attendance marked as ${status} successfully`
    });
    
  } catch (error) {
    console.error("Error in markSingleAttendance:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

/* -----------------------------------------
MARK BULK ATTENDANCE
------------------------------------------*/
export const markBulkAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Course ID, date, and records array are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    
    for (const record of records) {
      const { studentId, status } = record;
      
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date: {
            gte: attendanceDate,
            lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });
      
      let result;
      if (existingAttendance) {
        result = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            markedAt: new Date()
          }
        });
      } else {
        result = await prisma.attendance.create({
          data: {
            studentId: parseInt(studentId),
            courseId: parseInt(courseId),
            date: attendanceDate,
            status,
            markedAt: new Date()
          }
        });
      }
      results.push(result);
    }

    const presentCount = results.filter(r => r.status === 'PRESENT').length;
    const absentCount = results.filter(r => r.status === 'ABSENT').length;
    const lateCount = results.filter(r => r.status === 'LATE').length;

    res.json({
      success: true,
      data: {
        courseId: parseInt(courseId),
        date: attendanceDate,
        total: results.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        records: results
      },
      message: `Attendance marked successfully for ${results.length} students`
    });

  } catch (error) {
    console.error("Error in markBulkAttendance:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bulk attendance',
      error: error.message
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

    res.json({
      success: true,
      data: {
        date,
        total: attendances.length,
        attendances
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
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

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

    // Calculate student statistics
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

    const where = {
      studentId: Number(studentId)
    };
    if (courseId) where.courseId = Number(courseId);

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
        attendances
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
   TEACHER/STAFF METHODS
   ======================================== */

/* -----------------------------------------
MARK ATTENDANCE (TEACHER)
------------------------------------------*/
export const markAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Course ID, date, and records array are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    
    for (const record of records) {
      const { studentId, status } = record;
      
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date: {
            gte: attendanceDate,
            lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });
      
      let result;
      if (existingAttendance) {
        result = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            markedAt: new Date()
          }
        });
      } else {
        result = await prisma.attendance.create({
          data: {
            studentId: parseInt(studentId),
            courseId: parseInt(courseId),
            date: attendanceDate,
            status,
            markedAt: new Date()
          }
        });
      }
      results.push(result);
    }

    const presentCount = results.filter(r => r.status === 'PRESENT').length;
    const absentCount = results.filter(r => r.status === 'ABSENT').length;
    const lateCount = results.filter(r => r.status === 'LATE').length;

    res.json({
      success: true,
      data: {
        courseId: parseInt(courseId),
        date: attendanceDate,
        total: results.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        records: results
      },
      message: `Attendance marked successfully for ${results.length} students`
    });

  } catch (error) {
    console.error("Mark attendance error:", error);
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
    const { courseId } = req.params;
    const { date } = req.query;

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
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

    if (!course || course.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

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
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      select: { 
        id: true, 
        code: true, 
        name: true,
        semester: true 
      }
    });

    const courseIds = courses.map(c => c.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const [todayStats, weekStats, monthStats, courseStats] = await Promise.all([
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
    const { limit = 20 } = req.query;

    const recentAttendance = await prisma.attendance.findMany({
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