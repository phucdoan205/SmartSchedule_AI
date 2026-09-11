import React, { useState } from 'react';
import {
  X,
  Calendar,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../../services/mockData';

interface ChangeDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  branchName?: string;
  onConfirmChange?: (newDoctorName: string) => void;
}

export const ChangeDoctorModal: React.FC<ChangeDoctorModalProps> = ({
  isOpen,
  onClose,
  room,
  branchName = 'Chi nhánh Biên Hòa',
  onConfirmChange,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(MOCK_DOCTORS[0]?.id || 'nv-001');
  const [scope, setScope] = useState<'temporary' | 'permanent'>('temporary');
  const [autoTransferAppointments, setAutoTransferAppointments] = useState(true);
  const [sendZaloNotice, setSendZaloNotice] = useState(true);
  const [handoverNote, setHandoverNote] = useState('');

  if (!isOpen || !room) return null;

  const currentDoctorName = room.doctorName || 'BS. Trần Đức Cường';
  const newDoctor = MOCK_DOCTORS.find((d) => d.id === selectedDoctorId) || MOCK_DOCTORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onConfirmChange) {
      onConfirmChange(newDoctor.name);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Thay Đổi Bác Sĩ Phụ Trách Phòng Khám</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật phân công bác sĩ điều trị chính và tự động xử lý điều chuyển lịch hẹn đang có trên {room.name} - {room.floor} ({branchName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Bác sĩ hiện tại Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                👨‍⚕️
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  BÁC SĨ HIỆN TẠI
                </span>
                <h4 className="font-extrabold text-slate-900 text-xs mt-0.5">{currentDoctorName}</h4>
                <p className="text-[11px] text-slate-500">Chuyên khoa Chỉnh nha &amp; Phục hình</p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-full border border-sky-200 text-[10px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-600" /> Đang có 3 lịch hẹn hôm nay
            </span>
          </div>

          {/* Chọn Bác sĩ phụ trách mới */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn Bác sĩ phụ trách mới</label>
            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
              {newDoctor.avatar ? (
                <img src={newDoctor.avatar} alt={newDoctor.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  {newDoctor.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                >
                  {MOCK_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trống lịch ca chiều
                </p>
              </div>
            </div>
          </div>

          {/* Check Hợp Lệ */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
              ✓ <strong>Hợp lệ:</strong> {newDoctor.name} không trùng lịch mổ tại phòng khác trong khung giờ này và đủ điều kiện tiếp nhận ghế.
            </p>
          </div>

          {/* Phạm vi áp dụng */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Phạm vi áp dụng</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('temporary')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                  scope === 'temporary'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tạm thời (Chỉ hôm nay - 22/08/2026)
              </button>
              <button
                type="button"
                onClick={() => setScope('permanent')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                  scope === 'permanent'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cố định lâu dài
              </button>
            </div>
          </div>

          {/* Xử lý ca hẹn */}
          <div className="space-y-2 pt-1">
            <label className="block font-bold text-slate-700">Xử lý ca hẹn</label>

            <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTransferAppointments}
                onChange={(e) => setAutoTransferAppointments(e.target.checked)}
                className="rounded text-sky-600 focus:ring-0 w-4 h-4"
              />
              <span className="font-bold text-slate-800">
                Tự động chuyển 3 ca hẹn của bệnh nhân hôm nay sang cho {newDoctor.name} tiếp nhận
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={sendZaloNotice}
                onChange={(e) => setSendZaloNotice(e.target.checked)}
                className="rounded text-sky-600 focus:ring-0 w-4 h-4"
              />
              <span className="font-bold text-slate-800">
                Gửi tin nhắn Zalo thông báo thay đổi bác sĩ cho bệnh nhân
              </span>
            </label>
          </div>

          {/* Ghi chú bàn giao */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú bàn giao</label>
            <textarea
              rows={2}
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="Nhập lý do đổi bác sĩ (ví dụ: BS. Cường công tác đột xuất, đổi ca tăng cường...)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500 text-xs"
            />
          </div>

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
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xem lại lịch trực
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors"
              >
                XÁC NHẬN ĐỔI BÁC SĨ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
