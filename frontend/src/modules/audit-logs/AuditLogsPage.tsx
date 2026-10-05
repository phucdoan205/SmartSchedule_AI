import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText, Filter, Download, Search, Calendar, User,
  Laptop, ChevronDown, CheckCircle2, AlertTriangle, XCircle,
  Clock, Shield, Tag, Loader2, ArrowRight
} from 'lucide-react';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { auditLogsApi } from '../../services/api';
import { toast } from '../../context/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Accordion: Chỉ mở 1 dòng duy nhất, bấm sang người khác tự động thu gọn người đang xem
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Nhật Ký' },
    { id: 'APPOINTMENTS', label: 'Lịch Hẹn & Ca Khám' },
    { id: 'EMR', label: 'Hồ Sơ & Bệnh Án' },
    { id: 'FINANCE', label: 'Tài Chính & Thu Chi' },
    { id: 'EQUIPMENT', label: 'Thiết Bị Y Tế' },
    { id: 'RBAC_SECURITY', label: 'Bác Sĩ & Phân Quyền' },
  ];

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditLogsApi.getAll({
        module: activeTab !== 'all' ? activeTab : undefined,
        timeFilter: timeFilter !== 'all' ? timeFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: 10,
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

  // Handle accordion toggle (chỉ mở 1 người tại một thời điểm)
  const toggleRow = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  // Format date helper (chỉ ngày ngoài bảng)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Hôm nay';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format only time (HH:mm:ss) cho từng hành động con bên trong
  const formatTimeOnly = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Lấy vai trò hiển thị thân thiện, liên kết trực tiếp với vai trò thật của tài khoản
  const getStaffDisplayRole = (logUser?: any) => {
    if (!logUser) return 'Hệ thống AI Core';
    const rawRole = logUser.userRoles?.[0]?.role?.name || '';
    const upper = rawRole.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'CLINIC_OWNER' || upper === 'OWNER') return 'Chủ phòng khám';
    if (upper === 'DOCTOR') return 'Bác sĩ chuyên khoa';
    if (upper === 'RECEPTIONIST') return 'Lễ tân phòng khám';
    if (upper === 'NURSE') return 'Điều dưỡng viên';
    if (upper === 'TECHNICIAN') return 'Kỹ thuật viên xét nghiệm';
    if (upper === 'BRANCH_MANAGER' || upper === 'MANAGER') return 'Quản lý chi nhánh';
    if (rawRole) return rawRole; // e.g. "Kế Toán"
    return 'Nhân viên y tế';
  };

  // Gom nhóm nhật ký: Nếu cùng Ngày + Mô-đun + Người thực hiện thì gom thành 1 nhật ký với nhiều hành động con
  interface AuditLogChildAction {
    id: string;
    logCode?: string;
    action: string;
    time: string;
    createdAt: string;
    status: string;
    targetEntity?: string;
  }

  interface GroupedAuditLog {
    id: string;
    logCode: string;
    createdAt: string;
    module: string;
    user: any;
    actions: AuditLogChildAction[];
  }

  const groupedLogs = React.useMemo<GroupedAuditLog[]>(() => {
    const groups: GroupedAuditLog[] = [];
    const map = new Map<string, GroupedAuditLog>();

    logs.forEach((item) => {
      const dateKey = new Date(item.createdAt).toISOString().slice(0, 10);
      const modKey = (item.module || '').toUpperCase();
      const userKey = item.userId || 'system';
      const groupKey = `${dateKey}_${modKey}_${userKey}`;

      const childAction: AuditLogChildAction = {
        id: item.id,
        logCode: item.logCode,
        action: item.action,
        time: formatTimeOnly(item.createdAt),
        createdAt: item.createdAt,
        status: item.status || 'SUCCESS',
        targetEntity: item.targetEntity,
      };

      if (map.has(groupKey)) {
        const g = map.get(groupKey)!;
        g.actions.push(childAction);
      } else {
        const newGroup: GroupedAuditLog = {
          id: item.id,
          logCode: item.logCode || item.id,
          createdAt: item.createdAt,
          module: item.module,
          user: item.user,
          actions: [childAction],
        };
        map.set(groupKey, newGroup);
        groups.push(newGroup);
      }
    });

    return groups;
  }, [logs]);

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
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Status badge style
  const renderStatusBadge = (status?: string) => {
    const s = (status || 'SUCCESS').toUpperCase();
    if (s === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Thành công
        </span>
      );
    }
    if (s === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> Cảnh báo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3 text-red-500" /> Thất bại
      </span>
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast('Không có dữ liệu để xuất file', 'info');
      return;
    }
    const headers = ['Mã Log', 'Thời gian', 'Người thực hiện', 'Mô-đun', 'Hành động', 'Chi tiết', 'Đối tượng', 'Trạng thái', 'IP'];
    const rows = logs.map((l) => [
      l.logCode || l.id,
      new Date(l.createdAt).toLocaleString('vi-VN'),
      l.user?.fullName || 'Hệ thống SmartSchedule AI Engine',
      l.module,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.targetEntity || '',
      l.status || 'SUCCESS',
      l.ipAddress || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Đã xuất file nhật ký log (.CSV) thành công!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-600" /> Nhật Ký Truy Cập &amp; Thao Tác Hệ Thống (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi lại toàn bộ lịch sử thao tác của bác sĩ, nhân viên, thay đổi bệnh án &amp; tiến trình AI từ cơ sở dữ liệu thật
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-600" /> Xuất File Nhật Ký Log
        </button>
      </div>

      {/* Tabs Switcher & Time Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative pt-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pt-1 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo Mã log, tên nhân sự, đối tượng tác động hoặc hành động..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50 font-medium"
          />
        </div>
      </div>

      {/* Accordion Log Table: Không còn cột Trạng thái bên ngoài, gom nhóm mô-đun */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[150px] whitespace-nowrap">
                  Mã log &amp; Ngày
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[200px]">
                  Nhân sự thực hiện
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[150px] whitespace-nowrap">
                  Phân loại mô-đun
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide min-w-[120px] whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    Đang tải nhật ký truy cập &amp; thao tác hệ thống từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : groupedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-xs font-semibold">
                    Không tìm thấy bản ghi nhật ký nào phù hợp.
                  </td>
                </tr>
              ) : (
                groupedLogs.map((group) => {
                  const isExpanded = expandedLogId === group.id;
                  const userName = group.user?.fullName || 'Hệ thống SmartSchedule AI Engine';
                  const userRole = getStaffDisplayRole(group.user);
                  const employeeCode = group.user?.employeeCode ? `(${group.user.employeeCode})` : '';

                  return (
                    <React.Fragment key={group.id}>
                      {/* Collapsed Main Row (Không có cột trạng thái bên ngoài) */}
                      <tr
                        onClick={() => toggleRow(group.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-sky-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Cột 1: Mã Log & Ngày */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-extrabold text-sky-700 bg-sky-50 border border-sky-100/90 px-2.5 py-1 rounded-lg text-xs tracking-wide inline-block">
                            {group.logCode}
                          </span>
                          <p className="text-[11px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(group.createdAt)}
                          </p>
                        </td>

                        {/* Cột 2: Tên nhân sự & vai trò thật */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                              {group.user ? (
                                <User className="w-4 h-4 text-slate-500" />
                              ) : (
                                <Laptop className="w-4 h-4 text-indigo-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                {userName}
                                <span className="text-[10px] text-slate-400 font-normal">{employeeCode}</span>
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
                            {group.actions.length > 1 && (
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                                {group.actions.length} hành động
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 4: Nút mở rộng / thu gọn */}
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
                                : group.actions.length > 1
                                ? `Xem chi tiết (${group.actions.length})`
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

                      {/* Expanded Accordion Details: Bỏ IP, bỏ thiết bị, bỏ chi tiết dài; chỉ để lại thời gian HH:mm:ss, tên hành động và trạng thái riêng */}
                      {isExpanded && (
                        <tr className="bg-sky-50/20 border-b border-sky-100">
                          <td colSpan={4} className="px-6 py-4 animate-fadeIn">
                            <div className="bg-white rounded-2xl border border-sky-200/80 p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                  <ScrollText className="w-4 h-4 text-sky-600" />
                                  Hành động đã thực hiện ({group.actions.length} hành động):
                                </p>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {group.actions.map((act, idx) => (
                                  <div
                                    key={act.id || idx}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                      idx > 0 ? 'pt-3' : 'pt-1'
                                    } pb-2`}
                                  >
                                    {/* Bên trái: Thời gian chính xác (HH:mm:ss) & Tên hành động đã làm */}
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

        {/* Pagination Footer: Chuẩn 10 dữ liệu/trang */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-white">
          <span>
            Hiển thị {logs.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{' '}
            {Math.min(currentPage * 10, pagination.total || logs.length)} trên tổng số{' '}
            {pagination.total || logs.length} bản ghi nhật ký (Chuẩn 10 dữ liệu/trang)
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
