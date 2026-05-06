import axios from 'axios';
import { getAuthInstance } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuthInstance();
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not add auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const predictJob = async (title, description, salary = '', userId = null) => {
  const response = await api.post('/api/predict', {
    title,
    description,
    salary,
    user_id: userId,
  });
  return response.data;
};

export const getHistory = async (userId) => {
  const response = await api.get(`/api/history/${userId}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;
