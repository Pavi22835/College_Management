import axiosConfig from './axiosConfig.js';

// ==================== STUDENT API ====================
export const studentApi = {
  // Get all active students
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/students');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching students:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get trashed students
  getTrashed: async () => {
    try {
      const response = await axiosConfig.get('/admin/students/trash');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching trashed students:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get student by ID
  getById: async (id) => {
    try {
      const response = await axiosConfig.get(`/admin/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching student ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create new student
  create: async (data) => {
    try {
      console.log('📤 Creating student with data:', data);
      const response = await axiosConfig.post('/admin/students', data);
      console.log('📥 Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating student:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update student
  update: async (id, data) => {
    try {
      const response = await axiosConfig.put(`/admin/students/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating student ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Soft delete student (move to trash)
  delete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting student ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Restore student from trash
  restore: async (id) => {
    try {
      const response = await axiosConfig.post(`/admin/students/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error restoring student ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Permanently delete student
  permanentDelete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/students/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error permanently deleting student ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== STAFF API ====================
export const staffApi = {
  getAll: async () => {
    try {
      // Try both possible endpoints
      try {
        const response = await axiosConfig.get('/admin/staff');
        return response.data;
      } catch (err) {
        // Fallback to /staff if /admin/staff fails
        console.log('Trying fallback endpoint /staff');
        const response = await axiosConfig.get('/staff');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosConfig.get(`/admin/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching staff ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('📤 Creating staff with data:', data);
      const response = await axiosConfig.post('/admin/staff', data);
      console.log('📥 Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating staff:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axiosConfig.put(`/admin/staff/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating staff ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting staff ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get HODs
  getHODs: async () => {
    try {
      const response = await axiosConfig.get('/staff/hods');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching HODs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get Faculty
  getFaculty: async () => {
    try {
      const response = await axiosConfig.get('/staff/faculty');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching faculty:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get Mentors
  getMentors: async () => {
    try {
      const response = await axiosConfig.get('/staff/mentors');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching mentors:', error.response?.data || error.message);
      throw error;
    }
  },

  // Staff trash methods
  getTrashed: async () => {
    try {
      const response = await axiosConfig.get('/admin/staff/trash');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching trashed staff:', error.response?.data || error.message);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      const response = await axiosConfig.post(`/admin/staff/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error restoring staff ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/staff/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error permanently deleting staff ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== COURSE API ====================
export const courseApi = {
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/courses');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching courses:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosConfig.get(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching course ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axiosConfig.post('/admin/courses', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating course:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axiosConfig.put(`/admin/courses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating course ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting course ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get enrolled students for a course
  getEnrolledStudents: async (courseId) => {
    try {
      const response = await axiosConfig.get(`/admin/courses/${courseId}/students`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching enrolled students for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Assign students to course
  assignStudents: async (courseId, studentIds) => {
    try {
      const response = await axiosConfig.post(`/admin/courses/${courseId}/assign-students`, { studentIds });
      return response.data;
    } catch (error) {
      console.error(`❌ Error assigning students to course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Remove student from course
  removeStudent: async (courseId, studentId) => {
    try {
      const response = await axiosConfig.delete(`/admin/courses/${courseId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error removing student ${studentId} from course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Course trash methods
  getTrashed: async () => {
    try {
      const response = await axiosConfig.get('/admin/courses/trash');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching trashed courses:', error.response?.data || error.message);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      const response = await axiosConfig.post(`/admin/courses/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error restoring course ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/courses/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error permanently deleting course ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== BATCH API ====================
export const batchApi = {
  // Get all batches
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/batches');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching batches:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get batch by ID
  getById: async (id) => {
    try {
      const response = await axiosConfig.get(`/admin/batches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching batch ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create new batch
  create: async (data) => {
    try {
      console.log('📤 Creating batch with data:', data);
      const response = await axiosConfig.post('/admin/batches', data);
      console.log('📥 Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating batch:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update batch
  update: async (id, data) => {
    try {
      const response = await axiosConfig.put(`/admin/batches/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating batch ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete batch (soft delete)
  delete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/batches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting batch ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get students by batch
  getStudentsByBatch: async (batchId) => {
    try {
      const response = await axiosConfig.get(`/admin/batches/${batchId}/students`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching students for batch ${batchId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get courses by batch
  getCoursesByBatch: async (batchId) => {
    try {
      const response = await axiosConfig.get(`/admin/batches/${batchId}/courses`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching courses for batch ${batchId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get batch stats
  getStats: async () => {
    try {
      const response = await axiosConfig.get('/admin/batches/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching batch stats:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== ATTENDANCE API ====================
export const attendanceApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosConfig.get('/admin/attendance', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance:', error.response?.data || error.message);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await axiosConfig.get('/admin/attendance/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance stats:', error.response?.data || error.message);
      throw error;
    }
  },

  mark: async (data) => {
    try {
      const response = await axiosConfig.post('/admin/attendance', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking attendance:', error.response?.data || error.message);
      throw error;
    }
  },

  getByDate: async (date) => {
    try {
      const response = await axiosConfig.get(`/admin/attendance/date/${date}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for date ${date}:`, error.response?.data || error.message);
      throw error;
    }
  },

  getByCourse: async (courseId) => {
    try {
      const response = await axiosConfig.get(`/admin/attendance/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for course ${courseId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  getByStudent: async (studentId) => {
    try {
      const response = await axiosConfig.get(`/admin/attendance/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching attendance for student ${studentId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await axiosConfig.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== USER MANAGEMENT API ====================
export const userApi = {
  // Get all users with optional filtering
  getAll: async (role, status) => {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      const url = `/admin/users${params.toString() ? '?' + params : ''}`;
      const response = await axiosConfig.get(url);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await axiosConfig.get('/admin/users/stats');
      return response.data?.data || {};
    } catch (error) {
      console.error('❌ Error fetching user stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Activate user account
  activate: async (userId) => {
    try {
      const response = await axiosConfig.patch(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error activating user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Deactivate user account
  deactivate: async (userId) => {
    try {
      const response = await axiosConfig.patch(`/admin/users/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deactivating user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Reset user password
  resetPassword: async (userId, newPassword) => {
    try {
      const response = await axiosConfig.put(`/admin/users/${userId}/reset-password`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error resetting password for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== DEPARTMENT API ====================
export const departmentApi = {
  // Get all departments
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/departments');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching departments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get department by ID
  getById: async (id) => {
    try {
      const response = await axiosConfig.get(`/admin/departments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ Error fetching department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create new department
  create: async (data) => {
    try {
      const response = await axiosConfig.post('/admin/departments', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating department:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update department
  update: async (id, data) => {
    try {
      const response = await axiosConfig.put(`/admin/departments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete department (soft delete)
  delete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting department ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== TRASH API ====================
export const trashApi = {
  // Get all trash items
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/trash');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching trash:', error.response?.data || error.message);
      throw error;
    }
  },

  // Restore item from trash
  restore: async (trashId) => {
    try {
      const response = await axiosConfig.post(`/admin/trash/${trashId}/restore`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error restoring from trash ${trashId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Permanently delete from trash
  permanentDelete: async (trashId) => {
    try {
      const response = await axiosConfig.delete(`/admin/trash/${trashId}/permanent`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error permanently deleting ${trashId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Empty all expired trash items
  emptyTrash: async () => {
    try {
      const response = await axiosConfig.delete('/admin/trash/empty');
      return response.data;
    } catch (error) {
      console.error('❌ Error emptying trash:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== EXPORT ALL ====================
export default {
  studentApi,
  staffApi,
  courseApi,
  batchApi,
  attendanceApi,
  dashboardApi,
  userApi,
  departmentApi,
  trashApi
};