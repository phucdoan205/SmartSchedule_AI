import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (identity: string, password: string) => {
    const res = await apiClient.post('/auth/login', { identity, password });
    return res.data;
  },
  register: async (data: { fullName: string; phone: string; email?: string; password: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  forgotPassword: async (identity: string) => {
    const res = await apiClient.post('/auth/forgot-password', { identity });
    return res.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
  googleLogin: async (data: { email: string; name: string; avatarUrl?: string; sub?: string }) => {
    const res = await apiClient.post('/auth/google', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
    birthYear?: number;
    gender?: string;
    address?: string;
    medicalAlerts?: string;
  }) => {
    const res = await apiClient.patch('/auth/profile', data);
    return res.data;
  },
};

// Services API
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

// Branches API
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
};

// Staff & Doctors API
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

// Staff Schedules API
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
};

// Appointments API
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

// Operatories API
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

// Patients API
export const patientsApi = {
  getAll: async (search?: string) => {
    const res = await apiClient.get('/patients', { params: { search } });
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
};

// Upload API (Cloudinary categorized folders)
export type UploadCategory =
  | 'services'
  | 'branches'
  | 'doctors'
  | 'patients'
  | 'xrays'
  | 'equipments'
  | 'payments'
  | 'prescriptions'
  | 'staff'
  | 'banners';

export interface CloudinaryFolder {
  id: string;
  name: string;
  description: string;
  path: string;
}

export const uploadApi = {
  getFolders: async (): Promise<CloudinaryFolder[]> => {
    const res = await apiClient.get('/upload/folders');
    return res.data.data;
  },
  uploadImage: async (
    file: File,
    category: UploadCategory | string = 'services',
  ): Promise<{ url: string; public_id: string; folder: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await apiClient.post(`/upload/image?category=${category}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
};

// Roles & RBAC Matrix API
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

