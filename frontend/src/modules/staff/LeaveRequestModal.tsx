import React, { useState } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  Upload,
  Send,
  Save,
  CheckCircle2,
  CalendarCheck,
  ChevronDown,
  User,
  FileText,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { MOCK_DOCTORS } from '../../services/mockData';

export interface LeaveRequestData {
  id?: string;
  code?: string;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity';
  startDate: string;
  endDate: string;
  startShift: string;
  endShift: string;
  totalDays: number;
  substituteDoctorId: string;
  substituteDoctorName?: string;
  approver: string;
  reason: string;
  attachedFile?: string;
  notifyZalo: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestData) => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'maternity'>('annual');
  const [startDate, setStartDate] = useState('2026-08-24');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [startShift, setStartShift] = useState('Ca Sáng (08:00 - 12:00)');
  const [endShift, setEndShift] = useState('Ca Chiều (13:30 - 17:30)');
  const [substituteDoctorId, setSubstituteDoctorId] = useState(MOCK_DOCTORS[0]?.id || 'nv-001');
  const [approver, setApprover] = useState('Nguyễn Văn A (Giám Đốc Điều Hành / Trưởng khoa)');
  const [reason, setReason] = useState('');
  const [notifyZalo, setNotifyZalo] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSubstituteDoctor =
    MOCK_DOCTORS.find((d) => d.id === substituteDoctorId) || MOCK_DOCTORS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const calculateDays = () => {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const diff = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 2;
    }
  };

  const handleSubmitForm = (isDraft = false) => {
    if (!isDraft && !reason.trim()) {
      toast('Vui lòng nhập lý do chi tiết để ban giám đốc xem xét phê duyệt!', 'error');
      return;
    }

    const data: LeaveRequestData = {
      id: `np-${Date.now()}`,
      code: `#NP-${Math.floor(1000 + Math.random() * 9000)}`,
      leaveType,
      startDate,
      endDate,
      startShift,
      endShift,
      totalDays: calculateDays(),
      substituteDoctorId,
      substituteDoctorName: selectedSubstituteDoctor.name,
      approver,
      reason: reason || 'Đơn xin nghỉ phép thường niên',
      attachedFile: fileName || undefined,
      notifyZalo,
      status: isDraft ? 'pending' : 'pending',
      createdAt: 'Hôm nay',
    };

    onSubmit(data);
    toast(
      isDraft
        ? 'Đã lưu bản nháp đơn xin nghỉ phép thành công!'
        : 'Đã gửi đơn xin nghỉ phép lên ban giám đốc thành công!'
    );
    onClose();
  };

  const leaveTypeOptions = [
    {
      id: 'annual' as const,
      label: 'Nghỉ phép năm',
      badge: 'Khả dụng: 8 ngày',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'sick' as const,
      label: 'Nghỉ bệnh / Khám bệnh',
    },
    {
      id: 'personal' as const,
      label: 'Nghỉ việc riêng / Không lương',
    },
    {
      id: 'maternity' as const,
      label: 'Nghỉ chế độ (Thai sản/Cưới hỏi)',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/80 shadow-2xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Tạo Đơn Xin Nghỉ Phép &amp; Bàn Giao Ca
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hệ thống tự động kiểm tra lịch khám đã đặt và gửi thông báo bàn giao ca cho bác sĩ trực thay.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: 2 Columns */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* ════ LEFT COLUMN: Loại nghỉ phép & Thời gian (5 cols) ════ */}
              <div className="md:col-span-5 space-y-4">
                {/* Loại nghỉ phép */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    LOẠI NGHỈ PHÉP
                  </label>
                  <div className="space-y-2">
                    {leaveTypeOptions.map((opt) => {
                      const isSelected = leaveType === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setLeaveType(opt.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-400 shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-sky-600 bg-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-sky-600" />
                              )}
                            </span>
                            <span
                              className={`text-xs ${
                                isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>

                          {opt.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${opt.badgeColor}`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Thời gian nghỉ */}
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    THỜI GIAN NGHỈ
                  </label>

                  {/* Dates: Từ ngày - Đến ngày */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-1">
                        Từ ngày
                      </span>
                      <div className="relative">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-1">
                        Đến ngày
                      </span>
                      <div className="relative">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shifts: Ca bắt đầu - Ca kết thúc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <select
                        value={startShift}
                        onChange={(e) => setStartShift(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white text-[11px] font-medium text-slate-800 focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        <option>Ca Sáng (08:00 - 12:00)</option>
                        <option>Ca Chiều (13:30 - 17:30)</option>
                        <option>Cả ngày (08:00 - 17:30)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={endShift}
                        onChange={(e) => setEndShift(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white text-[11px] font-medium text-slate-800 focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        <option>Ca Chiều (13:30 - 17:30)</option>
                        <option>Ca Sáng (08:00 - 12:00)</option>
                        <option>Cả ngày (08:00 - 17:30)</option>
                      </select>
                    </div>
                  </div>

                  {/* Proposed Total Days Box */}
                  <div className="p-3.5 rounded-xl border border-sky-200/80 bg-sky-50/70 flex items-center justify-between text-xs text-sky-950 font-semibold">
                    <span>Tổng thời gian đề xuất:</span>
                    <span className="text-sm font-black text-sky-700">
                      {calculateDays()} ngày công
                    </span>
                  </div>
                </div>
              </div>

              {/* ════ RIGHT COLUMN: Bàn giao ca & Phê duyệt (7 cols) ════ */}
              <div className="md:col-span-7 space-y-4">
                {/* Bàn giao ca trực */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      BÀN GIAO CA TRỰC
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                    Chọn bác sĩ trực thay thế trong thời gian bạn vắng mặt.
                  </p>

                  <div className="relative">
                    <select
                      value={substituteDoctorId}
                      onChange={(e) => setSubstituteDoctorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                    >
                      {MOCK_DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty || 'Bác sĩ'}) - Tiếp nhận 3 ca khám của bạn
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conflict Notice Warning */}
                  <div className="mt-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed font-medium">
                      <strong className="font-bold">Lưu ý:</strong> Có 2 ca hẹn bọc răng sứ Cercon trong thời gian này sẽ được chuyển giao sang {selectedSubstituteDoctor.name} phụ trách.
                    </div>
                  </div>
                </div>

                {/* Người phê duyệt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    NGƯỜI PHÊ DUYỆT
                  </label>
                  <select
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option>Nguyễn Văn A (Giám Đốc Điều Hành / Trưởng khoa)</option>
                    <option>Trần Thị B (Trưởng Phòng Nhân Sự)</option>
                    <option>Ban Giám Đốc Chuyên Môn</option>
                  </select>
                </div>

                {/* Lý do chi tiết * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    LÝ DO CHI TIẾT <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do chi tiết để ban giám đốc và phòng nhân sự xem xét phê duyệt..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* File upload box */}
                <div>
                  <label className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-sky-50/30 transition-all cursor-pointer block text-center">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                      {fileName ? `Đã chọn: ${fileName}` : 'Tải lên giấy tờ y tế hoặc tài liệu liên quan'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (PDF, JPG, PNG - Tối đa 5MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* Zalo alert toggle */}
                <div className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Gửi thông báo duyệt khẩn qua Zalo Ban Giám Đốc
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotifyZalo((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      notifyZalo ? 'bg-sky-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        notifyZalo ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer text-center"
            >
              HỦY BỎ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSubmitForm(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center"
              >
                LƯU BẢN NHÁP
              </button>

              <button
                type="button"
                onClick={() => handleSubmitForm(false)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>GỬI ĐƠN PHÊ DUYỆT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
