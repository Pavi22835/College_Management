import axiosInstance from './axiosConfig';

const dashboardApi = {
  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      
      // Log the response to see what structure it has
      console.log("Dashboard stats response:", response.data);
      
      // Handle different response structures
      if (response.data?.success && response.data?.data) {
        // Structure: { success: true, data: { students, teachers, courses } }
        return response.data.data;
      } else if (response.data?.data) {
        // Structure: { data: { students, teachers, courses } }
        return response.data.data;
      } else if (response.data?.students !== undefined) {
        // Structure: { students: 5, teachers: 3, courses: 4 }
        return response.data;
      } else {
        // Default fallback
        console.warn("Unexpected stats response structure:", response.data);
        return { students: 0, teachers: 0, courses: 0 };
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error; // Re-throw to be handled by component
    }
  },

  // Get recent students for dashboard
  getRecentStudents: async (limit = 5) => {
    try {
      const response = await axiosInstance.get(`/dashboard/recent-students?limit=${limit}`);
      
      console.log("Recent students response:", response.data);
      
      // Handle different response structures
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching recent students:", error);
      return []; // Return empty array on error
    }
  },

  // Get dashboard charts data if needed
  getChartsData: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/charts');
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error("Error fetching charts data:", error);
      return {};
    }
  }
};

export default dashboardApi;