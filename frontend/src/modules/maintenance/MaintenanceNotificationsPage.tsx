import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle2, AlertTriangle, Download, Plus, Search,
  MapPin, Clock, User, Wrench, Flame, FileText, Loader2, Play, Check, Eye, X
} from 'lucide-react';
import { ScheduleMaintenanceModal } from './ScheduleMaintenanceModal';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { equipmentApi } from '../../services/api';
import { toast } from '../../context/ToastContext';

const TYPE_BADGE: Record<string, string> = {
  'XỬ LÝ SỰ CỐ / THAY LỌC': 'bg-red-100 text-red-700 border-red-200',
  'KHỬ TRÙNG & TEST VI SINH': 'bg-teal-100 text-teal-700 border-teal-200',
  'HIỆU CHUẨN TIA ĐỊNH KỲ': 'bg-sky-100 text-sky-700 border-sky-200',
  'BẢO TRÌ ĐỊNH KỲ': 'bg-slate-100 text-slate-700 border-slate-200',
};

const CATEGORY_BADGE: Record<string, string> = {
  'BẢO TRÌ ĐỊNH KỲ': 'bg-slate-100 text-slate-600',
  'KHỬ TRÙNG & KIỂM ĐỊNH': 'bg-teal-50 text-teal-700',
  'KHỬ TRÙNG & TEST VI SINH': 'bg-teal-50 text-teal-700',
  'HIỆU CHUẨN TIA X-QUANG': 'bg-sky-50 text-sky-700',
  'HIỆU CHUẨN TIA ĐỊNH KỲ': 'bg-sky-50 text-sky-700',
};

const TYPE_FILTERS = [
  { id: 'all', label: 'Tất cả loại hình' },
  { id: 'periodic', label: 'Bảo trì định kỳ' },
  { id: 'sterilize', label: 'Khử trùng buồng máy' },
  { id: 'suco', label: 'Cảnh báo sự cố' },
];

