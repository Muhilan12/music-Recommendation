import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('auth/register/', userData),
  login: (credentials) => api.post('auth/login/', credentials),
  logout: () => api.post('auth/logout/'),
};

// Mood Folder APIs
export const folderAPI = {
  getAll: () => api.get('folders/'),
  getById: (id) => api.get(`folders/${id}/`),
  create: (data) => api.post('folders/', data),
  update: (id, data) => api.put(`folders/${id}/`, data),
  delete: (id) => api.delete(`folders/${id}/`),
  getByMood: (mood) => api.get(`folders/by_mood/?mood=${mood}`),
};

// Song APIs
export const songAPI = {
  getAll: () => api.get('songs/'),
  getById: (id) => api.get(`songs/${id}/`),
  create: (formData) => {
    return api.post('songs/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`songs/${id}/`, data),
  delete: (id) => api.delete(`songs/${id}/`),
  getByMood: (mood) => api.get(`songs/by_mood/?mood=${mood}`),
  shuffle: (mood) => api.get(`songs/shuffle/?mood=${mood}`),
};

export default api;