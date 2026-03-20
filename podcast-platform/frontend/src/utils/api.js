// ============================================
// أداة التعامل مع الـ API | API Utility
// ============================================
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة الـ Token تلقائياً لكل طلب | Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة أخطاء الاستجابة | Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// وظائف المصادقة | Auth API
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
};

// ============================================
// وظائف البودكاست | Podcasts API
// ============================================
export const podcastsAPI = {
  getAll: () => api.get('/podcasts'),
  getById: (id) => api.get(`/podcasts/${id}`),
  create: (data) => api.post('/podcasts', data),
  update: (id, data) => api.put(`/podcasts/${id}`, data),
  delete: (id) => api.delete(`/podcasts/${id}`),
};

// ============================================
// وظائف الحلقات | Episodes API
// ============================================
export const episodesAPI = {
  getAll: (podcastId) => api.get(`/podcasts/${podcastId}/episodes`),
  create: (podcastId, formData) =>
    api.post(`/podcasts/${podcastId}/episodes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (episodeId, data) => api.put(`/episodes/${episodeId}`, data),
  delete: (episodeId) => api.delete(`/episodes/${episodeId}`),
};

export default api;
