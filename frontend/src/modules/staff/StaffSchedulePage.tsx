import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Sun,
  Moon,
  Plane,
  AlertCircle,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  GripVertical,
  X,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';
import { ShiftModal, type ShiftData } from './ShiftModal';

interface ScheduleItem {
  id: string;
  staffId: string;
  date: string; // '2026-08-17' (YYYY-MM-DD)
  shiftType: 'morning' | 'afternoon' | 'leave' | 'overtime';
  startTime: string;
  endTime: string;
  room?: string;
  statusLabel?: string;
}

// Initial mock shifts matching "giao diện lịch làm việc.png"
const INITIAL_SHIFTS: ScheduleItem[] = [
  // BS.CKI Nguyễn Văn Tuấn (nv-001 or doc-1)
  {
    id: 's-1',
    staffId: 'nv-001',
    date: '2026-08-17',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Ghế 01 - Implant',
  },
  {
    id: 's-2',
    staffId: 'nv-001',
    date: '2026-08-18',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 01 - Implant',
  },
  {
    id: 's-3',
    staffId: 'nv-001',
    date: '2026-08-19',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Ghế 01 - Implant',
  },
  {
    id: 's-4',
    staffId: 'nv-001',
    date: '2026-08-19',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 01 - Implant',
  },
  {
    id: 's-5',
    staffId: 'nv-001',
    date: '2026-08-21',
    shiftType: 'leave',
    startTime: '',
    endTime: '',
    statusLabel: '(Đã duyệt)',
  },
  {
    id: 's-6',
    staffId: 'nv-001',
    date: '2026-08-22',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 01 - Implant',
  },

  // BS. Lê Thị Lan (nv-002)
  {
    id: 's-7',
    staffId: 'nv-002',
    date: '2026-08-17',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 02 - Phục hình sứ',
  },
  {
    id: 's-8',
    staffId: 'nv-002',
    date: '2026-08-18',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Ghế 02 - Phục hình sứ',
  },
  {
    id: 's-9',
    staffId: 'nv-002',
    date: '2026-08-20',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 02 - Phục hình sứ',
  },
  {
    id: 's-10',
    staffId: 'nv-002',
    date: '2026-08-21',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Ghế 02 - Phục hình sứ',
  },
  {
    id: 's-11',
    staffId: 'nv-002',
    date: '2026-08-21',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Ghế 02 - Phục hình sứ',
  },
  {
    id: 's-12',
    staffId: 'nv-002',
    date: '2026-08-22',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Ghế 02 - Phục hình sứ',
  },

  // KTV. Hoàng Minh (nv-003)
  {
    id: 's-13',
    staffId: 'nv-003',
    date: '2026-08-17',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Phòng Vô trùng',
  },
  {
    id: 's-14',
    staffId: 'nv-003',
    date: '2026-08-17',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Phòng Vô trùng',
  },
  {
    id: 's-15',
    staffId: 'nv-003',
    date: '2026-08-19',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Phòng Vô trùng',
  },
  {
    id: 's-16',
    staffId: 'nv-003',
    date: '2026-08-20',
    shiftType: 'morning',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Phòng Vô trùng',
  },
  {
    id: 's-17',
    staffId: 'nv-003',
    date: '2026-08-22',
    shiftType: 'afternoon',
    startTime: '13:30',
    endTime: '18:00',
    room: 'Phòng Vô trùng',
  },
  {
    id: 's-18',
    staffId: 'nv-003',
    date: '2026-08-23',
    shiftType: 'overtime',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Phòng Mổ cấp cứu',
  },
];

// Week days definition
const WEEK_COLUMNS = [
  { dayKey: 'T2', label: 'THỨ 2', dateStr: '17/08', dateFull: '2026-08-17' },
  { dayKey: 'T3', label: 'THỨ 3', dateStr: '18/08', dateFull: '2026-08-18' },
  { dayKey: 'T4', label: 'THỨ 4', dateStr: '19/08', dateFull: '2026-08-19' },
  { dayKey: 'T5', label: 'THỨ 5', dateStr: '20/08', dateFull: '2026-08-20', isToday: true },
  { dayKey: 'T6', label: 'THỨ 6', dateStr: '21/08', dateFull: '2026-08-21' },
  { dayKey: 'T7', label: 'THỨ 7', dateStr: '22/08', dateFull: '2026-08-22' },
  { dayKey: 'CN', label: 'CHỦ NHẬT', dateStr: '23/08', dateFull: '2026-08-23', isSunday: true },
];

