import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getCategories: () => api.get('/events/meta/categories'),
};

// Competitors API
export const competitorsAPI = {
  getAll: () => api.get('/competitors'),
  getById: (id) => api.get(`/competitors/${id}`),
  getMyProfile: () => api.get('/competitors/me/profile'),
  create: (data) => api.post('/competitors', data),
  update: (id, data) => api.put(`/competitors/${id}`, data),
  delete: (id) => api.delete(`/competitors/${id}`),
};

// Registrations API
export const registrationsAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  register: (eventId, notes) => api.post('/registrations', { event_id: eventId, notes }),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  cancel: (id) => api.delete(`/registrations/${id}`),
};

// Announcements API
export const announcementsAPI = {
  getAll: (limit) => api.get('/announcements', { params: { limit } }),
  getById: (id) => api.get(`/announcements/${id}`),
  getAllAdmin: () => api.get('/announcements/admin/all'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Contact API
export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  markRead: (id, isRead) => api.patch(`/contact/${id}/read`, { is_read: isRead }),
  delete: (id) => api.delete(`/contact/${id}`),
  getUnreadCount: () => api.get('/contact/stats/unread'),
};

// Results API
export const resultsAPI = {
  getByEvent: (eventId) => api.get(`/results/event/${eventId}`),
  getByCompetitor: (competitorId) => api.get(`/results/competitor/${competitorId}`),
  getLeaderboard: (eventId) => api.get(`/results/leaderboard/${eventId}`),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
};

export default api;
