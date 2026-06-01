import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nawrasb.alssemam.com/api',
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
    if (error.response?.status === 401) {
      localStorage.removeItem('nawras-token');
      localStorage.removeItem('nawras-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
