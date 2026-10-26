import { apiClient } from './client';

export const staffApi = {
  getDoctors: async (params?: { branchId?: string; specialty?: string }) => {
    const res = await apiClient.get('/staff/doctors', { params });
    return res.data;
  },
  getDoctorById: async (id: string) => {
    const res = await apiClient.get(`/staff/doctors/${id}`);
    return res.data;
  },
  getAllStaff: async (params?: { branchId?: string }) => {
    const res = await apiClient.get('/staff', { params });
    return res.data;
  },
  createStaff: async (data: any) => {
    const res = await apiClient.post('/staff', data);
    return res.data;
  },
  updateStaff: async (id: string, data: any) => {
    const res = await apiClient.patch(`/staff/${id}`, data);
    return res.data;
  },
};

export const staffSchedulesApi = {
  getAll: async (params?: { branchId?: string; startDate?: string; endDate?: string; userId?: string }) => {
    const res = await apiClient.get('/staff/schedules', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/staff/schedules', data);
    return res.data;
  },
  autoGenerate: async (data: { branchId?: string; weekStart?: string }) => {
    const res = await apiClient.post('/staff/schedules/auto-generate', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/staff/schedules/${id}`);
    return res.data;
  },
  clearWeek: async (data: { branchId?: string; startDate: string; endDate: string; userId?: string }) => {
    const res = await apiClient.post('/staff/schedules/clear-week', data);
    return res.data;
  },
};
