import { apiClient } from './client';

export const equipmentApi = {
  getAll: async (params?: { branchId?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const cleanParams: any = { ...params };
    if (cleanParams.branchId === 'ALL') delete cleanParams.branchId;
    const res = await apiClient.get('/equipment', { params: cleanParams });
    return res.data;
  },
  getStats: async (branchId?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    const res = await apiClient.get('/equipment/stats', { params });
    return res.data;
  },
  getNotifications: async (branchId?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    const res = await apiClient.get('/equipment/notifications', { params });
    return res.data;
  },
  getMaintenanceHistory: async (branchId?: string, equipmentId?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    if (equipmentId) params.equipmentId = equipmentId;
    const res = await apiClient.get('/equipment/maintenance-history', { params });
    return res.data;
  },
  togglePause: async (id: string) => {
    const res = await apiClient.patch(`/equipment/${id}/toggle-pause`);
    return res.data;
  },
  createSchedule: async (data: {
    equipmentId: string;
    branchId?: string;
    technicianId?: string;
    technicianName?: string;
    actionType: string;
    scheduledAt: string;
    scheduledTime?: string;
    findings?: string;
    isUrgent?: boolean;
  }) => {
    const res = await apiClient.post('/equipment/schedule', data);
    return res.data;
  },
  createMaintenanceLog: async (
    id: string,
    data: {
      technicianId: string;
      actionType: string;
      findings: string;
      isCertified?: boolean;
      certificateUrl?: string;
    },
  ) => {
    const res = await apiClient.post(`/equipment/${id}/maintenance`, data);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/equipment', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/equipment/${id}`, data);
    return res.data;
  },
  updateMaintenanceStatus: async (
    logId: string,
    data: {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      findings?: string;
      technicianName?: string;
    },
  ) => {
    const res = await apiClient.patch(`/equipment/maintenance/${logId}/status`, data);
    return res.data;
  },
};
