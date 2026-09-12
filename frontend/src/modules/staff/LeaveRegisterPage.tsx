import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { MOCK_DOCTORS } from '../../services/mockData';
import { LeaveRequestModal, type LeaveRequestData } from './LeaveRequestModal';

interface LeaveHistoryItem {
  id: string;
  code: string;
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

const INITIAL_LEAVE_HISTORY: LeaveHistoryItem[] = [
  {
    id: 'l-1',
    code: '#NP-2034',
    type: 'Nghỉ phép năm',
    startDate: '24/08/26',
    endDate: '25/08/26',
    days: 2,
    approver: 'Nguyễn Văn A (GĐ)',
    status: 'pending',
    reason: 'Nghỉ phép thường niên kết hợp thăm gia đình.',
    substituteDoctor: 'BS.CKI Nguyễn Văn Tuấn',
    createdAt: 'Hôm nay',
  },
  {
    id: 'l-2',
    code: '#NP-1982',
    type: 'Nghỉ bệnh',
    startDate: '10/05/26',
    endDate: '12/05/26',
    days: 3,
    approver: 'Trần Thị B (TP.NS)',
    status: 'approved',
    reason: 'Nghỉ ốm sốt theo chỉ định của bác sĩ bệnh viện.',
    substituteDoctor: 'BS. Lê Thị Lan',
    createdAt: '10/05/2026',
  },
  {
    id: 'l-3',
    code: '#NP-1845',
    type: 'Nghỉ việc riêng',
    startDate: '02/02/26',
    endDate: '02/02/26',
    days: 1,
    approver: 'Nguyễn Văn A (GĐ)',
    status: 'approved',
    reason: 'Giải quyết thủ tục giấy tờ công chứng hành chính.',
    substituteDoctor: 'BS.CKI Nguyễn Văn Tuấn',
    createdAt: '01/02/2026',
  },
  {
    id: 'l-4',
    code: '#NP-1720',
    type: 'Nghỉ việc riêng',
    startDate: '15/12/25',
    endDate: '16/12/25',
    days: 2,
    approver: 'Trần Thị B (TP.NS)',
    status: 'rejected',
    reason: 'Nghỉ đột xuất trùng lịch hội chẩn cấy ghép All-on-4 toàn viện.',
    substituteDoctor: 'KTV. Hoàng Minh',
    createdAt: '14/12/2025',
  },
  {
    id: 'l-5',
    code: '#NP-1502',
    type: 'Nghỉ phép năm',
    startDate: '05/09/25',
    endDate: '05/09/25',
    days: 1,
    approver: 'Hệ thống (Auto)',
    status: 'approved',
    reason: 'Nghỉ bù lịch trực ca đêm cấp cứu 02/09.',
    substituteDoctor: 'BS. Nguyễn Thị An',
    createdAt: '04/09/2025',
  },
];

export const LeaveRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // History & Modal States
  const [historyList, setHistoryList] = useState<LeaveHistoryItem[]>(INITIAL_LEAVE_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<LeaveHistoryItem | null>(null);

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

  // Approval handlers
  const handleApproveLeave = (id: string) => {
    setHistoryList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'approved' as const,
              approver: 'Nguyễn Văn Quản Lý (Admin)',
            }
          : item
      )
    );
    showToast('✓ Đã phê duyệt đơn nghỉ phép thành công!');
  };

  const handleRejectLeave = (id: string) => {
    setHistoryList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected' as const,
              approver: 'Nguyễn Văn Quản Lý (Admin)',
            }
          : item
      )
    );
    showToast('Đã từ chối đơn xin nghỉ phép.');
  };

  const handleResetStatus = (id: string) => {
    setHistoryList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'pending' as const,
            }
          : item
      )
    );
    showToast('Đã chuyển đơn về trạng thái chờ duyệt.');
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

    const newReq: LeaveHistoryItem = {
      id: `np-${Date.now()}`,
      code: `#NP-${Math.floor(2000 + Math.random() * 8000)}`,
      type: typeLabel,
      startDate: quickStartDate.split('-').reverse().slice(0, 2).join('/'),
      endDate: quickEndDate.split('-').reverse().slice(0, 2).join('/'),
      days: 2,
      approver: 'Nguyễn Văn A (GĐ)',
      status: 'pending',
      reason: quickReason,
      substituteDoctor: quickSubstituteDoctor || 'BS.CKI Nguyễn Văn Tuấn',
      createdAt: 'Hôm nay',
    };

    setHistoryList([newReq, ...historyList]);
    setQuickStartDate('');
    setQuickEndDate('');
    setQuickReason('');
    showToast('✓ Đã gửi đơn xin nghỉ phép thành công! Đang chờ phê duyệt.');
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
      code: data.code || `#NP-${Math.floor(2000 + Math.random() * 8000)}`,
      type: typeLabel,
      startDate: data.startDate.split('-').reverse().slice(0, 2).join('/'),
      endDate: data.endDate.split('-').reverse().slice(0, 2).join('/'),
      days: data.totalDays,
      approver: data.approver,
      status: 'pending',
      reason: data.reason,
      substituteDoctor: data.substituteDoctorName || 'BS.CKI Nguyễn Văn Tuấn',
      createdAt: 'Hôm nay',
    };

    setHistoryList([newReq, ...historyList]);
    showToast('✓ Đã tạo đơn xin nghỉ phép & bàn giao ca trực thành công!');
  };

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

      {/* ─── Page Header Matching "giao diện trang đăng kí nghỉ phép.png" ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Quản lý &amp; Đăng ký ngày nghỉ phép
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase tracking-wider">
              ĐANG ĐĂNG NHẬP: BÁC SĨ ĐIỀU TRỊ
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gửi yêu cầu nghỉ ca, bàn giao lịch khám tự động và theo dõi tiến độ phê duyệt từ ban giám đốc.
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

      {/* ─── 3 KPI Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Số ngày phép năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Số ngày phép năm</span>
            <div className="text-2xl font-black text-slate-900 mt-1">12 ngày</div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Đã dùng: 4
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-600" /> Còn lại: 8
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
            <span className="text-xs font-bold text-slate-400">Đơn chờ duyệt</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {historyList.filter((h) => h.status === 'pending').length} đơn
            </div>
            <button
              type="button"
              onClick={() => {
                const pendingItem = historyList.find((h) => h.status === 'pending');
                if (pendingItem) setSelectedDetailItem(pendingItem);
              }}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2 cursor-pointer"
            >
              <span>Xem chi tiết</span>
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
            <span className="text-xs font-bold text-slate-400">Lịch nghỉ sắp tới</span>
            <div className="text-2xl font-black text-slate-900 mt-1">24/08/2026</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Nghỉ thường niên</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <Plane className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: 2 Columns (40% Left / 60% Right) ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ════ LEFT COLUMN: Tạo đơn xin nghỉ nhanh (5 cols) ════ */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 mb-4">
            <FileText className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-extrabold text-slate-800">
              Tạo đơn xin nghỉ
            </h2>
          </div>

          <form onSubmit={handleQuickSubmit} className="space-y-4 text-xs">
            {/* Loại nghỉ phép */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Loại nghỉ phép <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'annual', label: 'Nghỉ phép năm' },
                    { id: 'sick', label: 'Nghỉ bệnh' },
                    { id: 'personal', label: 'Nghỉ việc riêng' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuickType(t.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      quickType === t.id
                        ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Từ ngày - Đến ngày */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Từ ngày <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={quickStartDate}
                    onChange={(e) => setQuickStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Đến ngày <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={quickEndDate}
                    onChange={(e) => setQuickEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bác sĩ trực thay / Bàn giao ca */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bác sĩ trực thay / Bàn giao ca
              </label>
              <select
                value={quickSubstituteDoctor}
                onChange={(e) => setQuickSubstituteDoctor(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Chọn bác sĩ bàn giao...</option>
                {MOCK_DOCTORS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Lý do nghỉ phép * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lý do nghỉ phép <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
                rows={4}
                placeholder="Nhập lý do chi tiết để quản lý xem xét..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none placeholder:text-slate-400"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi đơn phê duyệt</span>
            </button>
          </form>
        </div>

        {/* ════ RIGHT COLUMN: Lịch sử yêu cầu (7 cols) ════ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-800">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Lịch sử yêu cầu</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                title="Lọc đơn"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => showToast('Đang xuất danh sách lịch sử nghỉ phép...')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                title="Xuất file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Thời gian nghỉ</th>
                  <th className="py-3 px-3 text-center">Số ngày</th>
                  <th className="py-3 px-4">Người duyệt</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Mã đơn */}
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {item.code}
                    </td>

                    {/* Thời gian nghỉ */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                      <div className="font-semibold text-slate-800">
                        {item.startDate} - {item.endDate}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{item.type}</div>
                    </td>

                    {/* Số ngày */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {item.days}
                    </td>

                    {/* Người duyệt */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      {item.approver}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã phê duyệt
                        </span>
                      ) : item.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Từ chối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedDetailItem(item)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-2xs cursor-pointer"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Phê duyệt / Từ chối hoặc Hoàn tác */}
                        {item.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveLeave(item.id)}
                              className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                              title="Phê duyệt đơn này"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectLeave(item.id)}
                              className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                              title="Từ chối đơn này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : item.status === 'approved' ? (
                          <button
                            type="button"
                            onClick={() => handleResetStatus(item.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-colors shadow-2xs cursor-pointer"
                            title="Mở lại / Chuyển về Chờ duyệt"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(item.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                            title="Duyệt lại đơn này"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-white">
            <div>Hiển thị 1-5 trong 12 kết quả</div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 opacity-50 cursor-not-allowed"
              >
                &lt;
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold text-xs"
              >
                2
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal Tạo Đơn Xin Nghỉ Phép Mới (Full modal) ─────────────── */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* ─── Detail Drawer / Modal for History Item ──────────────────── */}
      {selectedDetailItem && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedDetailItem(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Chi Tiết Đơn Nghỉ Phép {selectedDetailItem.code}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thời gian tạo: {selectedDetailItem.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold block">Loại nghỉ phép:</span>
                    <span className="font-bold text-slate-800">{selectedDetailItem.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Số ngày nghỉ:</span>
                    <span className="font-bold text-sky-600">{selectedDetailItem.days} ngày</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Thời gian:</span>
                    <span className="font-bold text-slate-800">
                      {selectedDetailItem.startDate} - {selectedDetailItem.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Trạng thái:</span>
                    <span className="font-bold text-slate-800">
                      {selectedDetailItem.status === 'approved'
                        ? 'Đã phê duyệt'
                        : selectedDetailItem.status === 'rejected'
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Bác sĩ bàn giao ca:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700 font-semibold border border-slate-200">
                    {selectedDetailItem.substituteDoctor}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Lý do nghỉ phép:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-200">
                    {selectedDetailItem.reason}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Người phê duyệt:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700 font-semibold border border-slate-200">
                    {selectedDetailItem.approver}
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {selectedDetailItem.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleRejectLeave(selectedDetailItem.id);
                        setSelectedDetailItem(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Từ chối đơn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveLeave(selectedDetailItem.id);
                        setSelectedDetailItem(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      Phê duyệt đơn này
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-500">
                    Trạng thái:{' '}
                    <span className="font-extrabold text-slate-800">
                      {selectedDetailItem.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
