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
  search: (podcastId, q) => api.get(`/podcasts/${podcastId}/episodes/search`, { params: { q } }),
};

// التعليقات | Comments
export const commentsAPI = {
  getAll: (episodeId) => api.get(`/episodes/${episodeId}/comments`),
  add: (episodeId, content) => api.post(`/episodes/${episodeId}/comments`, { content }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
  addReply: (commentId, content) => api.post(`/comments/${commentId}/replies`, { content }),
};

// الإعجابات | Likes
export const likesAPI = {
  get: (episodeId) => api.get(`/episodes/${episodeId}/likes`),
  toggle: (episodeId, type) => api.post(`/episodes/${episodeId}/like`, { type }),
  remove: (episodeId) => api.delete(`/episodes/${episodeId}/like`),
};

// الاكتشاف | Discover
export const discoverAPI = {
  suggested: (podcastId) => api.get(`/discover/suggested/${podcastId}`),
  popular: () => api.get('/discover/popular'),
  trending: () => api.get('/discover/trending'),
};

// المتابعة | Follows
export const followsAPI = {
  toggle: (podcastId) => api.post(`/podcasts/${podcastId}/follow`),
  check: (podcastId) => api.get(`/podcasts/${podcastId}/follow/check`),
  getMyFollows: () => api.get('/me/follows'),
  getCount: (podcastId) => api.get(`/podcasts/${podcastId}/followers/count`),
};

// الشارات | Badges
export const badgesAPI = {
  getMyBadges: () => api.get('/me/badges'),
};

// الإشعارات | Notifications
export const notificationsAPI = {
  getMy: () => api.get('/me/notifications'),
  markRead: () => api.put('/me/notifications/read'),
};

// المقاطع | Clips
export const clipsAPI = {
  create: (data) => api.post('/clips', data),
  getForEpisode: (episodeId) => api.get(`/episodes/${episodeId}/clips`),
  delete: (clipId) => api.delete(`/clips/${clipId}`),
};

// الاستطلاعات | Polls
export const pollsAPI = {
  getForEpisode: (episodeId, userId) => api.get(`/episodes/${episodeId}/poll`, { params: { userId } }),
  vote: (pollId, optionId) => api.post(`/polls/${pollId}/vote`, { option_id: optionId }),
};

// الملف الشخصي | Profile
export const profileAPI = {
  getPublic: (username) => api.get(`/profile/${username}`),
  update: (data) => api.put('/me/profile', data),
};

// ملاحظات الحلقات | Episode Notes
export const notesAPI = {
  save: (episodeId, data) => api.post(`/me/notes/${episodeId}`, data),
  get: (episodeId) => api.get(`/me/notes/${episodeId}`),
  getAll: () => api.get('/me/notes'),
  delete: (noteId) => api.delete(`/me/notes/${noteId}`),
};

// المشرف | Admin
export const adminAPI = {
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  exportData: (format) => api.get('/admin/export', { params: { format }, responseType: format === 'csv' ? 'blob' : 'json' }),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBan: (userId) => api.put(`/admin/users/${userId}/ban`),
  changeRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  downloadBackup: () => api.get('/admin/backup', { responseType: 'blob' }),
  importRSS: (rssUrl) => api.post('/admin/import-rss', { rss_url: rssUrl }),
  getDetailedStats: () => api.get('/admin/detailed-stats'),
  getEpisodeAnalytics: (episodeId) => api.get(`/admin/episodes/${episodeId}/analytics`),
  createCategory: (name) => api.post('/admin/categories', { name }),
  updateCategory: (id, name) => api.put(`/admin/categories/${id}`, { name }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  sendBroadcast: (data) => api.post('/admin/broadcast', data),
  getGeoStats: () => api.get('/admin/geo-stats'),
  getScheduledEpisodes: (params) => api.get('/admin/scheduler', { params }),
  updateSchedule: (episodeId, data) => api.put(`/admin/scheduler/${episodeId}`, data),
  createPoll: (data) => api.post('/admin/polls', data),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getABTests: () => api.get('/admin/ab-tests'),
  createABTest: (data) => api.post('/admin/ab-tests', data),
  saveChapters: (episodeId, chapters) => api.put(`/admin/episodes/${episodeId}/chapters`, { chapters }),
  getSystemHealth: () => api.get('/admin/system-health'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getWeeklyReport: () => api.get('/admin/weekly-report'),
  getComments: (params) => api.get('/admin/comments', { params }),
  bulkDeleteComments: (ids) => api.post('/admin/comments/bulk-delete', { ids }),
  getTemplates: () => api.get('/admin/templates'),
  createTemplate: (data) => api.post('/admin/templates', data),
  updateTemplate: (id, data) => api.put(`/admin/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/admin/templates/${id}`),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getWebhooks: () => api.get('/admin/webhooks'),
  createWebhook: (data) => api.post('/admin/webhooks', data),
  deleteWebhook: (id) => api.delete(`/admin/webhooks/${id}`),
  toggleWebhook: (id) => api.put(`/admin/webhooks/${id}/toggle`),
  getWebhookLogs: () => api.get('/admin/webhook-logs'),
  setEpisodeMoods: (episodeId, moods) => api.put(`/admin/episodes/${episodeId}/moods`, { moods }),
};

// قوائم التشغيل | Playlists
export const playlistsAPI = {
  create: (data) => api.post('/playlists', data),
  getMy: () => api.get('/me/playlists'),
  get: (id) => api.get(`/playlists/${id}`),
  addItem: (playlistId, episodeId) => api.post(`/playlists/${playlistId}/items`, { episode_id: episodeId }),
  removeItem: (playlistId, itemId) => api.delete(`/playlists/${playlistId}/items/${itemId}`),
  delete: (id) => api.delete(`/playlists/${id}`),
};

// التقييمات | Ratings
export const ratingsAPI = {
  rate: (episodeId, rating) => api.post(`/episodes/${episodeId}/rate`, { rating }),
  get: (episodeId, userId) => api.get(`/episodes/${episodeId}/rating`, { params: { userId } }),
};

// البلاغات | Reports
export const reportsAPI = {
  submit: (data) => api.post('/reports', data),
};

// المزامنة | Sync
export const syncAPI = {
  save: (data) => api.post('/me/sync', data),
  get: (episodeId) => api.get(`/me/sync/${episodeId}`),
  getAll: () => api.get('/me/sync'),
};

// التعليقات الموقّتة | Timed Comments
export const timedCommentsAPI = {
  add: (data) => api.post('/timed-comments', data),
  getForEpisode: (episodeId) => api.get(`/episodes/${episodeId}/timed-comments`),
  delete: (id) => api.delete(`/timed-comments/${id}`),
};

// المزاج | Moods
export const moodsAPI = {
  getList: () => api.get('/moods'),
  getByMood: (mood) => api.get(`/moods/${mood}/episodes`),
  getForEpisode: (episodeId) => api.get(`/episodes/${episodeId}/moods`),
};

// التفضيلات | Preferences
export const preferencesAPI = {
  save: (data) => api.post('/me/preferences', data),
  get: () => api.get('/me/preferences'),
  getFeed: () => api.get('/me/personalized-feed'),
};

// صانع المحتوى | Creator
export const creatorAPI = {
  getStats: () => api.get('/me/creator-stats'),
  getBestTimes: (podcastId) => api.get(`/podcasts/${podcastId}/best-times`),
};

export default api;
