import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/verify-otp');
  };

  const inputCls = `
    w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
    bg-white/10 border border-white/20 text-white placeholder-white/35
    focus:outline-none focus:border-teal-400/60 focus:bg-white/15
    transition-all duration-200
  `;

  return (
    <AuthLayout
      title="Đăng Ký Tài Khoản"
      description="Tạo hồ sơ bệnh nhân để theo dõi lịch sử điều trị & đặt lịch AI"
    >
      <form onSubmit={handleRegister} className="space-y-4">

        {/* Họ tên */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">Họ và tên bệnh nhân</label>
          <div className="relative">
            <User className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className={inputCls}
            />
          </div>
        </div>

        {/* Số điện thoại */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">Số điện thoại liên hệ</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912.345.678"
              className={inputCls}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">
            Email{' '}
            <span className="text-white/40 font-normal text-xs">(tuỳ chọn)</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: nguyenvanan@gmail.com"
              className={inputCls}
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">Tạo mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputCls} pr-11`}
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

        {/* Điều khoản */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-0.5">
          <input
            type="checkbox"
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded bg-white/10 border border-white/30 text-teal-500 focus:ring-0 focus:ring-offset-0 shrink-0"
          />
          <span className="text-xs text-white/55 font-medium leading-relaxed">
            Tôi đồng ý với{' '}
            <span className="text-teal-300 underline underline-offset-2">điều khoản dịch vụ</span>
            {' '}& chính sách bảo mật hồ sơ EMR
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="
            w-full py-3.5 rounded-xl font-extrabold text-sm text-white mt-1
            bg-gradient-to-r from-teal-500 to-emerald-500
            hover:from-teal-400 hover:to-emerald-400
            shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30
            transition-all duration-200 active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          <span>Đăng Ký & Nhận Mã OTP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-1 border-t border-white/10 text-center text-xs text-white/45">
        Đã có tài khoản?{' '}
        <NavLink
          to="/auth/login"
          className="text-teal-300 hover:text-teal-200 font-bold underline underline-offset-2 transition-colors"
        >
          Đăng nhập ngay
        </NavLink>
      </div>
    </AuthLayout>
  );
};
