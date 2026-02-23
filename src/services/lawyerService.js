import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lawyer service for fetching data from backend API
export const lawyerService = {
  // Fetch initial lawyers (limited count)
  async fetchInitialLawyers(limit = 12) {
    try {
      const response = await apiClient.get('/lawyers', {
        params: { limit, offset: 0 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching initial lawyers:', error);
      throw error;
    }
  },

  // Search lawyers dynamically from backend
  async searchLawyers(searchTerm, specialization, location, offset = 0, limit = 12) {
    try {
      const response = await apiClient.get('/lawyers/search', {
        params: {
          q: searchTerm,
          specialization,
          location,
          offset,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching lawyers:', error);
      throw error;
    }
  },

  // Load more lawyers
  async loadMore(searchTerm, specialization, location, offset, limit = 12) {
    return this.searchLawyers(searchTerm, specialization, location, offset, limit);
  },

  // Refresh backend cache
  async refreshCache() {
    try {
      const response = await apiClient.post('/lawyers/refresh');
      return response.data;
    } catch (error) {
      console.error('Error refreshing cache:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
};
