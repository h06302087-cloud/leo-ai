import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('leo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const studioApi = {
  createProject: (data: { name: string; description?: string }) =>
    api.post('/api/studio/projects', data),
  getProject: (id: string) => api.get(`/api/studio/projects/${id}`),
  updatePage: (projectId: string, pageId: string, data: unknown) =>
    api.put(`/api/studio/projects/${projectId}/pages/${pageId}`, data),
  previewComponent: (data: unknown) =>
    api.post('/api/studio/components/preview', data),
  bindData: (data: unknown) => api.post('/api/studio/bind-data', data),
};

export const workflowApi = {
  create: (data: unknown) => api.post('/api/workflows/create', data),
  validate: (id: string) => api.post(`/api/workflows/${id}/validate`),
  execute: (id: string, data?: unknown) =>
    api.post(`/api/workflows/${id}/execute`, data),
  getExecutions: (id: string, params?: unknown) =>
    api.get(`/api/workflows/${id}/executions`, { params }),
  testNode: (workflowId: string, data: unknown) =>
    api.post(`/api/workflows/${workflowId}/test-node`, data),
};

export const agentApi = {
  create: (data: unknown) => api.post('/api/agents/create', data),
  chat: (agentId: string, data: unknown) =>
    api.post(`/api/agents/${agentId}/chat`, data),
  getMemory: (agentId: string, params?: unknown) =>
    api.get(`/api/agents/${agentId}/memory`, { params }),
  defineTool: (agentId: string, data: unknown) =>
    api.post(`/api/agents/${agentId}/tools`, data),
};

export const integrationApi = {
  list: () => api.get('/api/integrations/available'),
  authorize: (data: unknown) => api.post('/api/integrations/authorize', data),
  callback: (data: unknown) => api.post('/api/integrations/callback', data),
  testWebhook: (data: unknown) =>
    api.post('/api/integrations/webhook/test', data),
};

export const exportApi = {
  generate: (data: unknown) => api.post('/api/export/generate', data),
  download: (exportId: string) =>
    api.get(`/api/export/${exportId}/download`, { responseType: 'blob' }),
  status: (exportId: string) => api.get(`/api/export/${exportId}/status`),
};

export const pythonApi = {
  execute: (data: unknown) => api.post('/api/python/execute', data),
  validate: (data: { script: string }) =>
    api.post('/api/python/validate', data),
  libraries: (params?: unknown) =>
    api.get('/api/python/libraries', { params }),
};
