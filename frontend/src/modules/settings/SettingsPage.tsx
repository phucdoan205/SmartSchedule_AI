import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Save,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Filter,
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
  CheckCircle2,
  X,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface PermissionRow {
  id: string;
  module: string;
  permissionName: string;
  owner: boolean;
  doctor: boolean;
  receptionist: boolean;
}

export const SettingsPage: React.FC = () => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>('owner');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Permission Matrix State
  const [permissions, setPermissions] = useState<PermissionRow[]>([
    // Module: Lịch hẹn thông minh
    { id: '1', module: 'Module: Lịch hẹn thông minh', permissionName: 'Xem lịch hẹn (Toàn bộ)', owner: true, doctor: true, receptionist: true },
    { id: '2', module: 'Module: Lịch hẹn thông minh', permissionName: 'Sửa / Hủy lịch hẹn', owner: true, doctor: false, receptionist: true },

    // Module: AI Insights
    { id: '3', module: 'Module: AI Insights', permissionName: 'Truy cập AI Insights', owner: true, doctor: true, receptionist: false },
    { id: '4', module: 'Module: AI Insights', permissionName: 'Cấu hình thuật toán xếp ca AI', owner: true, doctor: false, receptionist: false },

    // Module: Khách hàng & Bệnh án
    { id: '5', module: 'Module: Khách hàng & Bệnh án', permissionName: 'Xem hồ sơ & Sơ đồ răng EMR', owner: true, doctor: true, receptionist: false },
    { id: '6', module: 'Module: Khách hàng & Bệnh án', permissionName: 'Chỉnh sửa thông tin bệnh nhân', owner: true, doctor: true, receptionist: true },

    // Module: Báo cáo & Tài chính
    { id: '7', module: 'Module: Báo cáo & Tài chính', permissionName: 'Xem báo cáo doanh thu chi tiết', owner: true, doctor: false, receptionist: false },
    { id: '8', module: 'Module: Báo cáo & Tài chính', permissionName: 'Lập phiếu thu & Hóa đơn khám', owner: true, doctor: false, receptionist: true },

    // Module: Quản lý nhân sự & Cấu hình
    { id: '9', module: 'Module: Quản lý nhân sự & Cấu hình', permissionName: 'Chỉnh sửa danh sách nhân sự & Lương', owner: true, doctor: false, receptionist: false },
    { id: '10', module: 'Module: Quản lý nhân sự & Cấu hình', permissionName: 'Thay đổi phân quyền hệ thống (RBAC)', owner: true, doctor: false, receptionist: false },
  ]);

  // Group permissions by module
  const groupedPermissions = permissions.reduce<Record<string, PermissionRow[]>>((acc, item) => {
    if (!acc[item.module]) acc[item.module] = [];
    acc[item.module].push(item);
    return acc;
  }, {});

  // Collapsible module states: default first module open, others collapsed for neatness
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    'Module: Lịch hẹn thông minh': true,
  });

  const toggleModule = (moduleTitle: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleTitle]: !prev[moduleTitle],
    }));
  };

  const moduleTitles = Object.keys(groupedPermissions);
  const allExpanded = moduleTitles.length > 0 && moduleTitles.every((title) => !!openModules[title]);

  const toggleAllModules = () => {
    if (allExpanded) {
      setOpenModules({});
    } else {
      const allOpen: Record<string, boolean> = {};
      moduleTitles.forEach((title) => {
        allOpen[title] = true;
      });
      setOpenModules(allOpen);
    }
  };

  const getModuleIcon = (moduleName: string) => {
    if (moduleName.includes('Lịch hẹn')) return Calendar;
    if (moduleName.includes('AI')) return Sparkles;
    if (moduleName.includes('Khách hàng') || moduleName.includes('Bệnh án')) return Users;
    if (moduleName.includes('Tài chính') || moduleName.includes('Báo cáo')) return DollarSign;
    return ShieldCheck;
  };

  const togglePermission = (id: string, roleKey: 'owner' | 'doctor' | 'receptionist') => {
    setPermissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [roleKey]: !item[roleKey] } : item))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    toast('Đã lưu thành công ma trận phân quyền hệ thống RBAC!');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    toast(`Đã thêm thành công chức vụ mới: ${newRoleName}!`);
    setNewRoleName('');
    setNewRoleDesc('');
    setIsAddRoleModalOpen(false);
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
            Quản lý ma trận truy cập (Role-Based Access Control) cho hệ thống Bệnh Viện Răng Hàm Mặt.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-800 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-600" />Thêm chức vụ
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu cấu hình
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Đã lưu thành công ma trận phân quyền RBAC! Các thay đổi có hiệu lực ngay lập tức.</span>
        </div>
      )}

      {/* Main Content Grid: Left Role List & Right Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 of 12) - Ma trận Role-Based Access: Tự động vừa vặn cả dọc và ngang */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 h-fit self-start">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" /> Ma trận Role-Based Access
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Định nghĩa các nhóm vai trò cơ bản trong quy trình vận hành phòng khám nha khoa.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Card 1: Chủ phòng khám */}
            <div
              onClick={() => setSelectedRoleTab('owner')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedRoleTab === 'owner'
                  ? 'bg-sky-50/80 border-sky-300 shadow-2xs ring-1 ring-sky-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 truncate">Chủ phòng khám</h4>
                  <p className="text-[11px] text-sky-700 font-semibold mt-0.5">(Toàn quyền)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Card 2: Bác sĩ chuyên khoa */}
            <div
              onClick={() => setSelectedRoleTab('doctor')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedRoleTab === 'doctor'
                  ? 'bg-sky-50/80 border-sky-300 shadow-2xs ring-1 ring-sky-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 truncate">Bác sĩ chuyên khoa</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">(Chuyên môn)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Card 3: Lễ tân / Kỹ thuật */}
            <div
              onClick={() => setSelectedRoleTab('receptionist')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedRoleTab === 'receptionist'
                  ? 'bg-sky-50/80 border-sky-300 shadow-2xs ring-1 ring-sky-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 truncate">Lễ tân / Kỹ thuật</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">(Vận hành)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column (8 of 12) - Bảng phân quyền chi tiết với Accordion thu gọn / mở rộng */}
        <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Bảng phân quyền chi tiết</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nhấp vào từng module để thu gọn hoặc mở rộng danh sách quyền hạn
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleAllModules}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-sky-600" />
                <span>{allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-extrabold">
                  <th className="py-3 px-4 w-1/2 min-w-[200px] bg-slate-50 text-slate-700 font-extrabold">Module & Quyền hạn</th>
                  <th
                    onClick={() => setSelectedRoleTab('owner')}
                    className={`py-3 px-3 text-center min-w-[100px] cursor-pointer select-none transition-all ${
                      selectedRoleTab === 'owner'
                        ? 'bg-sky-100/90 text-sky-900 font-black border-b-2 border-sky-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Nhấp để xem quyền hạn của Chủ phòng khám"
                  >
                    Chủ phòng khám
                  </th>
                  <th
                    onClick={() => setSelectedRoleTab('doctor')}
                    className={`py-3 px-3 text-center min-w-[100px] cursor-pointer select-none transition-all ${
                      selectedRoleTab === 'doctor'
                        ? 'bg-sky-100/90 text-sky-900 font-black border-b-2 border-sky-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Nhấp để xem quyền hạn của Bác sĩ chuyên khoa"
                  >
                    Bác sĩ chuyên khoa
                  </th>
                  <th
                    onClick={() => setSelectedRoleTab('receptionist')}
                    className={`py-3 px-3 text-center min-w-[100px] cursor-pointer select-none transition-all ${
                      selectedRoleTab === 'receptionist'
                        ? 'bg-sky-100/90 text-sky-900 font-black border-b-2 border-sky-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Nhấp để xem quyền hạn của Lễ tân / Kỹ thuật"
                  >
                    Lễ tân / Kỹ thuật
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupedPermissions).map(([moduleTitle, rows]) => {
                  const isOpen = !!openModules[moduleTitle];
                  const ModuleIcon = getModuleIcon(moduleTitle);

                  return (
                    <React.Fragment key={moduleTitle}>
                      {/* Module Category Header - Click to toggle */}
                      <tr
                        onClick={() => toggleModule(moduleTitle)}
                        className="bg-slate-50/90 hover:bg-sky-50/70 border-t border-slate-200 cursor-pointer select-none transition-colors group"
                        title={isOpen ? 'Nhấp để thu gọn module' : 'Nhấp để mở rộng module'}
                      >
                        <td colSpan={4} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 font-extrabold text-slate-900 text-xs">
                              <div className="p-1 rounded-lg bg-white border border-slate-200/80 text-slate-500 group-hover:text-sky-600 group-hover:border-sky-200 transition-colors shadow-2xs">
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isOpen ? '' : '-rotate-90'
                                  }`}
                                />
                              </div>
                              <ModuleIcon className="w-4 h-4 text-sky-600 shrink-0" />
                              <span className="group-hover:text-sky-700 transition-colors">{moduleTitle}</span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                                {rows.length} quyền
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold text-sky-600 group-hover:underline">
                              {isOpen ? 'Thu gọn ▲' : 'Mở rộng ▼'}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Permission Rows - shown only if isOpen */}
                      {isOpen &&
                        rows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6 font-medium text-slate-800">{row.permissionName}</td>

                            {/* Owner Checkbox */}
                            <td
                              className={`py-3 px-3 text-center transition-colors ${
                                selectedRoleTab === 'owner' ? 'bg-sky-50/50' : 'bg-transparent'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePermission(row.id, 'owner');
                                }}
                                className="p-1 rounded text-sky-600 hover:bg-sky-50 transition-colors"
                              >
                                {row.owner ? (
                                  <div className="w-5 h-5 bg-sky-600 text-white rounded flex items-center justify-center mx-auto shadow-2xs">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center mx-auto" />
                                )}
                              </button>
                            </td>

                            {/* Doctor Checkbox */}
                            <td
                              className={`py-3 px-3 text-center transition-colors ${
                                selectedRoleTab === 'doctor' ? 'bg-sky-50/50' : 'bg-transparent'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePermission(row.id, 'doctor');
                                }}
                                className="p-1 rounded text-sky-600 hover:bg-sky-50 transition-colors"
                              >
                                {row.doctor ? (
                                  <div className="w-5 h-5 bg-sky-600 text-white rounded flex items-center justify-center mx-auto shadow-2xs">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center mx-auto" />
                                )}
                              </button>
                            </td>

                            {/* Receptionist Checkbox */}
                            <td
                              className={`py-3 px-3 text-center transition-colors ${
                                selectedRoleTab === 'receptionist' ? 'bg-sky-50/50' : 'bg-transparent'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePermission(row.id, 'receptionist');
                                }}
                                className="p-1 rounded text-sky-600 hover:bg-sky-50 transition-colors"
                              >
                                {row.receptionist ? (
                                  <div className="w-5 h-5 bg-sky-600 text-white rounded flex items-center justify-center mx-auto shadow-2xs">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center mx-auto" />
                                )}
                              </button>
                            </td>
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

      {/* Modal: Thêm chức vụ mới */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" /> Thêm Chức Vụ Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chức vụ / Vai trò:</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="VD: Bác sĩ trợ lý, Kế toán..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả quyền hạn:</label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Mô tả công việc và mức độ phân quyền trong hệ thống..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Tạo Chức Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
