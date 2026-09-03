import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'user' | 'staff' | 'admin') || 'user';

  const [activeTab, setActiveTab] = useState<'user' | 'staff' | 'admin'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form Inputs
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'user') {
      navigate('/profile');
    } else {
      navigate('/admin/overview');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="SmartSchedule Logo" className="w-12 h-12 object-contain bg-white/10 p-1.5 rounded-2xl border border-white/20 shadow-md" />
            <div className="text-left">
              <h1 className="text-lg font-extrabold text-white tracking-wide">Răng Hàm Mặt</h1>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                SMARTSCHEDULE AI
              </span>
            </div>
          </NavLink>
          <p className="text-xs text-slate-400">Đăng nhập vào hệ thống quản lý & đặt lịch thông minh</p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'user' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Người dùng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'staff' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Bác sĩ & NV</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </button>
          </div>

          {/* Form Description Banner */}
          <div className="p-3 bg-sky-950/50 rounded-2xl border border-sky-800/40 text-[11px] text-sky-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            {activeTab === 'user' && <span>Đăng nhập dành cho Bệnh nhân tra cứu hồ sơ & lịch hẹn</span>}
            {activeTab === 'staff' && <span>Đăng nhập dành cho Bác sĩ, Điều dưỡng & Nhân viên y tế</span>}
            {activeTab === 'admin' && <span>Đăng nhập dành cho Quản trị viên & Ban giám đốc</span>}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                {activeTab === 'user' ? 'Số điện thoại hoặc Email:' : activeTab === 'staff' ? 'Mã nhân viên hoặc Email:' : 'Tài khoản Quản trị viên:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder={activeTab === 'user' ? 'VD: 0912345678 hoặc user@gmail.com' : activeTab === 'staff' ? 'VD: BS001 hoặc doc@smartschedule.ai' : 'VD: admin'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                {activeTab === 'user' ? (
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">Mật khẩu:</label>
                {activeTab === 'user' && (
                  <NavLink to="/auth/forgot-password" className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold">
                    Quên mật khẩu?
                  </NavLink>
                )}
              </div>
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {activeTab === 'user' ? 'Đăng Nhập Khách Hàng' : activeTab === 'staff' ? 'Đăng Nhập Cổng Bác Sĩ' : 'Đăng Nhập Quản Trị Hệ Thống'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Register Link for User Tab */}
          {activeTab === 'user' && (
            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <NavLink to="/auth/register" className="text-sky-400 hover:text-sky-300 font-bold underline">
                Đăng ký tài khoản mới
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
