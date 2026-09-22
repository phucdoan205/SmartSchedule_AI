import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Phone, Eye, EyeOff, ArrowRight, LogIn, AlertCircle, Info, X } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

/**
 * Trang đăng nhập thống nhất — kết nối trực tiếp API Backend & Hỗ trợ Google Login.
 */
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

const isInternalStaffRole = (roles?: string[]) => {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((r) => INTERNAL_STAFF_ROLES.includes(r.toUpperCase()));
};

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleGuideModal, setShowGoogleGuideModal] = useState(false);

  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu người dùng đã đăng nhập từ trước, tự động chuyển hướng theo quyền hạn
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/overview', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  // Lắng nghe callback đăng nhập Google OAuth2 nếu có
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const token = params.get('access_token');
      if (token) {
        setIsSubmitting(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then(async (googleUser) => {
            if (googleUser.email) {
              const res = await authApi.googleLogin({
                email: googleUser.email,
                name: googleUser.name,
                avatarUrl: googleUser.picture,
                sub: googleUser.sub,
              });
              if (res.data?.accessToken) {
                localStorage.setItem('access_token', res.data.accessToken);
                localStorage.setItem('user_profile', JSON.stringify(res.data.user));
                const isStaff = isInternalStaffRole(res.data.user?.roles);
                window.location.href = isStaff ? '/admin/overview' : '/';
              }
            }
          })
          .catch((err) => {
            setErrorMessage('Đăng nhập Google thất bại: ' + err.message);
          })
          .finally(() => setIsSubmitting(false));
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setShowGoogleGuideModal(true);
      return;
    }
    const redirectUri = window.location.origin + '/auth/login';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=token&scope=email%20profile`;
    window.location.href = googleAuthUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(identity, password);
    if (res.success) {
      const isStaff = isInternalStaffRole(res.user?.roles);
      const requestedFrom = (location.state as any)?.from?.pathname;

      if (isStaff) {
        // Tài khoản nhân sự/quản trị: Vào thẳng trang quản lý
        const destination = requestedFrom && requestedFrom.startsWith('/admin') ? requestedFrom : '/admin/overview';
        navigate(destination, { replace: true });
      } else {
        // Tài khoản khách hàng / bệnh nhân: Về trang chủ hoặc trang yêu cầu (không phải /admin)
        const destination = requestedFrom && !requestedFrom.startsWith('/admin') ? requestedFrom : '/';
        navigate(destination, { replace: true });
      }
    } else {
      setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác');
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Chào Mừng Trở Lại"
      description="Đăng nhập vào hệ thống quản lý & đặt lịch nha khoa thông minh"
    >
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Identity Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">
            Số điện thoại, Email hoặc Tên đăng nhập
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="VD: admin / admin@smartschedule.ai / 0901234567"
              className="
                w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
                bg-white/10 border border-white/20 text-white placeholder-white/35
                focus:outline-none focus:border-teal-400/60 focus:bg-white/15
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white/80">Mật khẩu</label>
            <NavLink
              to="/auth/forgot-password"
              className="text-xs text-teal-300 hover:text-teal-200 font-semibold transition-colors"
            >
              Quên mật khẩu?
            </NavLink>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium
                bg-white/10 border border-white/20 text-white placeholder-white/35
                focus:outline-none focus:border-teal-400/60 focus:bg-white/15
                transition-all duration-200
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-white/10 border border-white/30 text-teal-500 focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-xs text-white/55 font-medium">Ghi nhớ đăng nhập trên thiết bị này</span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-900
            bg-gradient-to-r from-teal-400 to-cyan-300 hover:from-teal-300 hover:to-cyan-200
            shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40
            flex items-center justify-center gap-2
            transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
            cursor-pointer disabled:opacity-50
          "
        >
          {isSubmitting ? (
            <span>Đang xác thực...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
        {/* Divider */}
        <div className="relative my-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/15" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#183138] px-3 text-white/55 uppercase tracking-wider text-[10px] font-bold rounded-full">
              Hoặc đăng nhập với
            </span>
          </div>
        </div>

        {/* Google Quick Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="
            w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-800
            bg-white hover:bg-slate-100 border border-slate-200
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-3
            transition-all duration-200 cursor-pointer active:scale-[0.99]
          "
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Tiếp tục với tài khoản Google</span>
        </button>
      </form>

      {/* Đăng ký tài khoản */}
      <div className="pt-4 mt-2 border-t border-white/10 text-center text-xs text-white/60">
        Chưa có tài khoản bệnh nhân?{' '}
        <NavLink
          to="/auth/register"
          className="text-teal-300 hover:text-teal-200 font-bold underline underline-offset-2 transition-colors"
        >
          Đăng ký tài khoản ngay
        </NavLink>
      </div>

      {/* Modal Hướng Dẫn Kích Hoạt Google OAuth */}
      {showGoogleGuideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGoogleGuideModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kích Hoạt Đăng Nhập Bằng Google</h3>
                <p className="text-xs text-slate-400">Chỉ cần 3 bước đơn giản trên Google Cloud</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Tạo OAuth Client ID:</p>
                  <p className="text-slate-400">Truy cập <strong>Google Cloud Console</strong> &gt; <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong> &gt; Tạo <strong>OAuth 2.0 Client ID</strong> (Web Application).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">Thêm URL Cho Phép (Authorized URIs):</p>
                  <p className="font-mono text-teal-300 bg-slate-900/80 px-2 py-1 rounded-md mt-1 break-all">
                    http://localhost:5173/auth/login<br />
                    http://localhost:5174/auth/login
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Thêm vào file .env:</p>
                  <p className="text-slate-400">Thêm Client ID vào file <strong className="text-white font-mono">frontend/.env</strong>:</p>
                  <p className="font-mono text-cyan-300 bg-slate-900/80 px-2 py-1 rounded-md mt-1 break-all">
                    VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGoogleGuideModal(false)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
