import { apiClient } from './client';

export const aiApi = {
  consult: async (data: {
    symptoms?: string;
    file?: File;
    patientName?: string;
    patientPhone?: string;
    channel?: string;
  }) => {
    const formData = new FormData();
    if (data.symptoms) formData.append('symptoms', data.symptoms);
    if (data.patientName) formData.append('patientName', data.patientName);
    if (data.patientPhone) formData.append('patientPhone', data.patientPhone);
    if (data.channel) formData.append('channel', data.channel);
    if (data.file) formData.append('file', data.file);

    const res = await apiClient.post('/ai/consultation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  accept: async (id: string, appointmentId?: string) => {
    const res = await apiClient.patch(`/ai/consultation/${id}/accept`, { appointmentId });
    return res.data;
  },
  getInsights: async (branchId?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    const res = await apiClient.get('/ai/insights', { params });
    return res.data;
  },
  logZaloChat: async (data: {
    senderPhone?: string;
    senderName?: string;
    messageText: string;
    aiResponseText: string;
    sentiment?: string;
  }) => {
    const res = await apiClient.post('/ai/zalo-webhook', data);
    return res.data;
  },
};

export const overviewApi = {
  getDashboard: async (branchId?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    const res = await apiClient.get('/overview', { params });
    return res.data;
  },
};
