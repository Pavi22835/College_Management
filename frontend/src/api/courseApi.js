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

  getAvailableBatches: async () => {
    try {
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

  assignStudents: async (courseId, studentIds) => {
    try {
      console.log(`Assigning ${studentIds.length} students to course ${courseId}:`, studentIds);
      const response = await axiosInstance.post(`/admin/courses/${courseId}/students`, { studentIds });
      console.log("Assign students response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error assigning students:", error);
      throw error;
    }
  },

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

  getEnrollmentStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/enrollment/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      throw error;
    }
  },

  getDepartmentDistribution: async () => {
    try {
      const response = await axiosInstance.get("/admin/courses/department/distribution");
      return response.data;
    } catch (error) {
      console.error("Error fetching department distribution:", error);
      throw error;
    }
  },

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
  
  searchCourses: async (query) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  },

  getCoursesByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/department/${encodeURIComponent(department)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by department:", error);
      throw error;
    }
  },

  getCoursesBySemester: async (semester) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/semester/${semester}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by semester:", error);
      throw error;
    }
  },

  getCoursesByTeacher: async (teacherId) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses by teacher:", error);
      throw error;
    }
  },

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
  
  getTrashed: async () => {
    return courseApi.getTrashedCourses();
  },

  restore: async (id) => {
    return courseApi.restoreCourse(id);
  },

  permanentDelete: async (id) => {
    return courseApi.permanentDeleteCourse(id);
  },

  // ========== EXPORT METHODS ==========
  
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
  
  create: async (data) => {
    return courseApi.createCourse(data);
  },

  update: async (id, data) => {
    return courseApi.updateCourse(id, data);
  },

  delete: async (id) => {
    return courseApi.softDeleteCourse(id);
  },

  getById: async (id) => {
    return courseApi.getCourseById(id);
  },

  getStudents: async (courseId) => {
    return courseApi.getEnrolledStudents(courseId);
  },

  enrollStudents: async (courseId, studentIds) => {
    return courseApi.assignStudents(courseId, studentIds);
  },

  unenrollStudent: async (courseId, studentId) => {
    return courseApi.removeStudent(courseId, studentId);
  },

  getByBatch: async (batch, includeTrashed = false) => {
    return courseApi.getCoursesByBatch(batch, includeTrashed);
  },

  getBatches: async () => {
    return courseApi.getAvailableBatches();
  },

  // ========== LESSON METHODS ==========

  createLesson: async (courseId, lessonData) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

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

  getLessonById: async (lessonId) => {
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  updateLesson: async (lessonId, lessonData) => {
    try {
      const response = await axiosInstance.put(`/lessons/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  deleteLesson: async (lessonId) => {
    try {
      const response = await axiosInstance.delete(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },

  reorderLessons: async (courseId, lessonOrders) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/reorder`, { lessonOrders });
      return response.data;
    } catch (error) {
      console.error("Error reordering lessons:", error);
      throw error;
    }
  },

  // ========== TOPIC METHODS ==========

  // Create a new topic under a lesson
  createTopic: async (lessonId, topicData) => {
    try {
      console.log(`Creating topic under lesson ${lessonId}:`, topicData);
      const response = await axiosInstance.post(`/lessons/${lessonId}/topics`, topicData);
      console.log("✅ Create topic response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating topic:", error);
      throw error;
    }
  },

  // Get all topics for a lesson
  getTopicsByLesson: async (lessonId) => {
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}/topics`);
      console.log("📊 Get topics response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching topics:", error);
      throw error;
    }
  },

  // Get topic by ID
  getTopicById: async (topicId) => {
    try {
      const response = await axiosInstance.get(`/topics/${topicId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching topic:", error);
      throw error;
    }
  },

  // Update a topic
  updateTopic: async (topicId, topicData) => {
    try {
      console.log(`Updating topic ${topicId}:`, topicData);
      const response = await axiosInstance.put(`/topics/${topicId}`, topicData);
      console.log("✅ Update topic response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating topic:", error);
      throw error;
    }
  },

  // Delete a topic
  deleteTopic: async (topicId) => {
    try {
      const response = await axiosInstance.delete(`/topics/${topicId}`);
      console.log("✅ Delete topic response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting topic:", error);
      throw error;
    }
  },

  // Reorder topics within a lesson
  reorderTopics: async (lessonId, topicOrders) => {
    try {
      const response = await axiosInstance.put(`/lessons/${lessonId}/topics/reorder`, { topicOrders });
      return response.data;
    } catch (error) {
      console.error("Error reordering topics:", error);
      throw error;
    }
  },

  // Bulk create topics for a lesson
  bulkCreateTopics: async (lessonId, topics) => {
    try {
      const results = [];
      for (const topic of topics) {
        try {
          const result = await courseApi.createTopic(lessonId, topic);
          results.push({ success: true, data: result });
        } catch (err) {
          results.push({ success: false, error: err.message, data: topic });
        }
      }
      return results;
    } catch (error) {
      console.error("Error bulk creating topics:", error);
      throw error;
    }
  },

  // ========== MATERIAL METHODS ==========

  uploadMaterial: async (lessonId, file, type = 'document') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await axiosInstance.post(`/lessons/${lessonId}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading material:", error);
      throw error;
    }
  },

  getMaterialsByLesson: async (lessonId) => {
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}/materials`);
      console.log("Get materials response:", response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  },

  deleteMaterial: async (materialId) => {
    try {
      const response = await axiosInstance.delete(`/materials/${materialId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  }
};

export default courseApi;