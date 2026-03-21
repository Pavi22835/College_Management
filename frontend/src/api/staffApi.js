import axiosInstance from "./axiosConfig";

const staffApi = {
  // ========== STAFF MANAGEMENT (ADMIN) ==========

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
      console.error("Error fetching staff:", {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // Get all staff (alias for getStaff)
  getAll: async () => {
    return staffApi.getStaff();
  },

  // Get staff by role
  getStaffByRole: async (role) => {
    try {
      const response = await axiosInstance.get("/staff", { 
        params: { role: role.toUpperCase() } 
      });
      console.log(`Get staff by role (${role}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching staff by role (${role}):`, error);
      throw error;
    }
  },

  // Get HODs (Head of Departments)
  getHODs: async () => {
    try {
      const response = await axiosInstance.get("/staff/hods");
      console.log("Get HODs response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching HODs:", error);
      // Fallback: filter from all staff if endpoint doesn't exist
      try {
        const allStaff = await staffApi.getStaff();
        const hods = allStaff.filter(staff => 
          staff.designation?.toLowerCase().includes('head') || 
          staff.designation?.toLowerCase().includes('hod') ||
          staff.role === 'HOD'
        );
        return hods;
      } catch (fallbackError) {
        console.error("Fallback error fetching HODs:", fallbackError);
        throw error;
      }
    }
  },

  // Get Faculty Members (excluding HODs and Mentors)
  getFaculty: async () => {
    try {
      const response = await axiosInstance.get("/staff/faculty");
      console.log("Get Faculty response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching faculty:", error);
      // Fallback: filter from all staff if endpoint doesn't exist
      try {
        const allStaff = await staffApi.getStaff();
        const faculty = allStaff.filter(staff => 
          staff.role === 'FACULTY' || 
          (staff.designation && 
           !staff.designation.toLowerCase().includes('head') &&
           !staff.designation.toLowerCase().includes('hod') &&
           !staff.designation.toLowerCase().includes('mentor'))
        );
        return faculty;
      } catch (fallbackError) {
        console.error("Fallback error fetching faculty:", fallbackError);
        throw error;
      }
    }
  },

  // Get Mentors
  getMentors: async () => {
    try {
      const response = await axiosInstance.get("/staff/mentors");
      console.log("Get Mentors response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching mentors:", error);
      // Fallback: filter from all staff if endpoint doesn't exist
      try {
        const allStaff = await staffApi.getStaff();
        const mentors = allStaff.filter(staff => 
          staff.role === 'MENTOR' || 
          staff.designation?.toLowerCase().includes('mentor')
        );
        return mentors;
      } catch (fallbackError) {
        console.error("Fallback error fetching mentors:", fallbackError);
        throw error;
      }
    }
  },

  // Get staff by department
  getStaffByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get("/staff", { 
        params: { department } 
      });
      console.log(`Get staff by department (${department}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching staff by department (${department}):`, error);
      throw error;
    }
  },

  // Get staff by designation
  getStaffByDesignation: async (designation) => {
    try {
      const response = await axiosInstance.get("/staff", { 
        params: { designation } 
      });
      console.log(`Get staff by designation (${designation}) response:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching staff by designation (${designation}):`, error);
      throw error;
    }
  },

  // Get teacher by ID (Admin)
  getStaffById: async (id) => {
    try {
      const response = await axiosInstance.get(`/staff/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error fetching staff by ID:", error);
      throw error;
    }
  },

  // Create new staff member (Admin)
  createStaff: async (data) => {
    try {
      console.log("Creating staff with data:", JSON.stringify(data, null, 2));
      
      const requiredFields = ['name', 'email', 'password', 'department', 'designation'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await axiosInstance.post("/staff", data);
      console.log("Create staff response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create staff");
    } catch (error) {
      console.error("Error creating staff:", {
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
      const response = await axiosInstance.put(`/staff/${id}`, data);
      console.log("Update staff response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update staff");
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  },

  // Delete staff member (Admin) - soft delete to trash
  deleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/staff/${id}`);
      console.log("Delete staff response:", response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete staff");
    } catch (error) {
      console.error("Error deleting staff:", error);
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

  // ========== TRASH & RESTORE METHODS ==========

  // Get trashed staff (Admin)
  getTrashedStaff: async () => {
    try {
      const response = await axiosInstance.get("/staff/trash");
      console.log("Get trashed staff response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching trashed staff:", error);
      throw error;
    }
  },

  // Restore staff from trash (Admin)
  restoreStaff: async (id) => {
    try {
      const response = await axiosInstance.post(`/staff/${id}/restore`);
      console.log("Restore staff response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error restoring staff:", error);
      throw error;
    }
  },

  // Permanently delete staff (Admin)
  permanentDeleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/staff/${id}/permanent`);
      console.log("Permanent delete staff response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error permanently deleting staff:", error);
      throw error;
    }
  },

  // ========== STAFF STATISTICS ==========

  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await axiosInstance.get("/staff/stats");
      console.log("Staff stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      throw error;
    }
  },

  // Get department-wise staff count
  getDepartmentWiseCount: async () => {
    try {
      const response = await axiosInstance.get("/staff/stats/departments");
      console.log("Department wise staff count response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching department wise staff count:", error);
      throw error;
    }
  },

  // Get designation-wise staff count
  getDesignationWiseCount: async () => {
    try {
      const response = await axiosInstance.get("/staff/stats/designations");
      console.log("Designation wise staff count response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching designation wise staff count:", error);
      throw error;
    }
  },

  // ========== ALIAS METHODS for backward compatibility ==========

  // Alias for getStaff
  getAllStaff: async () => {
    return staffApi.getStaff();
  },

  // Alias for createStaff
  create: async (data) => {
    return staffApi.createStaff(data);
  },

  // Alias for updateStaff
  update: async (id, data) => {
    return staffApi.updateStaff(id, data);
  },

  // Alias for deleteStaff
  delete: async (id) => {
    return staffApi.deleteStaff(id);
  },

  // Alias for getStaffById
  getById: async (id) => {
    return staffApi.getStaffById(id);
  }
};

export default staffApi;