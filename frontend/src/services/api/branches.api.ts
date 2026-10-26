import { apiClient } from './client';

export const branchesApi = {
  getAll: async () => {
    const res = await apiClient.get('/branches');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/branches/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/branches', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/branches/${id}`, data);
    return res.data;
  },
  createRoom: async (branchId: string, data: any) => {
    const res = await apiClient.post(`/branches/${branchId}/rooms`, data);
    return res.data;
  },
};

export const operatoriesApi = {
  getByBranch: async (branchId: string) => {
    const res = await apiClient.get(`/operatories/branch/${branchId}`);
    return res.data;
  },
  updateChairStatus: async (chairId: string, status: string, assignedDoctorId?: string) => {
    const res = await apiClient.patch(`/operatories/${chairId}/status`, { status, assignedDoctorId });
    return res.data;
  },
};
