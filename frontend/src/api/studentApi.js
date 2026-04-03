import axiosInstance from "./axiosConfig";

const studentApi = {
  // Get all students (admin) - still required for admin panel
  getStudents: async (includeTrashed = false) => {
    try {
      const params = includeTrashed ? { includeTrashed: 'true' } : {};
      const response = await axiosInstance.get("/students", { params });
      console.log("Get students response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  },

  // Get teacher's students (staff route)
  getTeacherStudents: async () => {
    try {
      const response = await axiosInstance.get("/students/staff/all");
      console.log("Get teacher students response:", response.data);
      if (response.data?.success && response.data?.data) {
        return response.data.data.students || response.data.data || [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching teacher students:", error);
      return [];
    }
  },

  // Get batch options from staff-allowed students list
  getTeacherStudentBatches: async () => {
    try {
      const response = await axiosInstance.get("/students/staff/batches");
      console.log("Get teacher student batches response:", response.data);
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching teacher student batches:", error);
      return [];
    }
  },

  // Get trashed students (soft deleted)
  getTrashedStudents: async () => {
    try {
      const response = await axiosInstance.get("/students/trash");
      console.log("Get trashed students response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching trashed students:", error);
      throw error;
    }
  },

  // Get student dashboard data
  getDashboard: async () => {
    try {
      console.log("📡 Fetching student dashboard...");
      const response = await axiosInstance.get("/students/dashboard");
      console.log("📥 Dashboard response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching dashboard:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get student courses
  getCourses: async () => {
    try {
      console.log("📡 Fetching student courses...");
      const response = await axiosInstance.get("/students/courses");
      console.log("📥 Courses response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching student courses:", error);
      throw error;
    }
  },

  // Get detailed course information for enrolled student
  getCourseDetail: async (courseId) => {
    try {
      console.log(`📡 Fetching course detail for course ${courseId}...`);
      const response = await axiosInstance.get(`/students/courses/${courseId}`);
      console.log("📥 Course detail response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching course detail:", error);
      throw error;
    }
  },

  // Get student attendance
  getAttendance: async () => {
    try {
      const response = await axiosInstance.get("/students/attendance");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      throw error;
    }
  },

  // Get student grades
  getGrades: async () => {
    try {
      const response = await axiosInstance.get("/students/grades");
      // Ensure stats is always an object with safe defaults
      const data = response.data || {};
      data.grades = Array.isArray(data.grades) ? data.grades : [];
      data.stats = typeof data.stats === 'object' && data.stats !== null ? data.stats : { cgpa: 0, totalCredits: 0, rank: 0 };
      return data;
    } catch (error) {
      console.error("❌ Error fetching grades:", error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/students/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error fetching student:", error);
      throw error;
    }
  },

  // Create new student
  createStudent: async (data) => {
    try {
      console.log("Creating student with data:", JSON.stringify(data, null, 2));
      const response = await axiosInstance.post("/students", data);
      console.log("Create student response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create student");
    } catch (error) {
      console.error("Error creating student:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show the actual error message from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Update student
  updateStudent: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/students/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  },

  // Soft delete student (move to trash)
  softDeleteStudent: async (id) => {
    try {
      const response = await axiosInstance.delete(`/students/${id}`);
      console.log(`🗑️ Student (ID: ${id}) moved to trash:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to move student to trash");
    } catch (error) {
      console.error("❌ Error soft deleting student:", error);
      throw error;
    }
  },

  // Restore student from trash
  restoreStudent: async (id) => {
    try {
      const response = await axiosInstance.post(`/students/${id}/restore`);
      console.log(`🔄 Student (ID: ${id}) restored:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to restore student");
    } catch (error) {
      console.error("❌ Error restoring student:", error);
      throw error;
    }
  },

  // Permanently delete student
  permanentDeleteStudent: async (id) => {
    try {
      const response = await axiosInstance.delete(`/students/${id}/permanent`);
      console.log(`🗑️ Student (ID: ${id}) permanently deleted:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to permanently delete student");
    } catch (error) {
      console.error("❌ Error permanently deleting student:", error);
      throw error;
    }
  },

  // ========== ALIAS METHODS for backward compatibility ==========

  // Delete student (alias for soft delete - moves to trash)
  deleteStudent: async (id) => {
    return studentApi.softDeleteStudent(id);
  },

  // Get all students (alias - excludes trashed by default)
  getAll: async () => {
    return studentApi.getStudents(false);
  },

  // Get trashed students (alias)
  getTrashed: async () => {
    return studentApi.getTrashedStudents();
  },

  // Restore (alias)
  restore: async (id) => {
    return studentApi.restoreStudent(id);
  },

  // Permanent delete (alias)
  permanentDelete: async (id) => {
    return studentApi.permanentDeleteStudent(id);
  }
};

export default studentApi;