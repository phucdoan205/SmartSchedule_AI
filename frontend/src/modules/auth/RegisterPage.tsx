import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to OTP verification page
    navigate('/auth/verify-otp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
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
          <h2 className="text-xl font-extrabold text-white">Đăng Ký Tài Khoản Bệnh Nhân</h2>
          <p className="text-xs text-slate-400">Tạo tài khoản để theo dõi lịch sử điều trị & nhận lịch khám AI</p>
        </div>

        {/* Form Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Họ và tên bệnh nhân:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Số điện thoại liên hệ:</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912.345.678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Địa chỉ Email (Tùy chọn):</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: nguyenvanan@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tạo mật khẩu:</label>
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

            <div className="flex items-center gap-2 cursor-pointer text-slate-400 text-[11px] pt-1">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0"
              />
              <span>Tôi đồng ý với điều khoản dịch vụ & chính sách bảo mật EMR</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Đăng Ký & Nhận Mã OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Đã có tài khoản?{' '}
            <NavLink to="/auth/login" className="text-sky-400 hover:text-sky-300 font-bold underline">
              Đăng nhập ngay
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
