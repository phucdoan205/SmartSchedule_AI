import React from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import bgImg from '../../assets/ảnh background.png';

interface AuthLayoutProps {
  /** Tiêu đề trang, ví dụ: "Đăng Ký Tài Khoản" */
  title?: string;
  /** Mô tả ngắn dưới tiêu đề */
  description?: string;
  children: React.ReactNode;
}

/**
 * Layout dùng chung cho tất cả trang xác thực.
 *
 * Thiết kế: ảnh background phòng khám + overlay mờ nhẹ
 * Card: glassmorphism trắng trong suốt — hài hoà với tông màu sáng của clinic.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => {
  return (
    <div
      className="min-h-screen flex items-start sm:items-center justify-center py-8 px-4 relative overflow-y-auto font-sans"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-teal-950/60 to-slate-900/75 pointer-events-none" />

      {/* Glow accents */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[300px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main content column */}
      <div className="max-w-md w-full relative z-10 flex flex-col gap-4 sm:gap-5 my-auto">

        {/* ── Brand Header ── */}
        <div className="text-center flex flex-col items-center gap-2">
          <NavLink to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src={logoImg} alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            </div>
            <div className="text-left">
              <p className="text-lg sm:text-xl font-extrabold text-white drop-shadow tracking-wide leading-tight">
                Răng Hàm Mặt
              </p>
              <span className="text-[10px] font-bold tracking-widest text-teal-300 uppercase bg-teal-950/60 border border-teal-700/60 px-2 py-0.5 rounded-full">
                SmartSchedule AI
              </span>
            </div>
          </NavLink>

          {title && (
            <h1 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md mt-1">{title}</h1>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-white/60 max-w-xs leading-relaxed">{description}</p>
          )}
        </div>

        {/* ── Glass Card ── */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 space-y-4 sm:space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
};
