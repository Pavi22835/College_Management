import axiosConfig from './axiosConfig.js';

export const trashApi = {
  getAll: async () => {
    try {
      const response = await axiosConfig.get('/admin/trash');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching trash:', error);
      return { success: true, data: [] };
    }
  },

  restore: async (id) => {
    try {
      const response = await axiosConfig.post(`/admin/trash/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('❌ Error restoring item:', error);
      throw error;
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await axiosConfig.delete(`/admin/trash/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  },

  emptyTrash: async () => {
    try {
      const response = await axiosConfig.delete('/admin/trash');
      return response.data;
    } catch (error) {
      console.error('❌ Error emptying trash:', error);
      throw error;
    }
  }
};