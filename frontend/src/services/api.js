import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH =====
export const login = (username, password) => api.post('/auth/login', { username, password });

// ===== DASHBOARD =====
export const getDashboardStats = () => api.get('/dashboard');

// ===== IPO DATA =====
export const getIpoData = (params) => api.get('/ipo-data', { params });

// ===== UNDERWRITER =====
export const getUWStats = () => api.get('/uw-stats');
export const getUWDetail = (uwId) => api.get(`/uw-stats/${uwId}`); // pastikan backend mendukung

// ===== MODEL =====
export const getModelInfo = () => api.get('/model-info');

// ===== PREDICTION =====
export const predictIPO = (data) => api.post('/predict', data);

// ===== ADMIN =====
export const getSektors = () => api.get('/public/sektors');   // 🔥 TAMBAHKAN INI

export default api;