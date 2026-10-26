import { apiClient } from './client';

export const rolesApi = {
  getAll: async () => {
    const res = await apiClient.get('/roles');
    return res.data;
  },
  createRole: async (data: { name: string; description?: string }) => {
    const res = await apiClient.post('/roles', data);
    return res.data;
  },
  saveMatrix: async (matrix: Record<string, string[]>) => {
    const res = await apiClient.put('/roles/matrix', { matrix });
    return res.data;
  },
};

export const auditLogsApi = {
  getAll: async (params?: {
    module?: string;
    search?: string;
    timeFilter?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/audit-logs', { params });
    return res.data;
  },
};

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },
};
