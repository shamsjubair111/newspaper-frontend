import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  testBackend: async () => { const r = await api.get('/test'); return r.data; },
  register: async (userData) => {
    const r = await api.post('/api/auth/register', userData);
    if (r.data.token) { localStorage.setItem('token', r.data.token); localStorage.setItem('user', JSON.stringify(r.data.user)); }
    return r.data;
  },
  login: async (credentials) => {
    const r = await api.post('/api/auth/login', credentials);
    if (r.data.token) { localStorage.setItem('token', r.data.token); localStorage.setItem('user', JSON.stringify(r.data.user)); }
    return r.data;
  },
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  isAuthenticated: () => localStorage.getItem('token') !== null,
  getCurrentUser: () => { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; },
};

export const categoryAPI = {
  createCategory: async (d) => { const r = await api.post('/api/categories', d); return r.data; },
  getCategories:  async ()  => { const r = await api.get('/api/categories');    return r.data; },
  getCategoryById: async (id) => { const r = await api.get(`/api/categories/${id}`); return r.data; },
  updateCategory: async (id, d) => { const r = await api.put(`/api/categories/${id}`, d); return r.data; },
  deleteCategory: async (id)    => { const r = await api.delete(`/api/categories/${id}`); return r.data; },
};

export const authorAPI = {
  getAuthors:    async ()       => { const r = await api.get('/api/authors');         return r.data; },
  getAuthorById: async (id)     => { const r = await api.get(`/api/authors/${id}`);   return r.data; },
  createAuthor:  async (d)      => { const r = await api.post('/api/authors', d);      return r.data; },
  updateAuthor:  async (id, d)  => { const r = await api.put(`/api/authors/${id}`, d); return r.data; },
  deleteAuthor:  async (id)     => { const r = await api.delete(`/api/authors/${id}`); return r.data; },
};

export default api;