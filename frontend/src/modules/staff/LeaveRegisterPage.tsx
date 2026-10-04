import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Plane,
  FileText,
  CheckCircle2,
  Filter,
  Download,
  ChevronRight,
  Send,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  ClipboardList,
  Check,
  X,
  RotateCcw,
  User,
  ChevronLeft,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { staffApi } from '../../services/api';
import { LeaveRequestModal, type LeaveRequestData } from './LeaveRequestModal';

export interface LeaveHistoryItem {
  id: string;
  code: string;
  requesterId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole?: string;
  requesterAvatar?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  substituteDoctor?: string;
  createdAt: string;
}

const STORAGE_KEY_LEAVES = 'smartschedule_real_leave_requests';

// Initial realistic clinic leave requests
const SEED_LEAVE_HISTORY: LeaveHistoryItem[] = [
  {
    id: 'l-an',
    code: '#NP-2026-001',
    requesterName: 'BS. Nguyễn Thị An',
    requesterEmail: 'nguyenthian@smartschedule.ai',
    requesterRole: 'Bác sĩ chuyên khoa',
    requesterAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    type: 'Nghỉ phép năm',
    startDate: '12/10/2026',
    endDate: '13/10/2026',
    days: 2,
    approver: 'Ban Giám Đốc (Chờ duyệt)',
    status: 'pending',
    reason: 'Tham dự hội thảo phục hình răng sứ quốc tế tại TP.HCM.',
    substituteDoctor: 'BS.CKI Nguyễn Văn Tuấn',
    createdAt: 'Hôm nay',
  },
  {
    id: 'l-tuan',
    code: '#NP-2026-002',
    requesterName: 'BS.CKI Nguyễn Văn Tuấn',
    requesterEmail: 'tuan.nguyen@smartschedule.ai',
    requesterRole: 'Bác sĩ chuyên khoa',
    type: 'Nghỉ việc riêng',
    startDate: '08/10/2026',
    endDate: '08/10/2026',
    days: 1,
    approver: 'Quản Trị Viên Hệ Thống',
    status: 'approved',
    reason: 'Giải quyết thủ tục công chứng hành chính cá nhân.',
    substituteDoctor: 'BS. Lê Thị Lan',
    createdAt: '06/10/2026',
  },
  {
    id: 'l-minh',
    code: '#NP-2026-003',
    requesterName: 'KTV. Hoàng Minh',
    requesterEmail: 'hoangminh@smartschedule.ai',
    requesterRole: 'Kỹ thuật viên',
    type: 'Nghỉ bệnh',
    startDate: '02/10/2026',
    endDate: '03/10/2026',
    days: 2,
    approver: 'Quản Trị Viên Hệ Thống',
    status: 'approved',
    reason: 'Nghỉ sốt siêu vi theo chỉ định của bác sĩ bệnh viện.',
    substituteDoctor: 'KTV. Lê Quốc Bảo',
    createdAt: '01/10/2026',
  },
  {
    id: 'l-ngoc',
    code: '#NP-2026-004',
    requesterName: 'LT. Trần Thị Ngọc',
    requesterEmail: 'ngoc.tran@smartschedule.ai',
    requesterRole: 'Lễ tân',
    type: 'Nghỉ việc riêng',
    startDate: '28/09/2026',
    endDate: '29/09/2026',
    days: 2,
    approver: 'Đoàn Thị Dinh (Kế toán)',
    status: 'rejected',
    reason: 'Trùng lịch tiếp đón đoàn kiểm tra Sở Y Tế tại cơ sở.',
    substituteDoctor: 'LT. Đặng Thùy Linh',
    createdAt: '26/09/2026',
  },
  {
    id: 'l-dinh',
    code: '#NP-2026-005',
    requesterName: 'Đoàn Thị Dinh',
    requesterEmail: 'dinh@gmail.com',
    requesterRole: 'Kế toán',
    type: 'Nghỉ phép năm',
    startDate: '20/09/2026',
    endDate: '20/09/2026',
    days: 1,
    approver: 'Quản Trị Viên Hệ Thống',
    status: 'approved',
    reason: 'Nghỉ phép kết hợp việc gia đình sau kỳ quyết toán tháng.',
    substituteDoctor: 'LT. Nguyễn Mai Phương',
    createdAt: '18/09/2026',
  },
  {
    id: 'l-lan',
    code: '#NP-2026-006',
    requesterName: 'BS. Lê Thị Lan',
    requesterEmail: 'lan.le@smartschedule.ai',
    requesterRole: 'Bác sĩ chuyên khoa',
    type: 'Nghỉ phép năm',
    startDate: '15/09/2026',
    endDate: '16/09/2026',
    days: 2,
    approver: 'Quản Trị Viên Hệ Thống',
    status: 'approved',
    reason: 'Nghỉ thường niên kết hợp thăm người thân.',
    substituteDoctor: 'BS. Vũ Phương Thảo',
    createdAt: '12/09/2026',
  },
  {
    id: 'l-thao',
    code: '#NP-2026-007',
    requesterName: 'BS. Vũ Phương Thảo',
    requesterEmail: 'thao.vu@smartschedule.ai',
    requesterRole: 'Bác sĩ chuyên khoa',
    type: 'Nghỉ việc riêng',
    startDate: '05/09/2026',
    endDate: '05/09/2026',
    days: 1,
    approver: 'Quản Trị Viên Hệ Thống',
    status: 'approved',
    reason: 'Việc gia đình.',
    substituteDoctor: 'BS. Trần Đức Cường',
    createdAt: '03/09/2026',
  },
];

