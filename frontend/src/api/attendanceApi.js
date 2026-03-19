import axiosInstance from "./axiosConfig";

const attendanceApi = {
  /* ========================================
     ADMIN METHODS
     ======================================== */

  // Get all attendance records with pagination and filters (Admin)
  getAllAttendance: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.date) queryParams.append('date', params.date);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      // ADDED /admin back to the path (your backend uses /admin)
      const url = `/attendance/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching attendance records:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance statistics (Admin)
  getAttendanceStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      // ADDED /admin back to the path
      const url = `/attendance/admin/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching attendance stats:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance by specific date (Admin)
  getAttendanceByDate: async (date, courseId = null) => {
    try {
      // ADDED /admin back to the path
      const url = `/attendance/admin/date/${date}${courseId ? `?courseId=${courseId}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for date ${date}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance by course (Admin)
  getAttendanceByCourse: async (courseId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit);

      // ADDED /admin back to the path
      const url = `/attendance/admin/course/${courseId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance by student (Admin)
  getAttendanceByStudent: async (studentId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.limit) queryParams.append('limit', params.limit);

      // ADDED /admin back to the path
      const url = `/attendance/admin/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for student ${studentId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /* ========================================
     TEACHER METHODS - KEEP EXACTLY AS IS
     ======================================== */

  // Mark attendance for a course (Teacher)
  markAttendance: async (courseId, date, records, override = false) => {
    try {
      console.log("📤 Marking attendance:", { courseId, date, recordsCount: records.length, override });
      
      const res = await axiosInstance.post("/attendance/mark", {
        courseId,
        date,
        records,
        override
      });
      
      console.log("📥 Mark attendance response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error marking attendance:", error.response?.data || error.message);
      throw error;
    }
  },

  // Mark single student attendance (Teacher)
  markSingleAttendance: async (courseId, date, studentId, status) => {
    try {
      const records = [{ studentId, status }];
      return await attendanceApi.markAttendance(courseId, date, records, false);
    } catch (error) {
      console.error("❌ Error marking single attendance:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance for a specific course (Teacher)
  getCourseAttendance: async (courseId, date = null) => {
    try {
      const url = `/attendance/course/${courseId}${date ? `?date=${date}` : ''}`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get teacher's attendance statistics (Teacher)
  getTeacherAttendanceStats: async () => {
    try {
      const res = await axiosInstance.get("/attendance/staff/stats");
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching teacher attendance stats:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get recent attendance records (Teacher)
  getRecentAttendance: async (limit = 20) => {
    try {
      const res = await axiosInstance.get(`/attendance/staff/recent?limit=${limit}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching recent attendance:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get today's attendance for teacher's courses (Teacher)
  getTodayAttendance: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axiosInstance.get(`/attendance/staff/recent?date=${today}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching today's attendance:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get attendance summary for a course (Teacher)
  getCourseAttendanceSummary: async (courseId) => {
    try {
      const res = await axiosInstance.get(`/attendance/course/${courseId}/summary`);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance summary for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /* ========================================
     BULK OPERATIONS
     ======================================== */

  // Bulk mark attendance (Teacher)
  bulkMarkAttendance: async (attendanceData) => {
    try {
      const results = await Promise.all(
        attendanceData.map(data => 
          attendanceApi.markAttendance(data.courseId, data.date, data.records, data.override)
        )
      );
      return results;
    } catch (error) {
      console.error("❌ Error bulk marking attendance:", error.response?.data || error.message);
      throw error;
    }
  },

  // Export attendance report (Admin/Teacher)
  exportAttendanceReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.format) queryParams.append('format', params.format);

      const res = await axiosInstance.get(`/attendance/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      return res.data;
    } catch (error) {
      console.error("❌ Error exporting attendance report:", error.response?.data || error.message);
      throw error;
    }
  },

  /* ========================================
     ANALYTICS METHODS
     ======================================== */

  // Get student attendance analytics (Teacher)
  getStudentAttendanceAnalytics: async (studentId, courseId = null) => {
    try {
      const url = courseId 
        ? `/attendance/analytics/student/${studentId}/course/${courseId}`
        : `/attendance/analytics/student/${studentId}`;
      
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance analytics for student ${studentId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get course attendance analytics (Teacher)
  getCourseAttendanceAnalytics: async (courseId) => {
    try {
      const res = await axiosInstance.get(`/attendance/analytics/course/${courseId}`);
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance analytics for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get monthly attendance trend (Teacher)
  getMonthlyAttendanceTrend: async (courseId, year, month) => {
    try {
      const res = await axiosInstance.get(`/attendance/trend/${courseId}`, {
        params: { year, month }
      });
      return res.data;
    } catch (error) {
      console.error(`❌ Error fetching monthly attendance trend:`, error.response?.data || error.message);
      throw error;
    }
  },

  /* ========================================
     UTILITY METHODS
     ======================================== */

  // Get attendance status options
  getAttendanceStatuses: () => {
    return [
      { value: 'PRESENT', label: 'Present', color: '#10b981', icon: '✅' },
      { value: 'ABSENT', label: 'Absent', color: '#ef4444', icon: '❌' },
      { value: 'LATE', label: 'Late', color: '#f59e0b', icon: '⏰' },
      { value: 'HOLIDAY', label: 'Holiday', color: '#6b7280', icon: '🏖️' },
      { value: 'NOT_MARKED', label: 'Not Marked', color: '#9ca3af', icon: '❓' }
    ];
  },

  // Format attendance data for charts
  formatAttendanceForChart: (attendanceData) => {
    const statuses = attendanceApi.getAttendanceStatuses();
    const counts = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      HOLIDAY: 0
    };

    attendanceData.forEach(record => {
      if (counts.hasOwnProperty(record.status)) {
        counts[record.status]++;
      }
    });

    return statuses.map(status => ({
      name: status.label,
      value: counts[status.value] || 0,
      color: status.color
    }));
  },

  // Calculate attendance percentage
  calculateAttendancePercentage: (present, total) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  },

  // Get attendance color based on percentage
  getAttendanceColor: (percentage) => {
    if (percentage >= 85) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  },

  // Get attendance status badge class
  getAttendanceBadgeClass: (status) => {
    const classes = {
      'PRESENT': 'badge-success',
      'ABSENT': 'badge-danger',
      'LATE': 'badge-warning',
      'HOLIDAY': 'badge-secondary',
      'NOT_MARKED': 'badge-light'
    };
    return classes[status] || 'badge-light';
  },

  /* ========================================
     DASHBOARD COMPOSITE METHOD
     ======================================== */

  // Get all attendance data for staff dashboard
  getStaffDashboardAttendance: async () => {
    try {
      const [stats, recent, today] = await Promise.all([
        attendanceApi.getTeacherAttendanceStats().catch(err => {
          console.warn("Attendance stats fetch failed:", err);
          return { data: { summary: { today: { present: 0, total: 0 } } } };
        }),
        attendanceApi.getRecentAttendance(10).catch(err => {
          console.warn("Recent attendance fetch failed:", err);
          return { data: [] };
        }),
        attendanceApi.getTodayAttendance().catch(err => {
          console.warn("Today's attendance fetch failed:", err);
          return { data: [] };
        })
      ]);

      return {
        stats: stats?.data || {},
        recent: recent?.data || [],
        today: today?.data || [],
        summary: {
          todayPresent: stats?.data?.summary?.today?.present || 0,
          todayTotal: stats?.data?.summary?.today?.total || 0,
          todayPercentage: stats?.data?.summary?.today?.presentPercentage || 0,
          weekAverage: stats?.data?.summary?.thisWeek?.presentPercentage || 0,
          monthAverage: stats?.data?.summary?.thisMonth?.presentPercentage || 0
        }
      };
    } catch (error) {
      console.error("❌ Error fetching staff dashboard attendance:", error);
      throw error;
    }
  }
};

export default attendanceApi;
