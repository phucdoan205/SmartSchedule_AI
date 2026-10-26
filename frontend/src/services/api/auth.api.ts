import { apiClient } from './client';

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
