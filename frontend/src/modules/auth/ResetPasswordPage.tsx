import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.png';

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
          <h2 className="text-xl font-extrabold text-white">Thiết Lập Mật Khẩu Mới</h2>
          <p className="text-xs text-slate-400">Vui lòng nhập mật khẩu mới có độ dài từ 6 ký tự trở lên</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mật khẩu mới:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Xác nhận mật khẩu mới:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Cập Nhật Mật Khẩu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4 text-xs">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-white text-base">Đổi Mật Khẩu Thành Công!</p>
              <p className="text-slate-400 text-[11px]">Bạn có thể đăng nhập ngay bằng mật khẩu mới vừa thiết lập.</p>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
