import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to reset password page
    navigate('/auth/reset-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="SmartSchedule Logo" className="w-12 h-12 object-contain bg-white/10 p-1.5 rounded-2xl border border-white/20 shadow-md" />
            <div className="text-left">
              <h1 className="text-lg font-extrabold text-white tracking-wide">Răng Hàm Mặt</h1>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                SMARTSCHEDULE AI
              </span>
            </div>
          </NavLink>
          <h2 className="text-xl font-extrabold text-white">Xác Thực Mã OTP</h2>
          <p className="text-xs text-slate-400">
            Mã OTP 6 chữ số đã được gửi tới số điện thoại <strong>0912.***.678</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold bg-slate-950 border border-slate-700/80 rounded-2xl text-sky-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              ))}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              Không nhận được mã?{' '}
              <button type="button" className="text-sky-400 hover:text-sky-300 font-bold underline inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Gửi lại mã OTP (60s)
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Xác Nhận OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs">
            <NavLink to="/auth/login" className="text-slate-400 hover:text-white font-semibold inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
