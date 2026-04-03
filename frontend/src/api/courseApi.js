import axiosInstance from "./axiosConfig";

const courseApi = {
  // ========== BASIC COURSE OPERATIONS ==========
  
  // Get all courses (active only by default, optionally include trashed)
  getCourses: async (includeTrashed = false, filters = {}) => {
    try {
      const params = {};
      if (includeTrashed) params.includeTrashed = 'true';
      if (filters.batch) params.batch = filters.batch;
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      if (filters.status) params.status = filters.status;
      
      const response = await axiosInstance.get("/admin/courses", { params });
      console.log("Get courses response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Get all courses (alias for getCourses, excludes trashed by default)
  getAll: async (filters = {}) => {
    return courseApi.getCourses(false, filters);
  },

  // Get trashed courses (soft deleted)
  getTrashedCourses: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/trash");
      console.log("Get trashed courses response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching trashed courses:", error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (data) => {
    try {
      console.log("Creating course with data:", JSON.stringify(data, null, 2));
      
      // Validate required fields
      if (!data.code) throw new Error("Course code is required");
      if (!data.name) throw new Error("Course name is required");
      if (!data.department) throw new Error("Department is required");
      if (!data.credits) throw new Error("Credits are required");
      
      const response = await axiosInstance.post("/admin/courses", data);
      console.log("Create course response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create course");
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/admin/courses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Soft delete course (move to trash)
  softDeleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/courses/${id}`);
      console.log(`🗑️ Course (ID: ${id}) moved to trash:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to move course to trash");
    } catch (error) {
      console.error("❌ Error soft deleting course:", error);
      throw error;
    }
  },

  // Restore course from trash
  restoreCourse: async (id) => {
    try {
      const response = await axiosInstance.post(`/admin/courses/${id}/restore`);
      console.log(`🔄 Course (ID: ${id}) restored:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to restore course");
    } catch (error) {
      console.error("❌ Error restoring course:", error);
      throw error;
    }
  },

  // Permanently delete course
  permanentDeleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/courses/${id}/permanent`);
      console.log(`🗑️ Course (ID: ${id}) permanently deleted:`, response.data);
      
      if (response.data?.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to permanently delete course");
    } catch (error) {
      console.error("❌ Error permanently deleting course:", error);
      throw error;
    }
  },

  // Delete course (alias for soft delete - moves to trash)
  deleteCourse: async (id) => {
    return courseApi.softDeleteCourse(id);
  },

  // ========== TEACHER METHODS ==========
  
  // Get all teachers (for dropdown)
  getTeachers: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff");
      console.log("Get teachers response:", response.data);
      
      let staffData = [];
      if (response.data?.success && response.data?.data) {
        staffData = response.data.data;
      } else if (Array.isArray(response.data)) {
        staffData = response.data;
      }
      
      // Filter faculty members (exclude HODs and Mentors)
      const faculty = staffData.filter(staff => 
        staff.staffRole === 'FACULTY' || 
        (staff.designation && 
         !staff.designation.toLowerCase().includes('head') &&
         !staff.designation.toLowerCase().includes('hod') &&
         !staff.designation.toLowerCase().includes('mentor'))
      );
      
      console.log(`Found ${faculty.length} faculty members`);
      return faculty;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  },

  // ========== DEPARTMENT METHODS ==========
  
  // Get all departments
  getDepartments: async () => {
    try {
      const response = await axiosInstance.get("/admin/departments");
      console.log("Get departments response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  },

  // ========== BATCH METHODS ==========
  
  // Get courses by batch
  getCoursesByBatch: async (batch, includeTrashed = false) => {
    try {
      const params = includeTrashed ? { includeTrashed: 'true' } : {};
      const response = await axiosInstance.get(`/admin/courses/batch/${encodeURIComponent(batch)}`, { params });
      console.log(`Get courses by batch ${batch}:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching courses by batch ${batch}:`, error);
      throw error;
    }
  },

  // Get available batches from courses
  getAvailableBatches: async () => {
    try {
      // Teacher/Staff route first (no ADMIN role required)
      let endpoint = "/courses/batches/available";
      let response;

      try {
        response = await axiosInstance.get(endpoint);
      } catch (err) {
        console.warn(`Fallback to admin endpoint ${endpoint} failed, trying admin route`, err);
        response = await axiosInstance.get("/admin/courses/batches/available");
      }

      console.log("Get available batches response:", response.data);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching available batches:", error);
      throw error;
    }
  },

  // ========== STUDENT ENROLLMENT METHODS ==========
  
  // Get enrolled students for a course
  getEnrolledStudents: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/${courseId}/students`);
      console.log(`Get enrolled students for course ${courseId}:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching enrolled students for course ${courseId}:`, error);
      throw error;
    }
  },

  // Assign students to a course (batch assignment)
  assignStudents: async (courseId, studentIds) => {
    try {
      console.log(`Assigning ${studentIds.length} students to course ${courseId}:`, studentIds);
      const response = await axiosInstance.post(`/admin/courses/${courseId}/students`, { 
        studentIds 
      });
      console.log("Assign students response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error assigning students:", error);
      throw error;
    }
  },

  // Remove a single student from a course
  removeStudent: async (courseId, studentId) => {
    try {
      const response = await axiosInstance.delete(`/admin/courses/${courseId}/students/${studentId}`);
      console.log(`Remove student ${studentId} from course ${courseId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing student:", error);
      throw error;
    }
  },

  // ========== BULK OPERATIONS ==========
  
  // Bulk create courses
  bulkCreateCourses: async (courses) => {
    try {
      const results = [];
      for (const course of courses) {
        try {
          const result = await courseApi.createCourse(course);
          results.push({ success: true, data: result });
        } catch (err) {
          results.push({ success: false, error: err.message, data: course });
        }
      }
      return results;
    } catch (error) {
      console.error("Error bulk creating courses:", error);
      throw error;
    }
  },

  // Bulk assign students to courses
  bulkAssignStudents: async (assignments) => {
    try {
      const results = [];
      for (const { courseId, studentIds } of assignments) {
        try {
          const result = await courseApi.assignStudents(courseId, studentIds);
          results.push({ success: true, data: result });
        } catch (err) {
          results.push({ success: false, error: err.message, courseId, studentIds });
        }
      }
      return results;
    } catch (error) {
      console.error("Error bulk assigning students:", error);
      throw error;
    }
  },

  // ========== STATISTICS & ANALYTICS ==========
  
  // Get course statistics
  getCourseStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/stats");
      console.log("Course stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching course stats:", error);
      throw error;
    }
  },

  // Get enrollment statistics
  getEnrollmentStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/enrollment/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      throw error;
    }
  },

  // Get department-wise course distribution
  getDepartmentDistribution: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/department/distribution");
      return response.data;
    } catch (error) {
      console.error("Error fetching department distribution:", error);
      throw error;
    }
  },

  // Get batch-wise enrollment
  getBatchEnrollment: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/enrollment/batch");
      return response.data;
    } catch (error) {
      console.error("Error fetching batch enrollment:", error);
      throw error;
    }
  },

  // ========== SEARCH & FILTER ==========
  
  // Search courses by name, code, or department
  searchCourses: async (query) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  },

  // Filter courses by department
  getCoursesByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/department/${encodeURIComponent(department)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by department:", error);
      throw error;
    }
  },

  // Filter courses by semester
  getCoursesBySemester: async (semester) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/semester/${semester}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by semester:", error);
      throw error;
    }
  },

  // Filter courses by teacher
  getCoursesByTeacher: async (teacherId) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by teacher:", error);
      throw error;
    }
  },

  // Filter courses by batch
  getCoursesByBatchFilter: async (batch) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/batch/${encodeURIComponent(batch)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by batch:", error);
      throw error;
    }
  },

  // ========== TRASH & RESTORE (Aliases) ==========
  
  // Get trashed courses (alias)
  getTrashed: async () => {
    return courseApi.getTrashedCourses();
  },

  // Restore (alias)
  restore: async (id) => {
    return courseApi.restoreCourse(id);
  },

  // Permanent delete (alias)
  permanentDelete: async (id) => {
    return courseApi.permanentDeleteCourse(id);
  },

  // ========== EXPORT METHODS ==========
  
  // Export courses to Excel
  exportToExcel: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.batch) params.append('batch', filters.batch);
      if (filters.department) params.append('department', filters.department);
      if (filters.semester) params.append('semester', filters.semester);
      
      const response = await axiosInstance.get(`/admin/courses/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting courses to Excel:", error);
      throw error;
    }
  },

  // Export courses to PDF
  exportToPDF: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.batch) params.append('batch', filters.batch);
      if (filters.department) params.append('department', filters.department);
      if (filters.semester) params.append('semester', filters.semester);
      
      const response = await axiosInstance.get(`/admin/courses/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting courses to PDF:", error);
      throw error;
    }
  },

  // Export enrollment data
  exportEnrollmentData: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/${courseId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting enrollment data:", error);
      throw error;
    }
  },

  // ========== ALIAS METHODS ==========
  
  // Alias for createCourse
  create: async (data) => {
    return courseApi.createCourse(data);
  },

  // Alias for updateCourse
  update: async (id, data) => {
    return courseApi.updateCourse(id, data);
  },

  // Alias for softDeleteCourse
  delete: async (id) => {
    return courseApi.softDeleteCourse(id);
  },

  // Alias for getCourseById
  getById: async (id) => {
    return courseApi.getCourseById(id);
  },

  // Alias for getEnrolledStudents
  getStudents: async (courseId) => {
    return courseApi.getEnrolledStudents(courseId);
  },

  // Alias for assignStudents
  enrollStudents: async (courseId, studentIds) => {
    return courseApi.assignStudents(courseId, studentIds);
  },

  // Alias for removeStudent
  unenrollStudent: async (courseId, studentId) => {
    return courseApi.removeStudent(courseId, studentId);
  },

  // Alias for getCoursesByBatch
  getByBatch: async (batch, includeTrashed = false) => {
    return courseApi.getCoursesByBatch(batch, includeTrashed);
  },

  // Alias for getAvailableBatches
  getBatches: async () => {
    return courseApi.getAvailableBatches();
  },

  // ========== LESSON METHODS ==========

  // Create lesson
  createLesson: async (courseId, lessonData) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  // Get lessons by course
  getLessons: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/lessons`);
      console.log("Get lessons response:", response.data);

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  },

  // Get lesson by ID
  getLessonById: async (lessonId) => {
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  // Update lesson
  updateLesson: async (lessonId, lessonData) => {
    try {
      const response = await axiosInstance.put(`/lessons/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  // Delete lesson
  deleteLesson: async (lessonId) => {
    try {
      const response = await axiosInstance.delete(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },

  // Reorder lessons
  reorderLessons: async (courseId, lessonOrders) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/reorder`, { lessonOrders });
      return response.data;
    } catch (error) {
      console.error("Error reordering lessons:", error);
      throw error;
    }
  }
};

export default courseApi;