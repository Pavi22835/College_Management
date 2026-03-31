import axiosInstance from "./axiosConfig";

const staffApi = {
  // ========== STAFF MANAGEMENT (ADMIN) ==========

  // Get all staff (Admin) - Excludes deleted by default
  getStaff: async (includeTrashed = false) => {
    try {
      const params = includeTrashed ? { includeTrashed: 'true' } : {};
      const response = await axiosInstance.get("/admin/staff", { params });
      console.log("📊 Get staff response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching staff:", {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // Get all staff (alias for getStaff)
  getAll: async () => {
    return staffApi.getStaff(false); // Exclude trashed by default
  },

  // Get trashed staff (Admin)
  getTrashed: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/trash");
      console.log("📊 Get trashed staff response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching trashed staff:", error);
      throw error;
    }
  },

  // Get staff by role
  getStaffByRole: async (role) => {
    try {
      const response = await axiosInstance.get("/admin/staff", { 
        params: { role: role.toUpperCase() } 
      });
      console.log(`📊 Get staff by role (${role}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error fetching staff by role (${role}):`, error);
      throw error;
    }
  },

  // Get HODs (Head of Departments)
  getHODs: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/hods");
      console.log("📊 Get HODs response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching HODs:", error);
      throw error;
    }
  },

  // Get Faculty Members (excluding HODs and Mentors)
  getFaculty: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/faculty");
      console.log("📊 Get Faculty response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching faculty:", error);
      throw error;
    }
  },

  // Get Mentors
  getMentors: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/mentors");
      console.log("📊 Get Mentors response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching mentors:", error);
      throw error;
    }
  },

  // Get staff by department
  getStaffByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get("/admin/staff", { 
        params: { department } 
      });
      console.log(`📊 Get staff by department (${department}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error fetching staff by department (${department}):`, error);
      throw error;
    }
  },

  // Get staff by designation
  getStaffByDesignation: async (designation) => {
    try {
      const response = await axiosInstance.get("/admin/staff", { 
        params: { designation } 
      });
      console.log(`📊 Get staff by designation (${designation}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error fetching staff by designation (${designation}):`, error);
      throw error;
    }
  },

  // Get teacher by ID (Admin)
  getStaffById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/staff/${id}`);
      console.log(`📊 Get staff by ID (${id}) response:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("❌ Error fetching staff by ID:", error);
      throw error;
    }
  },

  // Create new staff member (Admin)
  createStaff: async (data) => {
    try {
      console.log("📤 Creating staff with data:", JSON.stringify(data, null, 2));
      
      const requiredFields = ['name', 'email', 'password', 'department', 'designation'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Log the staffRole specifically
      console.log(`👔 Staff Role being created: ${data.staffRole || 'Not specified (default will apply)'}`);
      
      const response = await axiosInstance.post("/admin/staff", data);
      console.log("✅ Create staff response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create staff");
    } catch (error) {
      console.error("❌ Error creating staff:", {
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

  // Update staff member (Admin)
  updateStaff: async (id, data) => {
    try {
      console.log(`📤 Updating staff (ID: ${id}) with data:`, JSON.stringify(data, null, 2));
      
      const response = await axiosInstance.put(`/admin/staff/${id}`, data);
      console.log("✅ Update staff response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update staff");
    } catch (error) {
      console.error("❌ Error updating staff:", error);
      throw error;
    }
  },

  // Soft delete staff member - move to trash (Admin)
  deleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/staff/${id}`);
      console.log(`🗑️ Soft delete staff (ID: ${id}) moved to trash response:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to move staff to trash");
    } catch (error) {
      console.error("❌ Error soft deleting staff:", error);
      throw error;
    }
  },

  // Restore staff from trash (Admin)
  restoreStaff: async (id) => {
    try {
      const response = await axiosInstance.post(`/admin/staff/${id}/restore`);
      console.log(`🔄 Restore staff (ID: ${id}) from trash response:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to restore staff");
    } catch (error) {
      console.error("❌ Error restoring staff:", error);
      throw error;
    }
  },

  // Permanently delete staff member (Admin)
  permanentDeleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/staff/${id}/permanent`);
      console.log(`🗑️ Permanent delete staff (ID: ${id}) response:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to permanently delete staff");
    } catch (error) {
      console.error("❌ Error permanently deleting staff:", error);
      throw error;
    }
  },

  // ========== STAFF DASHBOARD METHODS ==========

  // Get staff dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/stats");
      console.log("📊 Dashboard stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Get teacher's courses
  getCourses: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/courses");
      console.log("📊 Teacher courses response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching teacher courses:", error);
      throw error;
    }
  },

  // Get teacher's students
  getStudents: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/students");
      console.log("📊 Teacher students response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching teacher students:", error);
      throw error;
    }
  },

  // Get teacher's today's schedule
  getTodaySchedule: async () => {
    try {
      const response = await axiosInstance.get("/staff/dashboard/schedule/today");
      console.log("📊 Teacher schedule response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching teacher schedule:", error);
      throw error;
    }
  },

  // Get teacher profile (self)
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/staff/profile");
      console.log("📊 Teacher profile response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching teacher profile:", error);
      throw error;
    }
  },

  // Update teacher profile (self)
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put("/staff/profile", data);
      console.log("✅ Update profile response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating teacher profile:", error);
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
      console.log("✅ Update password response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating password:", error);
      throw error;
    }
  },

  // ========== STAFF STATISTICS ==========

  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/stats");
      console.log("📊 Staff stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching staff stats:", error);
      throw error;
    }
  },

  // Get department-wise staff count
  getDepartmentWiseCount: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/stats/departments");
      console.log("📊 Department wise staff count response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching department wise staff count:", error);
      throw error;
    }
  },

  // Get designation-wise staff count
  getDesignationWiseCount: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff/stats/designations");
      console.log("📊 Designation wise staff count response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching designation wise staff count:", error);
      throw error;
    }
  },

  // ========== ALIAS METHODS for backward compatibility ==========

  // Alias for getStaff
  getAllStaff: async () => {
    return staffApi.getStaff(false);
  },

  // Alias for createStaff
  create: async (data) => {
    return staffApi.createStaff(data);
  },

  // Alias for updateStaff
  update: async (id, data) => {
    return staffApi.updateStaff(id, data);
  },

  // Alias for deleteStaff (soft delete)
  delete: async (id) => {
    return staffApi.deleteStaff(id);
  },

  // Alias for getStaffById
  getById: async (id) => {
    return staffApi.getStaffById(id);
  },

  // Alias for restoreStaff
  restore: async (id) => {
    return staffApi.restoreStaff(id);
  },

  // Alias for permanentDeleteStaff
  permanentDelete: async (id) => {
    return staffApi.permanentDeleteStaff(id);
  },

  // Alias for getTrashed
  getTrashedStaff: async () => {
    return staffApi.getTrashed();
  }
};

export default staffApi;