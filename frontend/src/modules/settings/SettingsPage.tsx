import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Save,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  CheckSquare,
  Square,
  Calendar,
  Sparkles,
  Users,
  DollarSign,
  Settings,
  Stethoscope,
  UserCheck,
  Building2,
  Building,
  CheckCircle2,
  X,
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  Wrench,
  Bell,
  ScrollText,
  Award,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import {
  rolePermissionStore,
  type SystemRoleItem,
  type SystemModuleItem,
  type MatrixState,
} from '../../services/rolePermissionStore';

export const SettingsPage: React.FC = () => {
  const [roles, setRoles] = useState<SystemRoleItem[]>(() => rolePermissionStore.getRoles());
  const [modules] = useState<SystemModuleItem[]>(() => rolePermissionStore.getModules());
  const [matrix, setMatrix] = useState<MatrixState>(() => rolePermissionStore.getMatrix());

  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('owner');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Refs for horizontal auto-scroll to selected role column
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  // Auto-scroll table horizontally when role selection changes
  useEffect(() => {
    const container = tableScrollRef.current;
    const colEl = colRefs.current[selectedRoleCode];
    if (!container || !colEl) return;

    // Calculate target scroll: center the selected column in the visible area
    // Account for sticky first column width (~280px)
    const stickyWidth = 280;
    const containerWidth = container.clientWidth;
    const colLeft = colEl.offsetLeft;
    const colWidth = colEl.offsetWidth;
    const scrollTarget = colLeft - stickyWidth - (containerWidth - stickyWidth) / 2 + colWidth / 2;

    container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
  }, [selectedRoleCode]);

  // Wrap setSelectedRoleCode to keep API consistent
  const selectRole = useCallback((code: string) => {
    setSelectedRoleCode(code);
  }, []);

  // Collapsible module states: all collapsed by default for a cleaner view
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = rolePermissionStore.subscribe(() => {
      setRoles(rolePermissionStore.getRoles());
      setMatrix(rolePermissionStore.getMatrix());
    });
    return unsubscribe;
  }, []);

  const toggleModuleAccordion = (moduleCode: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleCode]: !prev[moduleCode],
    }));
  };

  const allExpanded = modules.length > 0 && modules.every((m) => !!openModules[m.code]);

  const toggleAllModules = () => {
    if (allExpanded) {
      setOpenModules({});
    } else {
      const allOpen: Record<string, boolean> = {};
      modules.forEach((m) => {
        allOpen[m.code] = true;
      });
      setOpenModules(allOpen);
    }
  };

  // Icon mapping helper
  const renderModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'Users':
        return <Users className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'CalendarDays':
        return <CalendarDays className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'Receipt':
        return <Receipt className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-slate-600 shrink-0" />;
      case 'Bell':
        return <Bell className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'ScrollText':
        return <ScrollText className="w-4 h-4 text-slate-600 shrink-0" />;
      case 'Settings':
        return <Settings className="w-4 h-4 text-slate-600 shrink-0" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />;
    }
  };

  const renderRoleIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Building2':
      case 'Building':
        return <Building2 className="w-5 h-5 text-white" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-white" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-white" />;
      case 'Award':
        return <Award className="w-5 h-5 text-white" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-white" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-white" />;
    }
  };

  // Toggle Module Level Checkbox for a role (affects Sidebar display)
  const toggleModuleForRole = (roleCode: string, moduleCode: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      const roleMap = { ...(next[roleCode] || {}) };
      const currentModule = roleMap[moduleCode] || { enabled: false, subPermissions: {} };
      const target = modules.find((m) => m.code === moduleCode);

      const newEnabled = !currentModule.enabled;
      const newSubPerms: Record<string, boolean> = {};

      if (target) {
        target.subPermissions.forEach((sp) => {
          // If turning on, enable all sub-permissions; if turning off, disable all
          newSubPerms[sp.code] = newEnabled;
        });
      }

      roleMap[moduleCode] = {
        enabled: newEnabled,
        subPermissions: newSubPerms,
      };

      next[roleCode] = roleMap;
      return next;
    });
  };

  // Toggle Sub-permission Checkbox for a role
  const toggleSubPermissionForRole = (roleCode: string, moduleCode: string, subPermCode: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      const roleMap = { ...(next[roleCode] || {}) };
      const currentModule = roleMap[moduleCode] || { enabled: false, subPermissions: {} };
      const currentSubPerms = { ...currentModule.subPermissions };

      const newSubVal = !currentSubPerms[subPermCode];
      currentSubPerms[subPermCode] = newSubVal;

      // If at least one sub-permission is on, module is enabled on sidebar
      const hasAnyOn = Object.values(currentSubPerms).some(Boolean);

      roleMap[moduleCode] = {
        enabled: hasAnyOn,
        subPermissions: currentSubPerms,
      };

      next[roleCode] = roleMap;
      return next;
    });
  };

  // Save changes
  const handleSave = () => {
    rolePermissionStore.saveMatrix(matrix);
    setSavedSuccess(true);
    toast('Đã lưu thành công ma trận phân quyền hệ thống & đồng bộ Sidebar!', 'success');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Create new role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const created = rolePermissionStore.addRole(newRoleName, newRoleDesc);
    toast(`Đã thêm thành công chức vụ mới: ${created.name}!`, 'success');
    setNewRoleName('');
    setNewRoleDesc('');
    setIsAddRoleModalOpen(false);
    setSelectedRoleCode(created.code);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
            Bệnh Viện Răng Hàm Mặt Việt Anh Đức
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Cấu hình phân quyền & Phân vai trò
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý ma trận truy cập (Role-Based Access Control), đồng bộ vai trò nhân sự & module hiển thị trên Sidebar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-800 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Thêm chức vụ</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Đã lưu thành công ma trận phân quyền RBAC! Thanh Sidebar và danh sách nhân sự đã được cập nhật ngay lập tức.</span>
        </div>
      )}

      {/* Main Content Grid: Left Role List & Right Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 of 12) - Ma trận Role-Based Access */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col" style={{ maxHeight: '82vh' }}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Danh Sách Vai Trò &amp; Chức Vụ
              <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {roles.length} vai trò
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Tự động đồng bộ với danh sách nhân sự. Chọn vai trò để chỉnh sửa quyền.
            </p>
          </div>

          {/* Scrollable role list */}
          <div className="overflow-y-auto flex-1 px-3 py-3 space-y-1">
            {roles.map((r) => {
              const isSelected = selectedRoleCode === r.code;
              const dotColor =
                r.code === 'owner'
                  ? 'bg-sky-500'
                  : r.code === 'doctor'
                  ? 'bg-teal-500'
                  : r.code === 'receptionist'
                  ? 'bg-slate-700'
                  : r.code === 'nurse'
                  ? 'bg-emerald-500'
                  : r.code === 'technician'
                  ? 'bg-amber-500'
                  : r.code === 'manager'
                  ? 'bg-indigo-500'
                  : 'bg-violet-500';

              const iconBg =
                r.code === 'owner'
                  ? 'bg-sky-600'
                  : r.code === 'doctor'
                  ? 'bg-teal-600'
                  : r.code === 'receptionist'
                  ? 'bg-slate-800'
                  : r.code === 'nurse'
                  ? 'bg-emerald-600'
                  : r.code === 'technician'
                  ? 'bg-amber-600'
                  : r.code === 'manager'
                  ? 'bg-indigo-600'
                  : 'bg-violet-600';

              return (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => selectRole(r.code)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-200'
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Colored icon badge */}
                  <div
                    className={`w-8 h-8 rounded-lg ${iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {renderRoleIcon(r.iconName)}
                  </div>

                  {/* Name + subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-extrabold text-[12px] truncate ${isSelected ? 'text-sky-900' : 'text-slate-900'}`}>
                        {r.name}
                      </span>
                      {!r.isSystem && (
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 shrink-0">
                          Tự tạo
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 font-semibold ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
                      {r.subtitle}
                    </p>
                  </div>

                  {/* Active indicator */}
                  <div className={`shrink-0 transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}>
                    <div className={`w-1.5 h-6 rounded-full ${dotColor}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add role button — pinned at bottom */}
          <div className="px-3 pb-4 pt-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddRoleModalOpen(true)}
              className="w-full py-2.5 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Chức Vụ Mới</span>
            </button>
          </div>
        </div>

        {/* Right Column (8 of 12) - Bảng phân quyền chi tiết */}
        <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Bảng phân quyền chi tiết (RBAC Matrix)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ô tick ở tiêu đề module quyết định <strong>hiển thị trên Sidebar</strong>. Nhấp <strong>▼ Mở rộng</strong> để xem chức năng con.
                <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                  {modules.length} module
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleAllModules}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-sky-600" />
                <span>{allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
              </button>
            </div>
          </div>

          {/* Matrix Table — fixed height so all module names stay visible */}
          <div ref={tableScrollRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '72vh' }}>
            <table className="w-full text-left text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-extrabold">
                  <th className="py-3 px-4 w-[280px] min-w-[260px] bg-slate-50 text-slate-800 font-extrabold sticky left-0 z-20 border-r border-slate-200" style={{ boxShadow: '2px 0 6px -2px rgba(0,0,0,0.08)' }}>
                    Module Sidebar & Quyền hạn
                  </th>
                  {roles.map((r) => {
                    const isSelected = selectedRoleCode === r.code;
                    return (
                      <th
                        key={r.code}
                        ref={(el) => { colRefs.current[r.code] = el; }}
                        onClick={() => selectRole(r.code)}
                        className={`py-3 px-3 text-center min-w-[100px] cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-sky-100/90 text-sky-900 font-black border-b-2 border-sky-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title={`Nhấp để chọn vai trò ${r.name}`}
                      >
                        <span className="block truncate max-w-[100px] mx-auto text-[11px]">{r.name}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {modules.map((mod) => {
                  const isOpen = !!openModules[mod.code];

                  return (
                    <React.Fragment key={mod.code}>
                      {/* Module Header Row — compact for overview */}
                      <tr className={`hover:bg-slate-100/80 transition-colors border-t border-slate-200 ${isOpen ? 'bg-sky-50/60' : 'bg-slate-50/70'}`}>
                        {/* Module title & accordion toggle — sticky first column */}
                        <td
                          className={`py-2 px-4 font-bold text-slate-900 sticky left-0 z-10 border-r border-slate-200 ${isOpen ? 'bg-sky-50/80' : 'bg-slate-50/95'}`}
                          style={{ boxShadow: '2px 0 6px -2px rgba(0,0,0,0.08)' }}
                        >
                          <div
                            onClick={() => toggleModuleAccordion(mod.code)}
                            className="flex items-center gap-2 cursor-pointer select-none"
                          >
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            {renderModuleIcon(mod.iconName)}
                            <span className="truncate text-[12px]">{mod.name}</span>
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded shrink-0">
                              {mod.subPermissions.length} quyền
                            </span>
                          </div>
                        </td>

                        {/* Module Level Checkbox for Each Role */}
                        {roles.map((r) => {
                          const isModuleEnabled = Boolean(matrix[r.code]?.[mod.code]?.enabled);
                          const isColumnSelected = selectedRoleCode === r.code;

                          return (
                            <td
                              key={r.code}
                              className={`py-2 px-3 text-center transition-colors ${
                                isColumnSelected ? 'bg-sky-50/50' : ''
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleModuleForRole(r.code, mod.code)}
                                title={
                                  isModuleEnabled
                                    ? `Đang BẬT trên Sidebar cho ${r.name} (Nhấp để tắt)`
                                    : `Đang TẮT trên Sidebar cho ${r.name} (Nhấp để bật)`
                                }
                                className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                              >
                                {isModuleEnabled ? (
                                  <CheckSquare className="w-5 h-5 text-sky-600 fill-sky-50" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Sub-permissions Rows (When Module Expanded) */}
                      {isOpen &&
                        mod.subPermissions.map((sp) => (
                          <tr key={sp.code} className="hover:bg-sky-50/30 transition-colors">
                            {/* Sub-permission Name & Indent — sticky first column */}
                            <td
                              className="py-2.5 pl-10 pr-4 text-slate-700 font-medium sticky left-0 z-10 bg-white border-r border-slate-100"
                              style={{ boxShadow: '2px 0 6px -2px rgba(0,0,0,0.06)' }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                <span>{sp.name}</span>
                              </div>
                            </td>

                            {/* Sub-permission Checkbox for Each Role */}
                            {roles.map((r) => {
                              const isChecked = Boolean(
                                matrix[r.code]?.[mod.code]?.subPermissions?.[sp.code]
                              );
                              const isColumnSelected = selectedRoleCode === r.code;

                              return (
                                <td
                                  key={r.code}
                                  className={`py-2 px-3 text-center transition-colors ${
                                    isColumnSelected ? 'bg-sky-50/50' : ''
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleSubPermissionForRole(r.code, mod.code, sp.code)
                                    }
                                    title={isChecked ? 'Bỏ chọn quyền này' : 'Cấp quyền này'}
                                    className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-teal-600 fill-teal-50" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Thêm Chức Vụ Mới */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" /> Thêm Chức Vụ Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tên chức vụ / Vai trò (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Dược sĩ phòng khám, Kế toán trưởng..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Mô tả nhiệm vụ</label>
                <textarea
                  rows={3}
                  placeholder="VD: Quản lý kho dược liệu, xuất thuốc kê đơn theo toa bác sĩ..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo Chức Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
