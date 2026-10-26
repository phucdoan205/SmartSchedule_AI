import { apiClient } from './client';

export const appointmentsApi = {
  getAll: async (params?: { branchId?: string; doctorId?: string; status?: string; date?: string }) => {
    const res = await apiClient.get('/appointments', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/appointments/${id}`);
    return res.data;
  },
  book: async (data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    birthYear?: number;
    dateOfBirth?: string;
    gender?: string;
    branchId: string;
    doctorId: string;
    chairId: string;
    serviceIds: string[];
    startTime: string;
    durationMinutes?: number;
    notes?: string;
    isAiRecommended?: boolean;
  }) => {
    const res = await apiClient.post('/appointments/book', data);
    return res.data;
  },
  getAvailableSlots: async (branchId: string, date: string, durationMinutes?: number) => {
    const res = await apiClient.get('/appointments/available-slots', {
      params: { branchId, date, durationMinutes },
    });
    return res.data;
  },
  getAiSmartSlots: async (branchId: string, date?: string, durationMinutes?: number, doctorId?: string) => {
    const params: any = { branchId };
    if (date) params.date = date;
    if (durationMinutes) params.durationMinutes = durationMinutes;
    if (doctorId) params.doctorId = doctorId;
    const res = await apiClient.get('/appointments/ai-smart-slots', { params });
    return res.data;
  },
  checkInQr: async (qrPassCode: string) => {
    const res = await apiClient.post('/appointments/check-in-qr', { qrPassCode });
    return res.data;
  },
  updateStatus: async (id: string, status: string, reason?: string) => {
    const res = await apiClient.patch(`/appointments/${encodeURIComponent(id)}/status`, { status, reason });
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/appointments/${encodeURIComponent(id)}`, data);
    return res.data;
  },
};

export const appointmentApi = {
  getAppointments: async (params?: any) => {
    const res = await apiClient.get('/appointments', { params });
    return res.data;
  },
  createAppointment: async (data: any) => {
    const res = await apiClient.post('/appointments', data);
    return res.data;
  },
  updateAppointment: async (id: string, data: any) => {
    const res = await apiClient.patch(`/appointments/${id}`, data);
    return res.data;
  },
};
