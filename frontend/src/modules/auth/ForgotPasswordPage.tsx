import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const ForgotPasswordPage: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to OTP verification page
    navigate('/auth/verify-otp');
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
          <h2 className="text-xl font-extrabold text-white">Khôi Phục Mật Khẩu</h2>
          <p className="text-xs text-slate-400">Nhập số điện thoại hoặc email đã đăng ký để nhận mã xác thực OTP</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Số điện thoại hoặc Email tài khoản:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="VD: 0912.345.678 hoặc user@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Gửi Mã OTP Xác Thực</span>
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
