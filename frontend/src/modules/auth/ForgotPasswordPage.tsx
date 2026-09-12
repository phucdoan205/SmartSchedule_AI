import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

export const ForgotPasswordPage: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/verify-otp');
  };

  return (
    <AuthLayout
      title="Khôi Phục Mật Khẩu"
      description="Nhập số điện thoại hoặc email đã đăng ký để nhận mã xác thực OTP"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">
            Số điện thoại hoặc Email tài khoản
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="VD: 0912.345.678 hoặc user@gmail.com"
              className="
                w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
                bg-white/10 border border-white/20 text-white placeholder-white/35
                focus:outline-none focus:border-teal-400/60 focus:bg-white/15
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Info hint */}
        <p className="text-xs text-white/40 leading-relaxed bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          Mã OTP 6 chữ số sẽ được gửi đến số điện thoại hoặc email bạn đã đăng ký.
        </p>

        <button
          type="submit"
          className="
            w-full py-3.5 rounded-xl font-extrabold text-sm text-white
            bg-gradient-to-r from-teal-500 to-emerald-500
            hover:from-teal-400 hover:to-emerald-400
            shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30
            transition-all duration-200 active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          <span>Gửi Mã OTP Xác Thực</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-1 border-t border-white/10 text-center text-xs">
        <NavLink
          to="/auth/login"
          className="text-white/45 hover:text-white/80 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Đăng nhập
        </NavLink>
      </div>
    </AuthLayout>
  );
};