export const StaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [shifts, setShifts] = useState<ScheduleItem[]>(INITIAL_SHIFTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Drag and drop state
  const [draggedShift, setDraggedShift] = useState<ScheduleItem | null>(null);
  const [dropTarget, setDropTarget] = useState<{ staffId: string; date: string } | null>(null);

  // Modal state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [modalInitialStaffId, setModalInitialStaffId] = useState<string | undefined>();
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Doctors list enhanced with proper naming matching mock
  const scheduleDoctors = useMemo(() => {
    const list = [
      {
        id: 'nv-001',
        name: 'BS.CKI Nguyễn Văn Tuấn',
        specialty: 'Implant',
        department: 'Khoa Implant',
        avatar: MOCK_DOCTORS[0]?.avatar,
      },
      {
        id: 'nv-002',
        name: 'BS. Lê Thị Lan',
        specialty: 'Phục hình sứ',
        department: 'Khoa Phục Hình',
        avatar: MOCK_DOCTORS[1]?.avatar,
      },
      {
        id: 'nv-003',
        name: 'KTV. Hoàng Minh',
        specialty: 'Vô trùng & Phụ mổ',
        department: 'Phụ tá & Khử trùng',
        avatar: MOCK_DOCTORS[2]?.avatar || MOCK_DOCTORS[0]?.avatar,
      },
      ...MOCK_DOCTORS.slice(3).map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty || 'Nha khoa',
        department: d.department || 'Khoa Tổng Quát',
        avatar: d.avatar,
      })),
    ];

    return list.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept =
        selectedDept === 'all' || doc.department.toLowerCase().includes(selectedDept.toLowerCase());
      return matchSearch && matchDept;
    });
  }, [searchQuery, selectedDept]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, shift: ScheduleItem) => {
    setDraggedShift(shift);
    e.dataTransfer.setData('text/plain', shift.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, staffId: string, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dropTarget || dropTarget.staffId !== staffId || dropTarget.date !== date) {
      setDropTarget({ staffId, date });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Don't clear immediately to prevent flickering on child elements
  };

  const handleDrop = (e: React.DragEvent, targetStaffId: string, targetDate: string) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedShift) return;

    // If dropped in the same cell, do nothing
    if (draggedShift.staffId === targetStaffId && draggedShift.date === targetDate) {
      setDraggedShift(null);
      return;
    }

    // Move the shift to new doctor & date
    setShifts((prev) =>
      prev.map((item) =>
        item.id === draggedShift.id
          ? { ...item, staffId: targetStaffId, date: targetDate }
          : item
      )
    );

    const targetDoc = scheduleDoctors.find((d) => d.id === targetStaffId);
    const targetDay = WEEK_COLUMNS.find((w) => w.dateFull === targetDate);
    const shiftLabel =
      draggedShift.shiftType === 'morning'
        ? 'Ca Sáng'
        : draggedShift.shiftType === 'afternoon'
        ? 'Ca Chiều'
        : draggedShift.shiftType === 'overtime'
        ? 'Tăng Ca'
        : 'Nghỉ phép';

    showToast(
      `Đã chuyển ${shiftLabel} sang ${targetDay?.label || targetDate} cho ${
        targetDoc?.name || 'nhân sự'
      }!`
    );

    setDraggedShift(null);
  };

  // Open modal on empty cell click
  const handleCellClick = (staffId: string, date: string) => {
    setModalInitialStaffId(staffId);
    setModalInitialDate(date);
    setIsShiftModalOpen(true);
  };

  // Save from Modal
  const handleSaveShiftFromModal = (data: ShiftData) => {
    const newShiftItem: ScheduleItem = {
      id: data.id || `shift-${Date.now()}`,
      staffId: data.staffId,
      date: data.date,
      shiftType: data.shiftType === 'leave' ? 'leave' : data.shiftType === 'overtime' ? 'overtime' : data.shiftType === 'afternoon' ? 'afternoon' : 'morning',
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '12:00',
      room: data.room,
    };

    setShifts((prev) => [...prev, newShiftItem]);
    showToast(`Đã thêm ca trực mới cho ${data.staffName || 'nhân sự'} thành công!`);
  };

  // Delete a shift
  const handleDeleteShift = (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    showToast('Đã xóa ca trực khỏi lịch!');
  };

  // Calculate statistics
  const totalStaffCount = scheduleDoctors.length;
  const totalHours = useMemo(() => {
    return shifts.reduce((acc, s) => {
      if (s.shiftType === 'morning') return acc + 4;
      if (s.shiftType === 'afternoon') return acc + 4.5;
      if (s.shiftType === 'overtime') return acc + 4;
      return acc;
    }, 0);
  }, [shifts]);

  return (
    <div className="space-y-4 pb-8 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Title & Action Bar ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý phân ca làm việc &amp; Lịch trực bác sĩ
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
            <button
              type="button"
              onClick={() => navigate('/admin/staff')}
              className="hover:text-sky-600 transition-colors"
            >
              Bác sĩ &amp; Nhân sự
            </button>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Phân ca làm việc</span>
          </div>
        </div>

        {/* Actions on Right */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Date Navigator */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
            <button
              type="button"
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1.5 select-none font-extrabold">
              17/08/2026 - 23/08/2026
            </span>
            <button
              type="button"
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={() => showToast('Đang tạo và tải xuống bảng phân ca Excel/PDF...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất bảng phân ca</span>
          </button>

          {/* Add Shift Button */}
          <button
            type="button"
            onClick={() => {
              setModalInitialStaffId(undefined);
              setModalInitialDate(undefined);
              setIsShiftModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ca trực</span>
          </button>
        </div>
      </div>

      {/* ─── Filter & Legend Bar ─────────────────────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Dept Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bác sĩ, nhân sự..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="all">Tất cả khoa phòng</option>
            <option value="Implant">Khoa Implant</option>
            <option value="Phục Hình">Khoa Phục Hình</option>
            <option value="Chỉnh Nha">Khoa Chỉnh Nha</option>
            <option value="Phụ tá">Phụ tá &amp; Vô trùng</option>
          </select>

          <span className="hidden lg:inline text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
            💡 Kéo thả ca trực giữa các ô để đổi ca nhanh
          </span>
        </div>

        {/* Right: Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 px-1">
          {/* Ca Sáng */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-100 border border-sky-300 flex items-center justify-center">
              <Sun className="w-2.5 h-2.5 text-sky-600" />
            </span>
            <span>Ca Sáng</span>
          </div>

          {/* Ca Chiều */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-900 text-white flex items-center justify-center">
              <Moon className="w-2.5 h-2.5" />
            </span>
            <span>Ca Chiều</span>
          </div>

          {/* Nghỉ phép */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center">
              <Plane className="w-2.5 h-2.5" />
            </span>
            <span>Nghỉ phép</span>
          </div>

          {/* Tăng ca */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-2.5 h-2.5" />
            </span>
            <span>Tăng ca</span>
          </div>
        </div>
      </div>

      {/* ─── Schedule Matrix Table (With Drag & Drop) ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                {/* Staff Column Header */}
                <th className="py-3 px-4 text-xs font-extrabold text-slate-700 w-52 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200">
                  Nhân sự
                </th>

                {/* Weekday Column Headers */}
                {WEEK_COLUMNS.map((col) => {
                  const isCurrentDay = col.isToday;
                  const isSun = col.isSunday;

                  return (
                    <th
                      key={col.dayKey}
                      className={`py-3 px-3 text-center border-r border-slate-200 last:border-r-0 transition-colors ${
                        isCurrentDay ? 'bg-sky-50/70' : ''
                      }`}
                      style={{ width: '13.5%' }}
                    >
                      <div
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isCurrentDay
                            ? 'text-sky-600'
                            : isSun
                            ? 'text-rose-500'
                            : 'text-slate-700'
                        }`}
                      >
                        {col.label}
                      </div>
                      <div
                        className={`text-xs font-bold mt-0.5 ${
                          isCurrentDay
                            ? 'text-sky-700'
                            : isSun
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {col.dateStr}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body (Rows of Staff x Columns of Days) */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {scheduleDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Sticky Staff Info Cell */}
                  <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      {doc.avatar ? (
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                          {doc.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div
                          className="font-extrabold text-slate-800 text-xs truncate hover:text-sky-600 cursor-pointer"
                          title={doc.name}
                          onClick={() => navigate(`/admin/staff/${doc.id}`)}
                        >
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate">
                          {doc.specialty}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 7 Days Cells for this staff */}
                  {WEEK_COLUMNS.map((col) => {
                    const cellShifts = shifts.filter(
                      (s) => s.staffId === doc.id && s.date === col.dateFull
                    );

                    const isOver =
                      dropTarget?.staffId === doc.id && dropTarget?.date === col.dateFull;

                    return (
                      <td
                        key={col.dayKey}
                        onDragOver={(e) => handleDragOver(e, doc.id, col.dateFull)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, doc.id, col.dateFull)}
                        onClick={() => handleCellClick(doc.id, col.dateFull)}
                        className={`p-2 align-top border-r border-slate-100 last:border-r-0 min-h-[105px] transition-all relative group cursor-pointer ${
                          col.isToday ? 'bg-sky-50/20' : ''
                        } ${
                          isOver
                            ? 'bg-sky-100/60 ring-2 ring-sky-400 ring-inset rounded-lg'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Shifts list in this cell */}
                        <div className="space-y-1.5 min-h-[85px] flex flex-col justify-start">
                          {cellShifts.map((shift) => {
                            const isShiftDragging = draggedShift?.id === shift.id;

                            // ── Render based on shift type ──
                            if (shift.shiftType === 'morning') {
                              return (
                                <div
                                  key={shift.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, shift)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`p-2 rounded-xl border border-sky-200/90 bg-sky-50/90 text-sky-900 transition-all select-none cursor-grab active:cursor-grabbing hover:shadow-xs group/card relative ${
                                    isShiftDragging ? 'opacity-40 scale-95' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-[11px] text-sky-800 flex items-center gap-1">
                                      <Sun className="w-3 h-3 text-sky-600" />
                                      Ca Sáng
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteShift(e, shift.id)}
                                      className="opacity-0 group-hover/card:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5"
                                      title="Xóa ca trực"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                                    {shift.startTime || '08:00'} - {shift.endTime || '12:00'}
                                  </div>
                                </div>
                              );
                            }

                            if (shift.shiftType === 'afternoon') {
                              return (
                                <div
                                  key={shift.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, shift)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`p-2 rounded-xl bg-slate-900 text-white transition-all select-none cursor-grab active:cursor-grabbing hover:shadow-xs group/card relative ${
                                    isShiftDragging ? 'opacity-40 scale-95' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-[11px] text-slate-100 flex items-center gap-1">
                                      <Moon className="w-3 h-3 text-slate-300" />
                                      Ca Chiều
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteShift(e, shift.id)}
                                      className="opacity-0 group-hover/card:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity p-0.5"
                                      title="Xóa ca trực"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                                    {shift.startTime || '13:30'} - {shift.endTime || '18:00'}
                                  </div>
                                </div>
                              );
                            }

                            if (shift.shiftType === 'leave') {
                              return (
                                <div
                                  key={shift.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, shift)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`p-2 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-800 transition-all select-none cursor-grab active:cursor-grabbing hover:shadow-xs group/card relative text-center ${
                                    isShiftDragging ? 'opacity-40 scale-95' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1 font-extrabold text-[11px] text-rose-700">
                                    <Plane className="w-3 h-3 text-rose-500" />
                                    <span>Nghỉ phép</span>
                                  </div>
                                  <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                                    {shift.statusLabel || '(Đã duyệt)'}
                                  </div>
                                </div>
                              );
                            }

                            // Overtime
                            return (
                              <div
                                key={shift.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, shift)}
                                onClick={(e) => e.stopPropagation()}
                                className={`p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 transition-all select-none cursor-grab active:cursor-grabbing hover:shadow-xs group/card relative ${
                                  isShiftDragging ? 'opacity-40 scale-95' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[11px] text-amber-800 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                    Tăng ca
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteShift(e, shift.id)}
                                    className="opacity-0 group-hover/card:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                                  {shift.startTime || '08:00'} - {shift.endTime || '12:00'}
                                </div>
                              </div>
                            );
                          })}

                          {/* Empty Cell Quick Add hint */}
                          {cellShifts.length === 0 && (
                            <div className="h-full flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity py-4">
                              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-dashed border-slate-300">
                                <Plus className="w-3 h-3 text-sky-500" /> Thêm ca
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Footer Statistics Bar ──────────────────────────────────────── */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>
                Tổng nhân sự trực: <strong className="text-slate-900">{totalStaffCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Tổng giờ công dự kiến: <strong className="text-slate-900">{totalHours}h</strong>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Lịch trực đồng bộ tự động với ứng dụng đặt hẹn và cảnh báo thời gian thực AI SmartSchedule
          </div>
        </div>
      </div>

      {/* ShiftModal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShiftFromModal}
        initialStaffId={modalInitialStaffId}
        initialDate={modalInitialDate}
      />
    </div>
  );
};
