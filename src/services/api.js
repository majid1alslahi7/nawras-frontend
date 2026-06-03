import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://nawras-backend.alssemam.com/api').replace(/\/+$/, '');

export function apiUrl(path = '') {
  const cleanPath = String(path).replace(/^\/+/, '');
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nawras-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const isLoginRequest = requestUrl.endsWith('/login') || requestUrl === 'login';
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isLoginRequest && !isLoginPage) {
      localStorage.removeItem('nawras-token');
      localStorage.removeItem('nawras-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
