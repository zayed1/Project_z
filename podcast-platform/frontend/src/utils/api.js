// ============================================
// أداة التعامل مع الـ API | API Utility
// ============================================
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// المصادقة | Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
};

// البودكاست | Podcasts
export const podcastsAPI = {
  getAll: (params) => api.get('/podcasts', { params }),
  getById: (id) => api.get(`/podcasts/${id}`),
  create: (data) => api.post('/podcasts', data),
  update: (id, data) => api.put(`/podcasts/${id}`, data),
  delete: (id) => api.delete(`/podcasts/${id}`),
  getCategories: () => api.get('/categories'),
  autocomplete: (q) => api.get('/search/autocomplete', { params: { q } }),
  uploadCover: (formData) => api.post('/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStats: () => api.get('/admin/stats'),
};

// الحلقات | Episodes
export const episodesAPI = {
  getAll: (podcastId) => api.get(`/podcasts/${podcastId}/episodes`),
  create: (podcastId, formData) =>
    api.post(`/podcasts/${podcastId}/episodes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (episodeId, data) => api.put(`/episodes/${episodeId}`, data),
  delete: (episodeId) => api.delete(`/episodes/${episodeId}`),
  recordListen: (episodeId) => api.post(`/episodes/${episodeId}/listen`),
};

// التعليقات | Comments
export const commentsAPI = {
  getAll: (episodeId) => api.get(`/episodes/${episodeId}/comments`),
  add: (episodeId, content) => api.post(`/episodes/${episodeId}/comments`, { content }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// المشرف | Admin
export const adminAPI = {
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  exportData: (format) => api.get('/admin/export', { params: { format }, responseType: format === 'csv' ? 'blob' : 'json' }),
};

export default api;
