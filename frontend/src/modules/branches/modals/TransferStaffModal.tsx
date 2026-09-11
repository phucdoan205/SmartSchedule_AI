import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  ArrowRight,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_BRANCHES } from '../../../services/mockData';

interface TransferStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromBranchName?: string;
  onTransferSuccess?: () => void;
}

export const TransferStaffModal: React.FC<TransferStaffModalProps> = ({
  isOpen,
  onClose,
  fromBranchName = 'Chi nhánh Biên Hòa (Trụ sở chính)',
  onTransferSuccess,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState(MOCK_DOCTORS[0]?.id || 'nv-001');
  const [destinationBranchId, setDestinationBranchId] = useState(MOCK_BRANCHES[0]?.id || 'b-1');
  const [transferType, setTransferType] = useState<'temporary' | 'permanent'>('temporary');
  const [reason, setReason] = useState('Hỗ trợ ca phẫu thuật đông bệnh nhân');
  const [fromDate, setFromDate] = useState('2026-08-28');
  const [toDate, setToDate] = useState('2026-08-29');
  const [shiftTime, setShiftTime] = useState('Cả ngày (08:00 - 17:30)');
  const [notifyZalo, setNotifyZalo] = useState(true);

  if (!isOpen) return null;

  const currentDoctor = MOCK_DOCTORS.find((d) => d.id === selectedStaffId) || MOCK_DOCTORS[0];
  const targetBranch = MOCK_BRANCHES.find((b) => b.id === destinationBranchId) || MOCK_BRANCHES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTransferSuccess) {
      onTransferSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Điều Chuyển Bác Sĩ &amp; Nhân Sự Giữa Các Chi Nhánh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập điều động nhân sự hỗ trợ ca phẫu thuật đặc biệt hoặc cân bằng công suất khám giữa các cơ sở
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Transfer Visual Card */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Từ cơ sở */}
            <div className="md:col-span-2 space-y-2">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  TỪ CƠ SỞ
                </span>
                <span className="font-extrabold text-slate-900 text-xs block">{fromBranchName}</span>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                {currentDoctor.avatar ? (
                  <img
                    src={currentDoctor.avatar}
                    alt={currentDoctor.name}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {currentDoctor.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                  >
                    {MOCK_DOCTORS.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">{currentDoctor.specialty.split('-')[1] || currentDoctor.specialty}</p>
                </div>
              </div>
            </div>

            {/* Mũi tên chuyển */}
            <div className="flex flex-col items-center justify-center text-center py-2 md:py-0">
              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-extrabold rounded-full mb-1">
                Hỗ trợ ngắn hạn
              </span>
              <ArrowRight className="w-5 h-5 text-sky-600 hidden md:block" />
            </div>

            {/* Đến cơ sở */}
            <div className="md:col-span-2 space-y-2">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  ĐẾN CƠ SỞ
                </span>
                <select
                  value={destinationBranchId}
                  onChange={(e) => setDestinationBranchId(e.target.value)}
                  className="font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                >
                  {MOCK_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                  <option value="b-quan1">Chi nhánh Quận 1 - TP. HCM</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 font-bold text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Đang thiếu 2 bác sĩ ca sáng tại {targetBranch.name}</span>
              </div>
            </div>
          </div>

          {/* Loại hình & Lý do điều chuyển */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Loại hình điều chuyển</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransferType('temporary')}
                  className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                    transferType === 'temporary'
                      ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tạm thời ngày/tuần
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('permanent')}
                  className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                    transferType === 'permanent'
                      ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cố định lâu dài
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Lý do điều chuyển</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="Hỗ trợ ca phẫu thuật đông bệnh nhân">Hỗ trợ ca phẫu thuật đông bệnh nhân</option>
                <option value="Thay thế bác sĩ nghỉ phép">Thay thế bác sĩ nghỉ phép</option>
                <option value="Cân bằng công suất khám">Cân bằng công suất khám</option>
                <option value="Tăng cường năng lực chuyên môn">Tăng cường năng lực chuyên môn</option>
              </select>
            </div>
          </div>

          {/* Khoảng thời gian & Ca làm việc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Khoảng thời gian áp dụng</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none"
                />
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Ca làm việc áp dụng</label>
              <select
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="Cả ngày (08:00 - 17:30)">Cả ngày (08:00 - 17:30)</option>
                <option value="Ca Sáng (08:00 - 12:00)">Ca Sáng (08:00 - 12:00)</option>
                <option value="Ca Chiều (13:30 - 17:30)">Ca Chiều (13:30 - 17:30)</option>
              </select>
            </div>
          </div>

          {/* Warning Box: Bàn giao lịch khám */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-amber-900 text-xs">Bàn giao lịch khám tại {fromBranchName.split('(')[0]}</h5>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5 leading-relaxed">
                Có 2 lịch hẹn tái khám tại cơ sở trong thời gian này. Hệ thống đề xuất chuyển sang{' '}
                <strong>BS. Nguyễn Thị An</strong> phụ trách thay.
              </p>
            </div>
          </div>

          {/* Checkbox Zalo & App */}
          <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyZalo}
              onChange={(e) => setNotifyZalo(e.target.checked)}
              className="rounded text-sky-600 focus:ring-0 w-4 h-4"
            />
            <span className="font-bold text-slate-800 text-[11px]">
              Gửi thông báo xác nhận lịch điều chuyển qua ứng dụng &amp; Zalo cho {currentDoctor.name} và Quản lý cơ sở {targetBranch.name}
            </span>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Lưu nháp kế hoạch
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>XÁC NHẬN ĐIỀU CHUYỂN</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
