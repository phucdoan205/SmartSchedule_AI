import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  PhoneCall,
  MapPin,
  Clock,
  Menu,
  X,
  User,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface UserLayoutProps {
  onOpenBookingWizard?: () => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ onOpenBookingWizard }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Trang chủ', end: true },
    { path: '/doctors', label: 'Đội ngũ bác sĩ' },
    { path: '/pricing', label: 'Bảng giá dịch vụ' },
    { path: '/ai-consultation', label: 'AI tư vấn phác đồ', highlight: true },
    { path: '/lookup', label: 'Tra cứu lịch hẹn' },
    { path: '/profile', label: 'Hồ sơ cá nhân' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Main Header / Navbar (thanh menu.png) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <img src={logoImg} alt="SmartSchedule Logo" className="w-11 h-11 object-contain rounded-xl bg-sky-50 p-1 border border-sky-100 shadow-xs" />
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                Răng Hàm Mặt 
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Hệ Thống Nha Khoa & Đặt Lịch Khám Thông Minh</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs font-bold'
                      : link.highlight
                      ? 'text-indigo-600 bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-100'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
                {link.highlight && <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-all flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={onOpenBookingWizard}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Lịch Ngay (AI)</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive ? 'bg-sky-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBookingWizard?.();
                }}
                className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Đặt Lịch Ngay (AI)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo" className="w-10 h-10 object-contain rounded-xl bg-slate-800 p-1" />
              <h3 className="text-base font-bold text-white">SmartSchedule AI</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Hệ thống phòng khám Răng Hàm Mặt ứng dụng trí tuệ nhân tạo tối ưu thời gian chờ & nâng cao chất lượng điều trị.
            </p>
            <div className="flex items-center gap-2 text-teal-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 100% Khám đúng giờ hẹn
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hệ Thống Chi Nhánh</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>CN1: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>CN2: 456 Nguyễn Lương Bằng, Phú Mỹ Hưng, Q7</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>CN3: 789 Võ Văn Ngân, TP. Thủ Đức</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dịch Vụ Nổi Bật</h4>
            <ul className="space-y-2 text-[11px]">
              <li>• Cấy ghép Implant Kỹ Thuật Số</li>
              <li>• Niềng răng Thẩm Mỹ Invisalign</li>
              <li>• Tẩy trắng răng Laser Whitening</li>
              <li>• Nhổ răng khôn sóng âm Piezotome</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tổng Đài Hỗ Trợ</h4>
            <p className="text-lg font-extrabold text-sky-400">1900 8888</p>
            <p className="text-[11px] text-slate-400">Email: cskh@smartschedule.ai</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenBookingWizard}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold rounded-xl border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" /> Đặt lịch hẹn trực tuyến
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
          © 2026 SmartSchedule AI System. Tất cả quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
};
