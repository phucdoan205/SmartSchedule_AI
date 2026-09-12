import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  Check,
  ShieldCheck,
  Sun,
  Moon,
  Briefcase,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { MOCK_DOCTORS, MOCK_BRANCHES } from '../../services/mockData';

export interface ShiftData {
  id?: string;
  staffId: string;
  staffName?: string;
  staffAvatar?: string;
  staffSpecialty?: string;
  branch?: string;
  room?: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'fullday' | 'overtime' | 'leave';
  startTime?: string;
  endTime?: string;
  maxPatients?: number;
  notes?: string;
  repeatWeekly?: boolean;
  repeatDays?: string[];
  status?: string;
}

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (shiftData: ShiftData) => void;
  initialStaffId?: string;
  initialDate?: string;
  initialShiftType?: 'morning' | 'afternoon' | 'fullday' | 'overtime';
}

const SHIFT_OPTIONS = [
  {
    type: 'morning' as const,
    label: 'Ca Sáng',
    time: '08:00 - 12:00',
    icon: Sun,
  },
  {
    type: 'afternoon' as const,
    label: 'Ca Chiều',
    time: '13:30 - 18:00',
    icon: Moon,
  },
  {
    type: 'fullday' as const,
    label: 'Cả ngày',
    time: '08:00 - 18:00',
    icon: Briefcase,
  },
  {
    type: 'overtime' as const,
    label: 'Tăng ca tối',
    time: '18:00 - 20:30',
    icon: Moon,
  },
];

