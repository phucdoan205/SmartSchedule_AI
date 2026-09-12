import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { AuthLayout } from './AuthLayout';

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/reset-password');
  };

  return (
    <AuthLayout
      title="Xác Thực Mã OTP"
      description="Mã OTP 6 chữ số đã được gửi tới số điện thoại 0912.***.678"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="
                w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-extrabold
                bg-white/10 border border-white/25 rounded-2xl
                text-teal-300
                focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white/15
                transition-all duration-200
              "
              style={{ width: '2.75rem', height: '3.25rem' }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-xs text-white/45">
          Không nhận được mã?{' '}
          <button
            type="button"
            className="text-teal-300 hover:text-teal-200 font-bold underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Gửi lại OTP (60s)
          </button>
        </div>

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
          <span>Xác Nhận OTP</span>
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
