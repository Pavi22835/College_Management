import axiosInstance from "./axiosConfig";

const courseApi = {
  // ========== BASIC COURSE OPERATIONS ==========
  
  // Get all courses
  getCourses: async () => {
    try {
      const response = await axiosInstance.get("/courses");
      console.log("Get courses response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Get all courses (alias for getCourses)
  getAll: async () => {
    return courseApi.getCourses();
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (data) => {
    try {
      console.log("Creating course with data:", data);
      const response = await axiosInstance.post("/courses", data);
      console.log("Create course response:", response.data);
      
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create course");
    } catch (error) {
      console.error("Error creating course:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/courses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // ========== TEACHER METHODS ==========
  
  // Get all teachers (for dropdown)
  getTeachers: async () => {
    try {
      const response = await axiosInstance.get("/staff");
      console.log("Get teachers response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  },

  // ========== STUDENT ENROLLMENT METHODS ==========
  
  // Get enrolled students for a course
  getEnrolledStudents: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/students`);
      console.log(`Get enrolled students for course ${courseId}:`, response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
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
      const response = await axiosInstance.post(`/courses/${courseId}/students`, { 
        studentIds,
        courseId 
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
      const response = await axiosInstance.delete(`/courses/${courseId}/students/${studentId}`);
      console.log(`Remove student ${studentId} from course ${courseId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing student:", error);
      throw error;
    }
  },

  // Remove multiple students from a course
  removeStudents: async (courseId, studentIds) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/students/remove`, { 
        studentIds 
      });
      console.log(`Remove ${studentIds.length} students from course ${courseId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing students:", error);
      throw error;
    }
  },

  // Check if a student is enrolled in a course
  checkEnrollment: async (courseId, studentId) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/students/${studentId}/check`);
      return response.data;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      throw error;
    }
  },

  // ========== BULK OPERATIONS ==========
  
  // Bulk create courses from array
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
      const response = await axiosInstance.get("/courses/stats");
      console.log("Course stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching course stats:", error);
      throw error;
    }
  },

  // Get course enrollment statistics
  getEnrollmentStats: async () => {
    try {
      const response = await axiosInstance.get("/courses/enrollment/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      throw error;
    }
  },

  // Get department-wise course distribution
  getDepartmentDistribution: async () => {
    try {
      const response = await axiosInstance.get("/courses/department/distribution");
      return response.data;
    } catch (error) {
      console.error("Error fetching department distribution:", error);
      throw error;
    }
  },

  // Get batch-wise enrollment
  getBatchEnrollment: async () => {
    try {
      const response = await axiosInstance.get("/courses/enrollment/batch");
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
      const response = await axiosInstance.get(`/courses/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  },

  // Filter courses by department
  getCoursesByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get(`/courses/department/${encodeURIComponent(department)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by department:", error);
      throw error;
    }
  },

  // Filter courses by semester
  getCoursesBySemester: async (semester) => {
    try {
      const response = await axiosInstance.get(`/courses/semester/${semester}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by semester:", error);
      throw error;
    }
  },

  // Filter courses by teacher
  getCoursesByTeacher: async (teacherId) => {
    try {
      const response = await axiosInstance.get(`/courses/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by teacher:", error);
      throw error;
    }
  },

  // Filter courses by batch
  getCoursesByBatch: async (batch) => {
    try {
      const response = await axiosInstance.get(`/courses/batch/${encodeURIComponent(batch)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by batch:", error);
      throw error;
    }
  },

  // ========== TRASH & RESTORE ==========
  
  // Get trashed courses (soft deleted)
  getTrashedCourses: async () => {
    try {
      const response = await axiosInstance.get("/courses/trash");
      return response.data;
    } catch (error) {
      console.error("Error fetching trashed courses:", error);
      throw error;
    }
  },

  // Restore a trashed course
  restoreCourse: async (id) => {
    try {
      const response = await axiosInstance.post(`/courses/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error("Error restoring course:", error);
      throw error;
    }
  },

  // Permanently delete a course
  permanentDeleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/courses/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error("Error permanently deleting course:", error);
      throw error;
    }
  },

  // Empty trashed courses
  emptyTrash: async () => {
    try {
      const response = await axiosInstance.delete("/courses/trash/empty");
      return response.data;
    } catch (error) {
      console.error("Error emptying course trash:", error);
      throw error;
    }
  },

  // ========== EXPORT METHODS ==========
  
  // Export courses to Excel
  exportToExcel: async () => {
    try {
      const response = await axiosInstance.get("/courses/export/excel", {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting courses to Excel:", error);
      throw error;
    }
  },

  // Export courses to PDF
  exportToPDF: async () => {
    try {
      const response = await axiosInstance.get("/courses/export/pdf", {
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
      const response = await axiosInstance.get(`/courses/${courseId}/export`, {
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

  // Alias for deleteCourse
  delete: async (id) => {
    return courseApi.deleteCourse(id);
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
  }
};

export default courseApi;