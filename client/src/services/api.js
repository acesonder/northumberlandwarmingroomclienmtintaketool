import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Assessments API
export const assessmentsAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
};

// Cases API
export const casesAPI = {
  getAll: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  addNote: (id, data) => api.post(`/cases/${id}/notes`, data),
  delete: (id) => api.delete(`/cases/${id}`),
};

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  createConnection: (data) => api.post('/services/connections', data),
  getConnections: (params) => api.get('/services/connections/list', { params }),
  updateConnection: (id, data) => api.put(`/services/connections/${id}`, data),
};

// Messages API
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getInbox: (params) => api.get('/messages/inbox', { params }),
  getSent: () => api.get('/messages/sent'),
  getById: (id) => api.get(`/messages/${id}`),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  getUnreadCount: () => api.get('/messages/inbox/unread/count'),
  getCaseMessages: (caseId) => api.get(`/messages/case/${caseId}`),
};

export default api;
