import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { MOCK_DOCTORS } from '../../services/mockData';
import { Calendar, Clock, MapPin, User, Save } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (shiftData: any) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave }) => {
  const [staffId, setStaffId] = useState(MOCK_DOCTORS[0].id);
  const [date, setDate] = useState('2026-09-04');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [room, setRoom] = useState('Phòng 201 - Khám Nội');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaff = MOCK_DOCTORS.find((d) => d.id === staffId);
    if (onSave) {
      onSave({
        staffId,
        staffName: selectedStaff?.name,
        role: selectedStaff?.specialty,
        date,
        startTime,
        endTime,
        room,
        status: 'Scheduled',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Ca Trực Bác Sĩ / Nhân Sự"
      subtitle="Thiết lập ca trực làm việc cho nhân viên y tế theo phòng khám"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu Ca Trực
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Doctor Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-sky-600" />
            Chọn Bác sĩ / Nhân sự:
          </label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
          >
            {MOCK_DOCTORS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty}) - {doc.code}
              </option>
            ))}
          </select>
        </div>

        {/* Date selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            Ngày trực:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
          />
        </div>

        {/* Time start - end */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Giờ bắt đầu:
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Giờ kết thúc:
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>
        </div>

        {/* Room selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Phòng khám phân công:
          </label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Ví dụ: Phòng 201 - Tim mạch"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
          />
        </div>
      </form>
    </Modal>
  );
};
