import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText, Filter, Download, Search, Calendar, User,
  Laptop, ChevronDown, CheckCircle2, AlertTriangle, XCircle,
  Clock, Shield, Tag, Loader2, ArrowRight, RefreshCw
} from 'lucide-react';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { auditLogsApi } from '../../services/api';
import { toast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/excelExport';

interface ChildAction {
  id: string;
  logCode: string;
  action: string;
  time: string;
  status: string;
  targetEntity?: string;
  details?: string;
}

interface MasterGroupLog {
  id: string;
  logCode: string;
  createdAt: string;
  date: string;
  module: string;
  user: any;
  actionsCount: number;
  actions: ChildAction[];
}

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState<MasterGroupLog[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalActions: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Accordion: Chỉ mở 1 dòng chi tiết tại một thời điểm
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Danh sách các mô-đun lọc linh hoạt theo toàn bộ hệ thống
  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Nhật Ký' },
    { id: 'APPOINTMENTS', label: 'Lịch Hẹn & Ca Khám' },
    { id: 'EMR', label: 'Hồ Sơ & Bệnh Án' },
    { id: 'FINANCE', label: 'Tài Chính & Thu Chi' },
    { id: 'EQUIPMENT', label: 'Thiết Bị Y Tế' },
    { id: 'RBAC_SECURITY', label: 'Phân Quyền & Bảo Mật' },
    { id: 'STAFF', label: 'Nhân Sự & Lương Bổng' },
    { id: 'SERVICES', label: 'Dịch Vụ & Bảng Giá' },
    { id: 'BRANCHES', label: 'Chi Nhánh & Cơ Sở' },
    { id: 'SYSTEM', label: 'Cấu Hình Hệ Thống' },
  ];

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditLogsApi.getAll({
        module: activeTab !== 'all' ? activeTab : undefined,
        timeFilter: timeFilter !== 'all' ? timeFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: 10, // Chuẩn 10 log tổng bên ngoài mỗi trang
      });

      if (res?.data) {
        setLogs(res.data);
      }
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Lỗi khi tải nhật ký hệ thống:', err);
      toast('Không thể tải nhật ký hệ thống từ cơ sở dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeFilter, searchQuery, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedLogId(null);
  }, [activeTab, timeFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Handle accordion toggle
  const toggleRow = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  // Format date helper (DD/MM/YYYY cho dòng tổng bên ngoài)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Hôm nay';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Lấy vai trò hiển thị thân thiện, liên kết trực tiếp với vai trò thật của tài khoản
  const getStaffDisplayRole = (logUser?: any) => {
    if (!logUser) return 'Hệ thống SmartSchedule AI Engine';
    const rawRole = logUser.userRoles?.[0]?.role?.name || '';
    const upper = rawRole.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'CLINIC_OWNER' || upper === 'OWNER' || upper.includes('CHỦ PHÒNG KHÁM')) return 'Chủ phòng khám';
    if (upper.includes('DOCTOR') || upper.includes('BÁC SĨ')) return 'Bác sĩ chuyên khoa';
    if (upper.includes('RECEPTIONIST') || upper.includes('LỄ TÂN')) return 'Lễ tân phòng khám';
    if (upper.includes('NURSE') || upper.includes('ĐIỀU DƯỠNG')) return 'Điều dưỡng viên';
    if (upper === 'TECHNICIAN' || upper.includes('KỸ THUẬT') || upper.includes('KTV')) return 'Kỹ thuật viên';
    if (upper.includes('BRANCH_MANAGER') || upper.includes('MANAGER') || upper.includes('QUẢN LÝ')) return 'Quản lý chi nhánh';
    if (upper.includes('KẾ TOÁN') || upper.includes('ACCOUNTANT')) return 'Kế toán viên';
    if (rawRole) return rawRole;
    return 'Nhân sự phòng khám';
  };


  // Module badge style
  const getModuleBadge = (mod?: string) => {
    const m = (mod || '').toUpperCase();
    if (m.includes('EMR')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (m.includes('FINANCE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (m.includes('APPOINTMENT')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (m.includes('EQUIPMENT')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (m.includes('RBAC') || m.includes('SECURITY')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (m.includes('STAFF')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (m.includes('SERVICE')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (m.includes('BRANCH')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Status badge style
  const renderStatusBadge = (status?: string) => {
    const s = (status || 'SUCCESS').toUpperCase();
    if (s === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Thành công
        </span>
      );
    }
    if (s === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> Cảnh báo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">
        <XCircle className="w-3 h-3 text-red-500" /> Thất bại
      </span>
    );
  };

  // Export Excel
  const handleExport = () => {
    if (!logs || logs.length === 0) {
      toast('Không có dữ liệu nhật ký để xuất', 'info');
      return;
    }

    const flatRows: any[] = [];
    logs.forEach((group) => {
      const groupDate = formatDate(group.createdAt);
      const userName = group.user?.fullName || 'Hệ thống SmartSchedule AI Engine';
      const userRole = getStaffDisplayRole(group.user);
      const empCode = group.user?.employeeCode || '-';

      group.actions.forEach((act) => {
        flatRows.push({
          'Mã Log': act.logCode || group.logCode,
          'Ngày': groupDate,
          'Giờ': act.time,
          'Mô-đun': group.module,
          'Hành động': act.action,
          'Đối tượng tác động': act.targetEntity || '-',
          'Chi tiết': act.details || '-',
          'Người thực hiện': userName,
          'Mã nhân sự': empCode,
          'Vai trò': userRole,
          'Trạng thái': act.status || 'SUCCESS',
        });
      });
    });

    exportToExcel(flatRows, `Nhat_Ky_He_Thong_${new Date().toISOString().slice(0, 10)}`);
    toast('Đã xuất báo cáo nhật ký kiểm toán thành công', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/80 uppercase tracking-wider flex items-center gap-1.5">
                <ScrollText className="w-3.5 h-3.5" />
                Audit Logs Enterprise
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • Cập nhật tự động thời gian thực
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Nhật Ký Kiểm Toán &amp; Thao Tác Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ dữ liệu thay đổi trên mọi mô-đun được gom nhóm theo phiên làm việc, chuẩn bảo mật Y Tế &amp; RBAC.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={loadAuditLogs}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Tabs phân hệ & Bộ lọc thời gian */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Scrollable Tabs */}
          <div className="flex-1 overflow-x-auto pb-1 lg:pb-0">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo Mã log (LOG-YYYY-XXXX), tên nhân sự, đối tượng tác động hoặc hành động..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Log Table: 1 trang hiển thị chuẩn 10 LOG TỔNG bên ngoài */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[150px] whitespace-nowrap">
                  Mã log &amp; Ngày
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[220px]">
                  Nhân sự thực hiện
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[200px] whitespace-nowrap">
                  Phân loại mô-đun
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[130px] whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    Đang tải nhật ký kiểm toán hệ thống từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-xs font-semibold">
                    Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                logs.map((group) => {
                  const isExpanded = expandedLogId === group.id;
                  const userName = group.user?.fullName || 'Hệ thống SmartSchedule AI Engine';
                  const userRole = getStaffDisplayRole(group.user);
                  const employeeCode = group.user?.employeeCode ? `(${group.user.employeeCode})` : '';
                  const logCode = group.logCode || group.id;

                  return (
                    <React.Fragment key={group.id}>
                      {/* Collapsed Main Row: Log Tổng bên ngoài */}
                      <tr
                        onClick={() => toggleRow(group.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-sky-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Cột 1: Mã Log đại diện & Ngày ngoài bảng */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-extrabold text-sky-700 bg-sky-50 border border-sky-100/90 px-2.5 py-1 rounded-lg text-xs tracking-wide inline-block">
                            {logCode}
                          </span>
                          <p className="text-[11px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(group.createdAt)}
                          </p>
                        </td>

                        {/* Cột 2: Tên nhân sự & vai trò thật */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs overflow-hidden">
                              {group.user?.avatarUrl ? (
                                <img
                                  src={group.user.avatarUrl}
                                  alt={userName}
                                  className="w-full h-full object-cover"
                                />
                              ) : group.user ? (
                                <User className="w-4 h-4 text-slate-500" />
                              ) : (
                                <Laptop className="w-4 h-4 text-indigo-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                {userName}
                                {employeeCode && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {employeeCode}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                {userRole}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Mô-đun + số lượng hành động con */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase ${getModuleBadge(
                                group.module,
                              )}`}
                            >
                              {group.module}
                            </span>
                            {group.actionsCount > 1 && (
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                                {group.actionsCount} hành động
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 4: Nút Xem chi tiết */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(group.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span>
                              {isExpanded
                                ? 'Thu gọn'
                                : group.actionsCount > 1
                                ? `Xem chi tiết (${group.actionsCount})`
                                : 'Xem chi tiết'}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Accordion: Danh sách các hành động con (Bỏ IP, bỏ thiết bị, bỏ ngày) */}
                      {isExpanded && (
                        <tr className="bg-sky-50/20 border-b border-sky-100">
                          <td colSpan={4} className="px-6 py-4 animate-in fade-in duration-150">
                            <div className="bg-white rounded-2xl border border-sky-200/80 p-4 shadow-2xs space-y-3">
                              {/* Header Accordion */}
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                  <ScrollText className="w-4 h-4 text-sky-600" />
                                  Các hành động đã thực hiện ({group.actions.length} hành động):
                                </p>
                              </div>

                              {/* Danh sách hành động con: Chỉ Giờ (HH:mm:ss) + Tên hành động + Trạng thái */}
                              <div className="divide-y divide-slate-100">
                                {group.actions.map((act, idx) => (
                                  <div
                                    key={act.id || idx}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                      idx > 0 ? 'pt-3' : 'pt-1'
                                    } pb-2`}
                                  >
                                    {/* Bên trái: Giờ chính xác (HH:mm:ss) & Tên hành động cụ thể */}
                                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-sky-700 bg-sky-50 px-2 py-1 rounded-md border border-sky-100 shrink-0">
                                        <Clock className="w-3 h-3 text-sky-500" />
                                        {act.time}
                                      </span>

                                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <span className="font-extrabold text-slate-800 leading-snug">
                                          {act.action}
                                        </span>
                                        {act.targetEntity && (
                                          <span className="font-bold text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md shrink-0">
                                            {act.targetEntity}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Bên phải: Trạng thái của từng hành động con */}
                                    <div className="shrink-0 sm:pl-2">
                                      {renderStatusBadge(act.status)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer: Chuẩn 10 LOG TỔNG bên ngoài / trang */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-white">
          <span>
            Hiển thị {logs.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{' '}
            {Math.min(currentPage * 10, pagination.total || logs.length)} trên tổng số{' '}
            <strong className="text-slate-800">{pagination.total || logs.length}</strong> log tổng
            hệ thống (Chuẩn 10 log tổng/trang bên ngoài)
          </span>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
            >
              &lt; Trước
            </button>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-extrabold text-xs">
              {currentPage} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= (pagination.totalPages || 1) || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Sau &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