const ROOM_OPTIONS = [
  'Ghế 01 (Phòng mổ vô trùng Implant)',
  'Ghế 02 (Khoa Phục hình Răng sứ)',
  'Ghế 03 (Khoa Chỉnh Nha & Niềng)',
  'Ghế 04 (Nha khoa Tổng quát & Nhổ răng)',
  'Phòng 201 - Khám Tư Vấn & X-Quang',
];

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStaffId,
  initialDate,
  initialShiftType = 'morning',
}) => {
  const [staffId, setStaffId] = useState(initialStaffId || MOCK_DOCTORS[0].id);
  const [branch, setBranch] = useState('Chi nhánh Biên Hòa (Trụ sở chính)');
  const [room, setRoom] = useState(ROOM_OPTIONS[0]);
  const [date, setDate] = useState(initialDate || '2026-08-21');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'fullday' | 'overtime'>(
    initialShiftType
  );

  // Repeat settings
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [repeatDays, setRepeatDays] = useState<string[]>(['T6']);
  const [repeatEndDate, setRepeatEndDate] = useState('2026-12-31');

  // Max patients
  const [maxPatients, setMaxPatients] = useState(6);

  // Notes & Notification
  const [notes, setNotes] = useState('');
  const [notifyStaff, setNotifyStaff] = useState(true);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialStaffId) setStaffId(initialStaffId);
      if (initialDate) setDate(initialDate);
      if (initialShiftType) setShiftType(initialShiftType);
    }
  }, [isOpen, initialStaffId, initialDate, initialShiftType]);

  if (!isOpen) return null;

  const selectedDoctor = MOCK_DOCTORS.find((d) => d.id === staffId) || MOCK_DOCTORS[0];

  const toggleRepeatDay = (day: string) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveShift = (andAddAnother = false) => {
    const selectedOption = SHIFT_OPTIONS.find((s) => s.type === shiftType);
    const [startTime, endTime] = selectedOption?.time.split(' - ') || ['08:00', '12:00'];

    const newShift: ShiftData = {
      id: `shift-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      staffId,
      staffName: selectedDoctor.name,
      staffAvatar: selectedDoctor.avatar,
      staffSpecialty: selectedDoctor.specialty,
      branch,
      room,
      date,
      shiftType,
      startTime,
      endTime,
      maxPatients,
      notes,
      repeatWeekly,
      repeatDays,
      status: 'Scheduled',
    };

    if (onSave) {
      onSave(newShift);
    }

    toast(`Đã lưu thành công ca trực ${selectedOption?.label || 'mới'} cho ${selectedDoctor.name}!`);

    if (!andAddAnother) {
      onClose();
    } else {
      // Reset some fields for next entry
      setNotes('');
    }
  };

  const ALL_WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Phân Ca Làm Việc &amp; Lịch Trực Mới
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Thiết lập ca làm việc, gán ghế khám phụ trách và tự động đồng bộ lên lịch hẹn trực tuyến.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: 2 Columns */}
          <div className="overflow-y-auto no-scrollbar flex-1 px-4 sm:px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-4">
                {/* Chọn Bác sĩ / Nhân sự */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chọn Bác sĩ / Nhân sự
                  </label>
                  <div className="relative">
                    <select
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                    >
                      {MOCK_DOCTORS.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chi nhánh */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chi nhánh
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                  >
                    <option>Chi nhánh Biên Hòa (Trụ sở chính)</option>
                    <option>Cơ sở Quận 1 (Trung tâm)</option>
                    <option>Cơ sở Bình Dương</option>
                    <option>Cơ sở Quận 7</option>
                  </select>
                </div>

                {/* Phòng khám / Ghế phụ trách */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phòng khám / Ghế phụ trách
                  </label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                  >
                    {ROOM_OPTIONS.map((rm) => (
                      <option key={rm} value={rm}>
                        {rm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày phân ca */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày phân ca
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Lựa chọn Ca trực (Grid 2x2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Lựa chọn Ca trực
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SHIFT_OPTIONS.map((opt) => {
                      const isSelected = shiftType === opt.type;
                      return (
                        <div
                          key={opt.type}
                          onClick={() => setShiftType(opt.type)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <opt.icon
                                className={`w-3.5 h-3.5 ${
                                  isSelected ? 'text-sky-600' : 'text-slate-500'
                                }`}
                              />
                              <span>{opt.label}</span>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 font-medium">
                            {opt.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-4">
                {/* Lặp lại ca trực hàng tuần */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={repeatWeekly}
                      onChange={(e) => setRepeatWeekly(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>Lặp lại ca trực này hàng tuần</span>
                  </label>

                  {repeatWeekly && (
                    <>
                      <div className="flex items-center gap-1 pt-1">
                        {ALL_WEEKDAYS.map((day) => {
                          const active = repeatDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleRepeatDay(day)}
                              className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                active
                                  ? 'bg-sky-600 text-white shadow-2xs'
                                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Ngày kết thúc lặp
                        </label>
                        <input
                          type="date"
                          value={repeatEndDate}
                          onChange={(e) => setRepeatEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Số lượng ca tối đa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số lượng ca tối đa
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setMaxPatients((p) => Math.max(1, p - 1))}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={maxPatients}
                        onChange={(e) => setMaxPatients(Number(e.target.value) || 1)}
                        className="w-14 text-center font-bold text-xs text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMaxPatients((p) => p + 1)}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">ca khám / ca trực</span>
                  </div>
                </div>

                {/* AI Validation Banner */}
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">
                    <span className="font-bold">✓ Hợp lệ:</span> Không trùng lịch trực và đảm bảo quy định thời gian nghỉ ngơi tối thiểu giữa 2 ca của {selectedDoctor.name.split(' ').slice(-2).join(' ')}.
                  </div>
                </div>

                {/* Ghi chú ca trực */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ghi chú ca trực
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ví dụ: Trực ca mổ đặc biệt, ưu tiên ca Implant..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Gửi thông báo Switch */}
                <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Gửi thông báo</div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      Tự động gửi thông báo lịch trực mới đến tài khoản cá nhân &amp; ứng dụng của bác sĩ
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyStaff((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      notifyStaff ? 'bg-sky-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        notifyStaff ? 'left-6' : 'left-1'
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
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveShift(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-sky-300 text-sky-700 bg-white hover:bg-sky-50 text-xs font-bold transition-all cursor-pointer text-center"
              >
                Lưu &amp; Thêm ca khác
              </button>
              <button
                type="button"
                onClick={() => handleSaveShift(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>LƯU CA TRỰC NÀY</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
