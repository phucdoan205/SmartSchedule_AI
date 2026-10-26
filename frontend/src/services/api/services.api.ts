import { apiClient } from './client';

export const servicesApi = {
  getAll: async (params?: { categoryId?: string; search?: string; isActive?: boolean }) => {
    const res = await apiClient.get('/services', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get('/services/categories');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/services/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/services', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/services/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/services/${id}`);
    return res.data;
  },
};

export const dentalServicesApi = {
  getAll: async (params?: { categoryId?: string; search?: string; isActive?: boolean }) => {
    const res = await apiClient.get('/services', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get('/services/categories');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/services/${id}`);
    return res.data;
  },
};