export const MaintenanceNotificationsPage: React.FC = () => {
  const { selectedBranchId, selectedBranch } = useBranch();
  const { user } = useAuth();
  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canCreateUrgent = rolePermissionStore.canCreateUrgentReport(userRoleCode, user);

  const [activeTab, setActiveTab] = useState<'all' | 'history'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Status transition states
  const [completingNotif, setCompletingNotif] = useState<any>(null);
  const [completionFindings, setCompletionFindings] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [selectedDetailNotif, setSelectedDetailNotif] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    upcomingCount: 5,
    urgentCount: 1,
    completedCount: 16,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifsRes, historyRes] = await Promise.all([
        equipmentApi.getNotifications(selectedBranchId),
        equipmentApi.getMaintenanceHistory(selectedBranchId),
      ]);

      if (notifsRes?.data) {
        setNotifications(notifsRes.data);
      }
      if (notifsRes?.metrics) {
        setMetrics(notifsRes.metrics);
      }

      if (historyRes?.data) {
        setHistoryRecords(historyRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông báo bảo trì:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [selectedBranchId]);

  const togglePause = async (equipmentId: string) => {
    try {
      await equipmentApi.togglePause(equipmentId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.equipmentId === equipmentId
            ? { ...n, equipment: { ...n.equipment, isPaused: !n.equipment.isPaused } }
            : n,
        ),
      );
    } catch (err) {
      console.error('Lỗi khi toggle tạm ngưng thiết bị:', err);
    }
  };

  const handleStartMaintenance = async (notif: any) => {
    try {
      await equipmentApi.updateMaintenanceStatus(notif.id, {
        status: 'IN_PROGRESS',
      });
      toast(`Đã bắt đầu tiến trình bảo dưỡng thiết bị [${notif.equipment?.code || ''}]!`, 'info');
      await loadData();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleCompleteMaintenance = async (notif: any, customFindings?: string) => {
    try {
      setIsSubmittingComplete(true);
      await equipmentApi.updateMaintenanceStatus(notif.id, {
        status: 'COMPLETED',
        findings: customFindings || notif.findings || 'Đã hoàn tất bảo dưỡng kỹ thuật, kiểm định đạt chuẩn.',
      });
      toast(
        `Đã bảo trì xong thiết bị [${notif.equipment?.code || ''}]! Đã tự động cập nhật sang trang Lịch sử & danh sách thiết bị.`,
        'success',
      );
      setCompletingNotif(null);
      setCompletionFindings('');
      await loadData();
    } catch (err) {
      console.error('Lỗi khi hoàn tất bảo trì:', err);
      toast('Không thể hoàn tất bảo dưỡng. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  // Filter notifications
  const filteredNotifs = notifications.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      n.logCode?.toLowerCase().includes(q) ||
      n.equipment?.name?.toLowerCase().includes(q) ||
      n.equipment?.code?.toLowerCase().includes(q) ||
      n.actionType?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (typeFilter === 'periodic' && !n.actionType?.includes('ĐỊNH KỲ')) return false;
    if (typeFilter === 'sterilize' && !n.actionType?.includes('KHỬ TRÙNG')) return false;
    if (typeFilter === 'suco' && !n.actionType?.includes('SỰ CỐ') && !n.equipment?.urgencyAlert) return false;

    if (statusFilter === 'done' && n.status !== 'COMPLETED') return false;
    if (statusFilter === 'inprogress' && n.status !== 'IN_PROGRESS') return false;

    return true;
  });

  // Pagination for notifications (10 items per page)
  const itemsPerPage = 10;
  const totalPagesNotif = Math.ceil(filteredNotifs.length / itemsPerPage) || 1;
  const paginatedNotifs = filteredNotifs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination for history (10 items per page)
  const totalPagesHistory = Math.ceil(historyRecords.length / itemsPerPage) || 1;
  const paginatedHistory = historyRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDeviceIcon = (actionType: string) => {
    if (actionType?.includes('KHỬ TRÙNG')) return <Flame className="w-4 h-4 text-teal-600" />;
    if (actionType?.includes('HIỆU CHUẨN')) return <FileText className="w-4 h-4 text-sky-600" />;
    return <Wrench className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header (Đã loại bỏ bộ lọc chi nhánh body, dùng bộ lọc Header duy nhất) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý &amp; Thông báo Lịch Bảo</h2>
          <h2 className="text-xl font-bold text-slate-900">Dưỡng Thiết Bị</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Theo dõi lịch bảo trì sắp tới, tiếp nhận sự cố kỹ thuật và xác nhận hoàn tất bảo dưỡng
            {selectedBranch ? ` tại ${selectedBranch.name}` : ' toàn hệ thống'}.
          </p>
        </div>
        {canCreateUrgent && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Báo sự cố khẩn cấp
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-sky-50 rounded-xl"><Calendar className="w-4 h-4 text-sky-600" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.upcomingCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Lịch bảo trì sắp tới (7 ngày tới)</p>
          <p className="text-[11px] text-slate-400 mt-1">Gồm: 3 ghế, 1 CT, 1 nồi hấp</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-xl"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Khẩn cấp</span>
          </div>
          <p className="text-2xl font-black text-red-700">{metrics.urgentCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Yêu cầu xử lý khẩn cấp / Cảnh báo AI</p>
          <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Cần thay bộ lọc nước Ghế 03
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Tháng này</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.completedCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Đã hoàn tất bảo dưỡng tháng này</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% theo kế hoạch
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">🔔</span>
            Tất cả thông báo bảo trì (Sắp tới &amp; Cần xử lý)
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
              activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {filteredNotifs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setCurrentPage(1);
            }}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">📋</span>
            Lịch sử bảo dưỡng &amp; Kiểm định
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
              activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {historyRecords.length}
            </span>
          </button>
        </div>

        {/* ── Tab: Tất cả thông báo ── */}
        {activeTab === 'all' && (
          <>
            {/* Sub-filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <div className="flex gap-1.5 flex-wrap">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setTypeFilter(f.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      typeFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-3 pr-7 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none"
                  >
                    <option value="all">Trạng thái: Chưa thực hiện</option>
                    <option value="done">Đã hoàn thành</option>
                    <option value="inprogress">Đang thực hiện</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
                </div>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm kiếm mã BT, thiết bị..."
                    className="pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-lg w-48 focus:outline-none bg-white focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Notification list */}
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-sky-600 mb-2" />
                  Đang tải danh sách thông báo bảo trì từ cơ sở dữ liệu...
                </div>
              ) : paginatedNotifs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  Không có thông báo bảo trì nào phù hợp.
                </div>
              ) : (
                paginatedNotifs.map((notif) => {
                  const dev = notif.equipment || {};
                  const isPaused = dev.isPaused;
                  const isScheduled = notif.status === 'COMPLETED' || notif.scheduledAt;
                  const timeFormatted = notif.scheduledAt
                    ? new Date(notif.scheduledAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : '07:30 – Hôm nay';

                  return (
                    <div
                      key={notif.id || notif.logCode}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          {getDeviceIcon(notif.actionType)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                              {notif.logCode}
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {dev.name} ({dev.code})
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                TYPE_BADGE[notif.actionType] || 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {notif.actionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {dev.location || `${dev.branch?.name || 'Khu điều trị'}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeFormatted}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {dev.technician || notif.technician?.fullName || 'KTV. Hoàng Minh'}
                            </span>
                          </div>
                          {dev.urgencyAlert && (
                            <p className="text-[11px] text-red-500 font-semibold">
                              ⚠️ {dev.urgencyAlert}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions & Status Transitions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Tạm ngưng TB toggle */}
                        {canCreateUrgent && (
                          <div className="flex items-center gap-1.5 mr-1">
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Tạm ngưng TB</span>
                            <button
                              type="button"
                              onClick={() => togglePause(dev.id || notif.equipmentId)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                                isPaused ? 'bg-sky-600' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  isPaused ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Interactive Status Transitions */}
                        {notif.status === 'IN_PROGRESS' ? (
                          <>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-sky-500 animate-spin" /> Đang bảo trì
                            </span>
                            {canCreateUrgent && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCompletingNotif(notif);
                                  setCompletionFindings(notif.findings || '');
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" /> Hoàn tất bảo trì
                              </button>
                            )}
                          </>
                        ) : notif.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã hoàn thành
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                              ● Chưa thực hiện
                            </span>
                            {canCreateUrgent && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartMaintenance(notif)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3 text-slate-500" /> Bắt đầu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompletingNotif(notif);
                                    setCompletionFindings(notif.findings || '');
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" /> Đã bảo trì xong
                                </button>
                              </>
                            )}
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedDetailNotif(notif)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-400" /> Chi tiết
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination footer (Requirement 3: 10 items per page) */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-white">
              <span>
                Hiển thị {filteredNotifs.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{' '}
                {Math.min(currentPage * 10, filteredNotifs.length)} trên tổng số {filteredNotifs.length} thông báo (Chuẩn 10 dòng/trang)
              </span>
              <div className="flex items-center gap-1 font-bold">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  &lt; Trước
                </button>
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs">
                  {currentPage} / {totalPagesNotif}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPagesNotif}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Sau &gt;
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Lịch sử ── */}
        {activeTab === 'history' && (
          <>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-sky-600 mb-2" />
                  Đang tải biên bản kiểm định...
                </div>
              ) : paginatedHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  Chưa có biên bản kiểm định nào được hoàn tất.
                </div>
              ) : (
                paginatedHistory.map((record) => {
                  const compDate = record.completedAt
                    ? new Date(record.completedAt).toLocaleDateString('vi-VN')
                    : '12/05/2026';
                  const isCert = record.result === 'certified' || record.isCertified;

                  return (
                    <div
                      key={record.id || record.logCode}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">
                              {record.logCode}
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {record.equipment?.name || 'Thiết bị y tế'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                CATEGORY_BADGE[record.actionType] || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {record.actionType}
                            </span>
                            <span>• Ngày hoàn tất: {compDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                            isCert
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {isCert ? 'Đã cấp chứng nhận' : 'Đã nghiệm thu & Đạt chuẩn'}
                        </span>
                        {record.certificateUrl ? (
                          <a
                            href={record.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Tải biên bản (Cloudinary)
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => alert(`Biên bản kiểm định ${record.logCode}: ${record.findings}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Xem biên bản
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination footer (Requirement 3: 10 items per page) */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-white">
              <span>
                Hiển thị {historyRecords.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{' '}
                {Math.min(currentPage * 10, historyRecords.length)} trên tổng số {historyRecords.length} biên bản (Chuẩn 10 dòng/trang)
              </span>
              <div className="flex items-center gap-1 font-bold">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  &lt; Trước
                </button>
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs">
                  {currentPage} / {totalPagesHistory}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPagesHistory}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Sau &gt;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleMaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={loadData}
      />

      {/* Modal Nghiệm thu & Hoàn tất bảo trì */}
      {completingNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Xác Nhận Hoàn Tất Bảo Trì</h3>
                  <p className="text-[11px] text-slate-500">Mã: {completingNotif.logCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletingNotif(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-800">
                {completingNotif.equipment?.name} ({completingNotif.equipment?.code})
              </p>
              <p className="text-slate-500">Loại hình: {completingNotif.actionType}</p>
              <p className="text-slate-500">Người thực hiện: {completingNotif.technician?.fullName || completingNotif.equipment?.technician || 'KTV. Hoàng Minh'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú nghiệm thu / Kết quả kiểm định
              </label>
              <textarea
                rows={3}
                value={completionFindings}
                onChange={(e) => setCompletionFindings(e.target.value)}
                placeholder="Ví dụ: Đã thay thế bộ lọc nước, kiểm tra áp suất đạt chuẩn, test vô trùng Class B thành công..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50 font-medium"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
              💡 <strong>Tự động đồng bộ:</strong> Sau khi hoàn tất, thông báo này sẽ tự động chuyển sang tab <strong>Lịch sử bảo dưỡng</strong> và thiết bị được chuyển về trạng thái <strong>Đang hoạt động ổn định</strong>.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCompletingNotif(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isSubmittingComplete}
                onClick={() => handleCompleteMaintenance(completingNotif, completionFindings)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmittingComplete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Xác nhận &amp; Cập nhật thiết bị
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết thông báo */}
      {selectedDetailNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {selectedDetailNotif.logCode}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">
                  Chi Tiết Thông Báo Bảo Trì
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailNotif(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Thiết bị:</span>
                  <span className="font-bold text-slate-800">{selectedDetailNotif.equipment?.name} ({selectedDetailNotif.equipment?.code})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loại hình:</span>
                  <span className="font-semibold text-slate-700">{selectedDetailNotif.actionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vị trí:</span>
                  <span className="font-medium text-slate-600">{selectedDetailNotif.equipment?.location || 'Phòng điều trị'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Người phụ trách:</span>
                  <span className="font-bold text-slate-700">{selectedDetailNotif.technician?.fullName || selectedDetailNotif.equipment?.technician || 'KTV. Hoàng Minh'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lịch thực hiện:</span>
                  <span className="font-medium text-slate-600">
                    {selectedDetailNotif.scheduledAt ? new Date(selectedDetailNotif.scheduledAt).toLocaleString('vi-VN') : 'Hôm nay'}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">Nội dung kỹ thuật &amp; Ghi chú:</p>
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-slate-700 font-medium leading-relaxed">
                  {selectedDetailNotif.findings || 'Lịch bảo dưỡng định kỳ và kiểm tra các tiêu chuẩn vận hành an toàn.'}
                </div>
              </div>

              {selectedDetailNotif.equipment?.urgencyAlert && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-semibold flex items-center gap-1.5">
                  ⚠️ {selectedDetailNotif.equipment?.urgencyAlert}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDetailNotif(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule / Emergency maintenance modal */}
      <ScheduleMaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={loadData}
        initialPriority="urgent"
        initialActionType="XỬ LÝ SỰ CỐ / THAY LỌC"
      />
    </div>
  );
};
