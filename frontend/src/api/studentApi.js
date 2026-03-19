import axiosInstance from "./axiosConfig";

const studentApi = {
  // Get all students
  getStudents: async () => {
    try {
      const response = await axiosInstance.get("/students");
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

  // Create new student - UPDATED with better error handling
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

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await axiosInstance.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  }
};

export default studentApi;