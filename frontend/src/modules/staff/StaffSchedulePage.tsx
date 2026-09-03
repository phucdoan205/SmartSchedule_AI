import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Plus, Clock, Users, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SHIFTS } from '../../services/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ShiftModal } from './ShiftModal';

export const StaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('All');

  const daysOfWeek = [
    { label: 'Thứ 2 (01/09)', date: '2026-09-01' },
    { label: 'Thứ 3 (02/09)', date: '2026-09-02' },
    { label: 'Thứ 4 (03/09)', date: '2026-09-03' },
    { label: 'Thứ 5 (04/09)', date: '2026-09-04' },
    { label: 'Thứ 6 (05/09)', date: '2026-09-05' },
    { label: 'Thứ 7 (06/09)', date: '2026-09-06' },
    { label: 'Chủ Nhật (07/09)', date: '2026-09-07' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Danh sách Bác sĩ & Nhân sự
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lịch Làm Việc & Phân Công Ca Trực</h2>
          <p className="text-xs text-slate-500 mt-1">Xếp lịch khám, ca trực phòng khống chế trùng lặp theo thuật toán AI</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building className="w-4 h-4 text-sky-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
            >
              <option value="All">Tất cả chi nhánh</option>
              <option value="CN1">Chi nhánh Quận 1</option>
              <option value="CN2">Chi nhánh Quận 7</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tạo ca trực mới
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <button type="button" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-600" /> Tuần: 01/09/2026 - 07/09/2026
        </span>
        <button type="button" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
            <div className="text-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800">{day.label}</h4>
            </div>

            <div className="space-y-2">
              {MOCK_SHIFTS.map((shift) => (
                <div
                  key={shift.id}
                  className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-100/60 transition-colors text-xs space-y-1 cursor-pointer"
                >
                  <p className="font-bold text-slate-800 text-[11px] truncate">
                    {shift.doctorName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" />
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-sky-100">
                    <span className="font-semibold text-teal-700">{shift.room}</span>
                    <StatusBadge status={shift.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
    </div>
  );
};
