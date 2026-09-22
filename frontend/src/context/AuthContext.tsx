import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface UserProfile {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  branch?: any;
  roles: string[];
  permissions?: string[];
  doctorProfile?: any;
  patient?: {
    id: string;
    patientCode: string;
    fullName: string;
    phone: string;
    email?: string;
    birthYear?: number;
    gender?: string;
    medicalAlerts?: string;
    appointments?: any[];
  } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identity: string, password: string) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user_profile', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Lỗi khi tải lại thông tin tài khoản:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('access_token');
      if (savedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user_profile', JSON.stringify(res.data));
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_profile');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (identity: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { identity, password });
      const { accessToken, user: userData } = res.data;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_profile', JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập không thành công';
      return { success: false, message: msg };
    }
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedData };
      if (updatedData.patient && prev.patient) {
        next.patient = { ...prev.patient, ...updatedData.patient };
      }
      localStorage.setItem('user_profile', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const INTERNAL_STAFF_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'BRANCH_MANAGER',
    'DOCTOR',
    'STAFF',
    'RECEPTIONIST',
    'NURSE',
    'TECHNICIAN',
    'CLINIC_OWNER',
    'OWNER',
  ];

  const isAdmin = Boolean(
    user &&
      Array.isArray(user.roles) &&
      user.roles.some((r) => INTERNAL_STAFF_ROLES.includes(r.toUpperCase())),
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
