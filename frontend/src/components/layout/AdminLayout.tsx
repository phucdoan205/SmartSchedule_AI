import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: sidebar ẩn, dùng drawer overlay
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-800">

      {/* ── Mobile backdrop overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Desktop: luôn hiển thị cố định bên trái, không cuộn theo trang. Mobile: drawer từ trái */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto lg:h-screen lg:shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main Container ── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
