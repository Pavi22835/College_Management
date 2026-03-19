import axiosInstance from "./axiosConfig";

const courseApi = {
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

  // Get all teachers (for dropdown)
  getTeachers: async () => {
    try {
      const response = await axiosInstance.get("/teachers");
      return response.data;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  }
};

export default courseApi;