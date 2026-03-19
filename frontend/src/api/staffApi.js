import axiosInstance from "./axiosConfig";

const staffApi = {
  // Get all staff (Admin)
  getStaff: async () => {
    try {
      const response = await axiosInstance.get("/staff");
      console.log("Get staff response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching teachers:", {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // Get teacher by ID (Admin)
  getStaffById: async (id) => {
    try {
      const response = await axiosInstance.get(`/staff/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error fetching teacher:", error);
      throw error;
    }
  },

  // Create new teacher (Admin)
  createStaff: async (data) => {
    try {
      console.log("Creating teacher with data:", JSON.stringify(data, null, 2));
      
      const requiredFields = ['name', 'email', 'password', 'department', 'designation'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await axiosInstance.post("/staff", data);
      console.log("Create teacher response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create teacher");
    } catch (error) {
      console.error("Error creating teacher:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Update teacher (Admin)
  updateStaff: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/staff/${id}`, data);
      console.log("Update teacher response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update teacher");
    } catch (error) {
      console.error("Error updating teacher:", error);
      throw error;
    }
  },

  // Delete teacher (Admin)
  deleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/staff/${id}`);
      console.log("Delete teacher response:", response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete teacher");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error;
    }
  },

  // ========== STAFF DASHBOARD METHODS ==========

  // Get staff dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/stats");
      console.log("Dashboard stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Get teacher's courses
  getCourses: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/courses");
      console.log("Teacher courses response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      throw error;
    }
  },

  // Get teacher's students
  getStudents: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/students");
      console.log("Teacher students response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher students:", error);
      throw error;
    }
  },

  // Get teacher's today's schedule
  getTodaySchedule: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/schedule/today");
      console.log("Teacher schedule response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher schedule:", error);
      throw error;
    }
  },

  // Get teacher profile (self)
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/staff/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      throw error;
    }
  },

  // Update teacher profile (self)
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put("/staff/profile", data);
      return response.data;
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      throw error;
    }
  },

  // Update teacher password (self)
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.put("/staff/password", {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  // Restore teacher from trash (Admin)
  restoreTeacher: async (id) => {
    try {
      const response = await axiosInstance.post(`/staff/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error("Error restoring teacher:", error);
      throw error;
    }
  },

  // Permanently delete teacher (Admin)
  permanentdeleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/staff/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error("Error permanently deleting teacher:", error);
      throw error;
    }
  }
};

export default staffApi;
