import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, LogIn } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  const inputCls = `
    w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium
    bg-white/10 border border-white/20 text-white placeholder-white/35
    focus:outline-none focus:border-teal-400/60 focus:bg-white/15
    transition-all duration-200
  `;

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-2 space-y-4">
          {/* Success icon */}
          <div className="w-16 h-16 bg-emerald-400/15 border border-emerald-400/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white">Đổi Mật Khẩu Thành Công!</p>
            <p className="text-sm text-white/50 mt-1">
              Bạn có thể đăng nhập ngay bằng mật khẩu mới vừa thiết lập.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="
              w-full py-3.5 rounded-xl font-extrabold text-sm text-white mt-2
              bg-gradient-to-r from-teal-500 to-emerald-500
              hover:from-teal-400 hover:to-emerald-400
              shadow-lg shadow-teal-500/25
              transition-all duration-200 active:scale-[0.98]
              flex items-center justify-center gap-2
            "
          >
            <LogIn className="w-4 h-4" />
            Đăng Nhập Ngay
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Thiết Lập Mật Khẩu Mới"
      description="Vui lòng nhập mật khẩu mới có độ dài từ 6 ký tự trở lên"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* New password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">Mật khẩu mới</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
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

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
        </div>

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
          <span>Cập Nhật Mật Khẩu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthLayout>
  );
};
