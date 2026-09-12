import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

/**
 * Trang đăng nhập thống nhất — 1 form duy nhất cho tất cả loại tài khoản.
 * Backend phân loại người dùng qua credentials.
 */
export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: gọi API login, backend trả về role để redirect
    navigate('/admin/overview');
  };

  return (
    <AuthLayout
      title="Chào Mừng Trở Lại"
      description="Đăng nhập vào hệ thống quản lý & đặt lịch nha khoa thông minh"
    >
      <form onSubmit={handleLogin} className="space-y-4">

        {/* Identity Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">
            Số điện thoại, Email hoặc Mã nhân viên
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="VD: 0912345678 / user@gmail.com / BS001"
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
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
          className="
            w-full py-3.5 mt-1 rounded-xl font-extrabold text-sm text-white
            bg-gradient-to-r from-teal-500 to-emerald-500
            hover:from-teal-400 hover:to-emerald-400
            shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30
            transition-all duration-200 active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng Nhập</span>
        </button>
      </form>

      {/* Divider + Register */}
      <div className="pt-1 border-t border-white/10 text-center text-xs text-white/45">
        Chưa có tài khoản bệnh nhân?{' '}
        <NavLink
          to="/auth/register"
          className="text-teal-300 hover:text-teal-200 font-bold underline underline-offset-2 transition-colors"
        >
          Đăng ký ngay
        </NavLink>
      </div>
    </AuthLayout>
  );
};
