import { apiClient } from './client';

export const patientsApi = {
  getAll: async (params?: { search?: string; page?: number; limit?: number; branchId?: string }) => {
    const cleanParams: any = { ...params };
    if (cleanParams.branchId === 'ALL') delete cleanParams.branchId;
    const res = await apiClient.get('/patients', { params: cleanParams });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/patients', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/patients/${id}`, data);
    return res.data;
  },
  updateDentalChart: async (patientId: string, toothNumber: number, condition: string, colorStatus?: string) => {
    const res = await apiClient.post(`/patients/${patientId}/dental-chart`, {
      toothNumber,
      condition,
      colorStatus,
    });
    return res.data;
  },
  addMedicalRecord: async (patientId: string, data: { diagnosis: string; treatmentGiven: string; xrayImageUrls?: string[]; stepId?: string }) => {
    const res = await apiClient.post(`/patients/${patientId}/medical-records`, data);
    return res.data;
  },
};