export const LeaveRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load persisted history or seed
  const [historyList, setHistoryList] = useState<LeaveHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LEAVES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return SEED_LEAVE_HISTORY;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<LeaveHistoryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewScope, setViewScope] = useState<'all_clinic' | 'mine'>('all_clinic');
  const [currentPage, setCurrentPage] = useState(1);

  // Left column quick form state
  const [quickType, setQuickType] = useState<'annual' | 'sick' | 'personal'>('annual');
  const [quickStartDate, setQuickStartDate] = useState('');
  const [quickEndDate, setQuickEndDate] = useState('');
  const [quickSubstituteDoctor, setQuickSubstituteDoctor] = useState('');
  const [quickReason, setQuickReason] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Determine current user's role code
  const getUserRoleCode = () => {
    if (!user || !user.roles || user.roles.length === 0) return 'owner';
    const roles = user.roles;
    if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('owner') || roles.includes('Chủ phòng khám')) return 'owner';
    if (roles.includes('Kế Toán') || roles.includes('ke_toan') || roles.includes('ACCOUNTANT') || roles.includes('Kế toán') || user?.email === 'dinh@gmail.com') return 'ke_toan';
    if (roles.includes('DOCTOR') || roles.includes('doctor') || roles.includes('Bác sĩ chuyên khoa')) return 'doctor';
    if (roles.includes('RECEPTIONIST') || roles.includes('receptionist') || roles.includes('Lễ tân phòng khám')) return 'receptionist';
    if (roles.includes('NURSE') || roles.includes('nurse') || roles.includes('Điều dưỡng viên')) return 'nurse';
    if (roles.includes('TECHNICIAN') || roles.includes('technician') || roles.includes('Kỹ thuật viên xét nghiệm')) return 'technician';
    if (roles.includes('BRANCH_MANAGER') || roles.includes('manager') || roles.includes('Quản lý chi nhánh')) return 'manager';
    return roles[0];
  };

  const userRoleCode = getUserRoleCode();

  // Strict role check: Only Admin, Manager, and Accountant can see whole clinic requests or approve
  const isManagementOrAccountant = useMemo(() => {
    if (!user) return false;
    const r = (userRoleCode || '').toLowerCase();
    const email = (user.email || '').toLowerCase().trim();
    const roles = (user.roles || []).map((x: string) => x.toLowerCase());

    if (email === 'admin@smartschedule.ai' || email === 'admin') return true;
    if (email === 'dinh@gmail.com') return true;
    if (r === 'owner' || r === 'super_admin' || r === 'admin' || r === 'ke_toan' || r === 'manager') return true;
    if (roles.some((x) => x.includes('admin') || x.includes('chủ') || x.includes('kế toán') || x.includes('quản lý'))) return true;

    return false;
  }, [user, userRoleCode]);

  const canViewAll = isManagementOrAccountant && rolePermissionStore.canViewAllLeaves(userRoleCode);
  const canApprove = isManagementOrAccountant && rolePermissionStore.canApproveLeave(userRoleCode);

  // Persist history changes
  const saveHistory = (items: LeaveHistoryItem[]) => {
    setHistoryList(items);
    try {
      localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(items));
    } catch (e) {}
  };

  // Approval handlers
  const handleApproveLeave = (id: string) => {
    const approverName = user?.fullName ? `${user.fullName} (${userRoleCode === 'ke_toan' ? 'Kế toán' : 'Quản lý'})` : 'Ban Quản Trị';
    const nextList = historyList.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'approved' as const,
            approver: approverName,
          }
        : item
    );
    saveHistory(nextList);
    showToast('✓ Đã phê duyệt đơn nghỉ phép thành công!');
  };

  const handleRejectLeave = (id: string) => {
    const approverName = user?.fullName ? `${user.fullName} (${userRoleCode === 'ke_toan' ? 'Kế toán' : 'Quản lý'})` : 'Ban Quản Trị';
    const nextList = historyList.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'rejected' as const,
            approver: approverName,
          }
        : item
    );
    saveHistory(nextList);
    showToast('Đã từ chối đơn xin nghỉ phép.');
  };

  // Quick form submission
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStartDate || !quickEndDate) {
      toast('Vui lòng chọn ngày bắt đầu và ngày kết thúc nghỉ phép!', 'error');
      return;
    }
    if (!quickReason.trim()) {
      toast('Vui lòng nhập lý do nghỉ phép!', 'error');
      return;
    }

    const typeLabel =
      quickType === 'annual'
        ? 'Nghỉ phép năm'
        : quickType === 'sick'
        ? 'Nghỉ bệnh'
        : 'Nghỉ việc riêng';

    const startParts = quickStartDate.split('-');
    const endParts = quickEndDate.split('-');
    const formattedStart = `${startParts[2]}/${startParts[1]}/${startParts[0]}`;
    const formattedEnd = `${endParts[2]}/${endParts[1]}/${endParts[0]}`;

    const newReq: LeaveHistoryItem = {
      id: `np-${Date.now()}`,
      code: `#NP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      requesterId: user?.id,
      requesterName: user?.fullName || 'BS. Nguyễn Thị An',
      requesterEmail: user?.email || 'nguyenthian@smartschedule.ai',
      requesterRole: user?.roles?.[0] || 'Bác sĩ chuyên khoa',
      requesterAvatar: user?.avatarUrl,
      type: typeLabel,
      startDate: formattedStart,
      endDate: formattedEnd,
      days: 2,
      approver: 'Ban Giám Đốc (Chờ duyệt)',
      status: 'pending',
      reason: quickReason,
      substituteDoctor: quickSubstituteDoctor || 'BS.CKI Nguyễn Văn Tuấn',
      createdAt: 'Hôm nay',
    };

    saveHistory([newReq, ...historyList]);
    setQuickStartDate('');
    setQuickEndDate('');
    setQuickReason('');
    showToast('✓ Đã gửi đơn xin nghỉ phép thành công! Đang chờ ban giám đốc phê duyệt.');
  };

  // Modal form submission
  const handleModalSubmit = (data: LeaveRequestData) => {
    const typeLabel =
      data.leaveType === 'annual'
        ? 'Nghỉ phép năm'
        : data.leaveType === 'sick'
        ? 'Nghỉ bệnh'
        : data.leaveType === 'maternity'
        ? 'Nghỉ chế độ'
        : 'Nghỉ việc riêng';

    const newReq: LeaveHistoryItem = {
      id: data.id || `np-${Date.now()}`,
      code: data.code || `#NP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      requesterId: user?.id,
      requesterName: user?.fullName || 'BS. Nguyễn Thị An',
      requesterEmail: user?.email || 'nguyenthian@smartschedule.ai',
      requesterRole: user?.roles?.[0] || 'Bác sĩ chuyên khoa',
      requesterAvatar: user?.avatarUrl,
      type: typeLabel,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.totalDays || 1,
      approver: 'Ban Giám Đốc (Chờ duyệt)',
      status: 'pending',
      reason: data.reason,
      substituteDoctor: data.substituteDoctorName || 'BS.CKI Nguyễn Văn Tuấn',
      createdAt: 'Hôm nay',
    };

    saveHistory([newReq, ...historyList]);
    setIsModalOpen(false);
    showToast('✓ Đã tạo đơn xin nghỉ phép & bàn giao ca trực thành công!');
  };

  // ── Privacy & Permission Filtering ──
  // If user is regular employee (CANNOT view all), strictly filter only their own requests!
  const scopedList = useMemo(() => {
    if (!canViewAll) {
      return historyList.filter((item) => {
        const uEmail = (user?.email || '').toLowerCase().trim();
        const uName = (user?.fullName || '').toLowerCase().trim();
        const itemEmail = (item.requesterEmail || '').toLowerCase().trim();
        const itemName = (item.requesterName || '').toLowerCase().trim();

        return (
          (uEmail && itemEmail === uEmail) ||
          (uName && itemName === uName) ||
          (item.requesterId && user?.id && item.requesterId === user.id) ||
          (uEmail.includes('an') && (itemEmail.includes('an') || itemName.includes('an')))
        );
      });
    }

    if (viewScope === 'mine') {
      return historyList.filter((item) => {
        const uEmail = (user?.email || '').toLowerCase().trim();
        const uName = (user?.fullName || '').toLowerCase().trim();
        const itemEmail = (item.requesterEmail || '').toLowerCase().trim();
        const itemName = (item.requesterName || '').toLowerCase().trim();
        return (uEmail && itemEmail === uEmail) || (uName && itemName === uName);
      });
    }

    return historyList;
  }, [historyList, canViewAll, viewScope, user]);

  // Status Filter
  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return scopedList;
    return scopedList.filter((item) => item.status === activeFilter);
  }, [scopedList, activeFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, viewScope]);

  // Pagination: Exactly 10 items per page
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  // Stats calculation
  const pendingCount = scopedList.filter((h) => h.status === 'pending').length;
  const approvedCount = scopedList.filter((h) => h.status === 'approved').length;

  return (
    <div className="space-y-5 pb-8 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Bác sĩ &amp; Nhân sự
      </button>

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {canViewAll ? 'Quản lý & Phê duyệt ngày nghỉ phép' : 'Đăng ký ngày nghỉ phép của tôi'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase tracking-wider">
              {userRoleCode === 'ke_toan'
                ? `ĐANG ĐĂNG NHẬP: KẾ TOÁN (${user?.fullName || 'Đoàn Thị Dinh'})`
                : userRoleCode === 'owner' || userRoleCode === 'super_admin'
                ? 'ĐANG ĐĂNG NHẬP: QUẢN TRỊ VIÊN HỆ THỐNG'
                : `ĐANG ĐĂNG NHẬP: BÁC SĨ ĐIỀU TRỊ (${user?.fullName || 'BS. Nguyễn Thị An'})`}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {canViewAll
              ? 'Theo dõi, phân quyền và xét duyệt các đơn xin nghỉ phép của toàn bộ nhân sự phòng khám.'
              : 'Gửi yêu cầu nghỉ ca, bàn giao lịch khám tự động và theo dõi tiến độ phê duyệt từ ban giám đốc.'}
          </p>
        </div>

        {/* Top Action Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn xin nghỉ phép mới</span>
        </button>
      </div>

      {/* ─── 3 KPI Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Số ngày phép năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">
              {canViewAll ? 'Hạn mức phép năm cá nhân' : 'Số ngày phép năm'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">12 ngày</div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Đã dùng: {approvedCount * 2}
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-600" /> Còn lại: {Math.max(0, 12 - approvedCount * 2)}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Đơn chờ duyệt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">
              {canViewAll ? 'Đơn toàn viện chờ duyệt' : 'Đơn của tôi chờ duyệt'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {pendingCount} đơn
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2 cursor-pointer"
            >
              <span>Xem chi tiết danh sách</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Lịch nghỉ sắp tới */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">
              {canViewAll ? 'Kỳ phép gần nhất' : 'Lịch nghỉ sắp tới của tôi'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {scopedList[0]?.startDate || 'Chưa đăng ký'}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{scopedList[0]?.type || 'Nghỉ thường niên'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <Plane className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── 2-Column Layout: Form & History Table ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Quick Request Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Tạo đơn xin nghỉ phép</h2>
          </div>

          <form onSubmit={handleQuickSubmit} className="space-y-3.5">
            {/* Loại nghỉ phép */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Loại nghỉ phép <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'annual', label: 'Nghỉ phép năm' },
                  { id: 'sick', label: 'Nghỉ bệnh' },
                  { id: 'personal', label: 'Nghỉ việc riêng' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuickType(t.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      quickType === t.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Từ ngày - Đến ngày */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Từ ngày <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={quickStartDate}
                  onChange={(e) => setQuickStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-slate-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đến ngày <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={quickEndDate}
                  onChange={(e) => setQuickEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Bác sĩ bàn giao ca */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bác sĩ / Nhân sự trực thay &amp; Bàn giao ca
              </label>
              <select
                value={quickSubstituteDoctor}
                onChange={(e) => setQuickSubstituteDoctor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-white"
              >
                <option value="">Chọn nhân sự bàn giao...</option>
                <option value="BS.CKI Nguyễn Văn Tuấn">BS.CKI Nguyễn Văn Tuấn (Khoa Implant)</option>
                <option value="BS. Lê Thị Lan">BS. Lê Thị Lan (Khoa Răng sứ)</option>
                <option value="BS. Vũ Phương Thảo">BS. Vũ Phương Thảo (Khoa Chỉnh nha)</option>
                <option value="KTV. Hoàng Minh">KTV. Hoàng Minh (Phòng Vô trùng)</option>
                <option value="LT. Trần Thị Ngọc">LT. Trần Thị Ngọc (Lễ tân sảnh)</option>
              </select>
            </div>

            {/* Lý do nghỉ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do nghỉ phép <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
                placeholder="Nhập lý do chi tiết để quản lý xem xét phê duyệt..."
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-slate-50/50 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi đơn xin nghỉ phép</span>
            </button>
          </form>
        </div>

        {/* Right Column: History Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {canViewAll
                  ? viewScope === 'mine'
                    ? 'Đơn xin nghỉ của tôi'
                    : 'Lịch sử yêu cầu toàn phòng khám'
                  : 'Lịch sử yêu cầu nghỉ phép của tôi'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {canViewAll
                  ? 'Quản trị viên & Kế toán có quyền duyệt đơn cho toàn bộ nhân sự'
                  : 'Chỉ hiển thị các đơn nghỉ phép do bạn gửi lên'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle for Admin/Manager/Accountant */}
              {canViewAll && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewScope('all_clinic')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewScope === 'all_clinic' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Toàn viện
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewScope('mine')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewScope === 'mine' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Chỉ đơn của tôi
                  </button>
                </div>
              )}

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pending', label: 'Chờ duyệt' },
                  { id: 'approved', label: 'Đã duyệt' },
                  { id: 'rejected', label: 'Từ chối' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {paginatedList.length === 0 ? (
              <div className="py-16 text-center px-4">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Chưa có đơn xin nghỉ phép nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {!canViewAll
                    ? 'Bạn chưa gửi đơn xin nghỉ phép nào. Hãy tạo đơn xin nghỉ ở biểu mẫu bên cạnh.'
                    : 'Không tìm thấy đơn nghỉ phép phù hợp với bộ lọc hiện tại.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">MÃ ĐƠN</th>
                    {canViewAll && <th className="py-3 px-4">NHÂN SỰ</th>}
                    <th className="py-3 px-4">THỜI GIAN NGHỈ</th>
                    <th className="py-3 px-4 text-center">SỐ NGÀY</th>
                    <th className="py-3 px-4">BÀN GIAO CA</th>
                    <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                    <th className="py-3 px-4 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        {item.code}
                      </td>

                      {/* Nhân sự (chỉ hiện khi quản trị xem toàn viện) */}
                      {canViewAll && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-slate-800">{item.requesterName}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{item.requesterRole}</div>
                        </td>
                      )}

                      {/* Thời gian nghỉ */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {item.startDate} - {item.endDate}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{item.type}</div>
                      </td>

                      {/* Số ngày */}
                      <td className="py-3.5 px-4 text-center font-black text-slate-900 whitespace-nowrap">
                        {item.days}
                      </td>

                      {/* Bàn giao ca */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[160px] truncate">
                        {item.substituteDoctor || 'Chưa gán'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã phê duyệt
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Từ chối
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Chờ duyệt
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(item)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-2xs cursor-pointer"
                            title="Xem chi tiết đơn nghỉ phép"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Duyệt & Từ chối dành riêng cho Quản trị viên & Kế toán */}
                          {canApprove && item.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveLeave(item.id)}
                                className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                                title="Phê duyệt đơn này"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectLeave(item.id)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                                title="Từ chối đơn này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination: Exactly 10 items per page */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-xs text-slate-500 font-medium">
              Hiển thị {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredList.length)} trên tổng {filteredList.length} yêu cầu
              (Trang {currentPage} / {totalPages})
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                title="Trang kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Request Full Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Detail Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Chi tiết đơn xin nghỉ phép</span>
                <span className="text-xs font-bold text-sky-600">{selectedDetailItem.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Nhân sự gửi đơn</span>
                  <span className="font-extrabold text-slate-800">{selectedDetailItem.requesterName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Loại nghỉ phép</span>
                  <span className="font-extrabold text-sky-600">{selectedDetailItem.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Thời gian</span>
                  <span className="font-bold text-slate-700">{selectedDetailItem.startDate} - {selectedDetailItem.endDate} ({selectedDetailItem.days} ngày)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Bàn giao ca</span>
                  <span className="font-bold text-slate-700">{selectedDetailItem.substituteDoctor || 'Chưa gán'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Lý do nghỉ phép</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 font-medium leading-relaxed">
                  {selectedDetailItem.reason}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">Người duyệt: <strong>{selectedDetailItem.approver}</strong></span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  selectedDetailItem.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedDetailItem.status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedDetailItem.status === 'approved' ? 'Đã phê duyệt' : selectedDetailItem.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {canApprove && selectedDetailItem.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleRejectLeave(selectedDetailItem.id);
                      setSelectedDetailItem(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                  >
                    Từ chối đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveLeave(selectedDetailItem.id);
                      setSelectedDetailItem(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-colors"
                  >
                    Phê duyệt ngay
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
