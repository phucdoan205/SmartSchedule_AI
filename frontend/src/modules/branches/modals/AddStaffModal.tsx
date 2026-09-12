import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Calendar,
  Check,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../../services/mockData';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
  onAddStaff?: (staff: any) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  branchName = 'Chi nhánh Biên Hòa',
  onAddStaff,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState(MOCK_DOCTORS[0]?.id || 'nv-001');
  const [allocationType, setAllocationType] = useState<'permanent' | 'shift'>('permanent');
  const [roleTitle, setRoleTitle] = useState('Bác sĩ điều trị chính');
  const [assignedRoom, setAssignedRoom] = useState('Ghế 02 (Phục hình Răng sứ & Nhi khoa)');
  const [shifts, setShifts] = useState({
    morning: true,
    afternoon: true,
    evening: false,
  });
  const [startDate, setStartDate] = useState('2026-08-24');
  const [syncWebSchedule, setSyncWebSchedule] = useState(true);

  if (!isOpen) return null;

  const currentDoctor = MOCK_DOCTORS.find((d) => d.id === selectedStaffId) || MOCK_DOCTORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddStaff) {
      onAddStaff({
        id: currentDoctor.id,
        name: currentDoctor.name,
        role: roleTitle,
        room: assignedRoom,
        type: allocationType,
        shifts,
        startDate,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Thêm &amp; Phân Bổ Nhân Sự Vào Chi Nhánh</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn nhân sự từ hệ thống để gán vào làm việc thường trực hoặc luân chuyển tại {branchName}
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

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-4">
              {/* Chọn nhân sự */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn nhân sự từ hệ thống</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    {currentDoctor.avatar ? (
                      <img
                        src={currentDoctor.avatar}
                        alt={currentDoctor.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
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
                            {doc.name} (#{doc.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500">{currentDoctor.specialty}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hình thức phân công */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Hình thức phân công</label>

                <div
                  onClick={() => setAllocationType('permanent')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    allocationType === 'permanent'
                      ? 'bg-sky-50/40 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        allocationType === 'permanent'
                          ? 'border-sky-600 bg-sky-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {allocationType === 'permanent' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Thường trực tại cơ sở</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Làm việc cố định toàn thời gian</p>
                  </div>
                </div>

                <div
                  onClick={() => setAllocationType('shift')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    allocationType === 'shift'
                      ? 'bg-sky-50/40 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        allocationType === 'shift'
                          ? 'border-sky-600 bg-sky-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {allocationType === 'shift' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Luân chuyển theo ca</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ linh hoạt theo ngày/tuần</p>
                  </div>
                </div>
              </div>

              {/* Chức danh đảm nhiệm */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức danh đảm nhiệm tại cơ sở</label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="Bác sĩ điều trị chính">Bác sĩ điều trị chính</option>
                  <option value="Bác sĩ phẫu thuật Implant">Bác sĩ phẫu thuật Implant</option>
                  <option value="Bác sĩ phục hình răng sứ">Bác sĩ phục hình răng sứ</option>
                  <option value="Điều dưỡng trưởng">Điều dưỡng trưởng</option>
                  <option value="Kỹ thuật viên phòng chụp X-quang">Kỹ thuật viên phòng chụp X-quang</option>
                  <option value="Lễ tân chi nhánh">Lễ tân chi nhánh</option>
                </select>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-4">
              {/* Phòng khám / Ghế phụ trách chính */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng khám / Ghế phụ trách chính</label>
                <select
                  value={assignedRoom}
                  onChange={(e) => setAssignedRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="Ghế 02 (Phục hình Răng sứ & Nhi khoa)">Ghế 02 (Phục hình Răng sứ &amp; Nhi khoa)</option>
                  <option value="Phòng 01 - Ghế 01 (Khám & Cạo vôi)">Phòng 01 - Ghế 01 (Khám &amp; Cạo vôi)</option>
                  <option value="Phòng mổ 01 (Phẫu thuật Implant)">Phòng mổ 01 (Phẫu thuật Implant)</option>
                  <option value="Phòng 03 (Nắn chỉnh răng)">Phòng 03 (Nắn chỉnh răng)</option>
                </select>
              </div>

              {/* Ca làm việc cố định */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Ca làm việc cố định</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shifts.morning}
                      onChange={(e) => setShifts({ ...shifts, morning: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Ca Sáng (08:00 - 12:00)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shifts.afternoon}
                      onChange={(e) => setShifts({ ...shifts, afternoon: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Ca Chiều (13:30 - 17:30)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shifts.evening}
                      onChange={(e) => setShifts({ ...shifts, evening: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Ca Tối tăng cường</span>
                  </label>
                </div>
              </div>

              {/* Ngày bắt đầu tiếp nhận */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu tiếp nhận</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Check hợp lệ AI/Lịch trực */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                  ✓ <strong>Hợp lệ:</strong> {assignedRoom.split('(')[0]} đang trống khung giờ sáng T2-T6, không xung đột với lịch trực của bác sĩ khác.
                </p>
              </div>

              {/* Toggle đồng bộ */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-700 font-bold max-w-[240px]">
                  Đồng bộ lịch trực của bác sĩ lên cổng đặt lịch trực tuyến của {branchName}
                </span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={syncWebSchedule}
                    onChange={(e) => setSyncWebSchedule(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors text-center"
              >
                Lưu &amp; Thêm người khác
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> XÁC NHẬN TIẾP NHẬN NHÂN SỰ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
