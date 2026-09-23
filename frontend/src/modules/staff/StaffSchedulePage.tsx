import React, { useState, useMemo, useEffect } from 'react';
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
  Loader2,
  Wand2,
} from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { staffApi, staffSchedulesApi } from '../../services/api';
import { exportToExcel } from '../../utils/excelExport';
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

export const StaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranchId, branches } = useBranch();

  // Pagination state (Exactly 5 items per page)
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Week offset state (0 = current week starting 17/08/2026)
  const [weekOffset, setWeekOffset] = useState(0);

  // Database staff and shifts state
  const [dbStaff, setDbStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Drag and drop state
  const [draggedShift, setDraggedShift] = useState<ScheduleItem | null>(null);
  const [dropTarget, setDropTarget] = useState<{ staffId: string; date: string } | null>(null);

  // Quick standard shift picker state
  const [quickPicker, setQuickPicker] = useState<{
    staffId: string;
    staffName: string;
    date: string;
    dateFormatted: string;
  } | null>(null);

  // Shift Modal state
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

  // Calculate dynamic week columns based on weekOffset
  const weekColumns = useMemo(() => {
    const base = new Date(2026, 7, 17); // Aug 17, 2026 (Monday)
    base.setDate(base.getDate() + weekOffset * 7);
    const labels = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];
    const dayKeys = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateFull = d.toISOString().split('T')[0];
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        dayKey: dayKeys[i],
        label: labels[i],
        dateStr,
        dateFull,
        isToday: weekOffset === 0 && i === 3, // T5 is today in mock
        isSunday: i === 6,
      };
    });
  }, [weekOffset]);

  const currentWeekDateRangeStr = `${weekColumns[0].dateStr}/${weekColumns[0].dateFull.slice(0, 4)} - ${weekColumns[6].dateStr}/${weekColumns[6].dateFull.slice(0, 4)}`;

  // Fetch real staff and shifts from DB
  const loadData = async () => {
    try {
      setLoading(true);
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? selectedBranchId : undefined;
      const [staffList, scheduleList] = await Promise.all([
        staffApi.getAllStaff({ branchId: branchParam }).catch(() => []),
        staffSchedulesApi.getAll({ branchId: branchParam }).catch(() => []),
      ]);

      if (Array.isArray(staffList) && staffList.length > 0) {
        setDbStaff(
          staffList.map((s: any) => ({
            id: s.id,
            code: s.code || s.employeeCode || `NV${s.id.slice(0, 4)}`,
            name: s.name || s.fullName,
            specialty: s.specialty || s.doctorProfile?.specialty || s.department || 'Bác sĩ điều trị',
            department: s.department || 'Khoa Tổng Quát',
            avatar: s.avatar || s.avatarUrl,
            branchId: s.branchId,
          }))
        );
      }

      if (Array.isArray(scheduleList) && scheduleList.length > 0) {
        setShifts(
          scheduleList.map((sc: any) => ({
            id: sc.id,
            staffId: sc.staffId,
            date: sc.date.split('T')[0],
            shiftType:
              sc.shiftType === 'afternoon'
                ? 'afternoon'
                : sc.shiftType === 'full_day' || sc.shiftType === 'fullday'
                ? 'morning'
                : sc.shiftType === 'evening'
                ? 'overtime'
                : 'morning',
            startTime: sc.startTime || '08:00',
            endTime: sc.endTime || (sc.shiftType === 'afternoon' ? '17:30' : '12:00'),
            room: sc.room || 'Phòng khám tiêu chuẩn',
            statusLabel: sc.isAvailable ? undefined : '(Tạm ngưng)',
          }))
        );
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch làm việc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [selectedBranchId]);

  // Filter staff by search, department, and branch
  const filteredStaff = useMemo(() => {
    return dbStaff.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept =
        selectedDept === 'all' || doc.department.toLowerCase().includes(selectedDept.toLowerCase());
      return matchSearch && matchDept;
    });
  }, [dbStaff, searchQuery, selectedDept]);

  // Paginated staff (Exactly 5 per page)
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage]);

  // Drag and drop handlers
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
  };

  const handleDrop = async (e: React.DragEvent, targetStaffId: string, targetDate: string) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedShift) return;

    if (draggedShift.staffId === targetStaffId && draggedShift.date === targetDate) {
      setDraggedShift(null);
      return;
    }

    // Update in local state
    setShifts((prev) =>
      prev.map((item) =>
        item.id === draggedShift.id
          ? { ...item, staffId: targetStaffId, date: targetDate }
          : item
      )
    );

    const targetDoc = dbStaff.find((d) => d.id === targetStaffId);
    const targetDay = weekColumns.find((w) => w.dateFull === targetDate);
    const shiftLabel =
      draggedShift.shiftType === 'morning'
        ? 'Ca Sáng (08:00 - 12:00)'
        : draggedShift.shiftType === 'afternoon'
        ? 'Ca Chiều (13:30 - 17:30)'
        : 'Ca làm việc';

    showToast(
      `Đã chuyển ${shiftLabel} sang ${targetDay?.label || targetDate} cho ${
        targetDoc?.name || 'nhân sự'
      }!`
    );

    setDraggedShift(null);
  };

  // Open quick standard shift picker when clicking on cell
  const handleCellClick = (staffId: string, date: string) => {
    const staff = dbStaff.find((d) => d.id === staffId);
    const dayCol = weekColumns.find((c) => c.dateFull === date);
    setQuickPicker({
      staffId,
      staffName: staff?.name || 'Nhân sự',
      date,
      dateFormatted: `${dayCol?.label || 'Ngày'} (${dayCol?.dateStr || date})`,
    });
  };

  // Apply standard shift directly (Ca Sáng: 08:00 - 12:00, Ca Chiều: 13:30 - 17:30)
  const handleApplyStandardShift = async (type: 'morning' | 'afternoon' | 'fullday') => {
    if (!quickPicker) return;

    const { staffId, date, staffName } = quickPicker;

    if (type === 'fullday') {
      // Create both morning and afternoon shifts
      const morningItem: ScheduleItem = {
        id: `shift-m-${Date.now()}`,
        staffId,
        date,
        shiftType: 'morning',
        startTime: '08:00',
        endTime: '12:00',
        room: 'Ghế tiêu chuẩn',
      };
      const afternoonItem: ScheduleItem = {
        id: `shift-a-${Date.now() + 1}`,
        staffId,
        date,
        shiftType: 'afternoon',
        startTime: '13:30',
        endTime: '17:30',
        room: 'Ghế tiêu chuẩn',
      };

      setShifts((prev) => [...prev, morningItem, afternoonItem]);

      try {
        await Promise.all([
          staffSchedulesApi.create({
            staffId,
            date,
            shiftType: 'MORNING',
            startTime: '08:00',
            endTime: '12:00',
          }),
          staffSchedulesApi.create({
            staffId,
            date,
            shiftType: 'AFTERNOON',
            startTime: '13:30',
            endTime: '17:30',
          }),
        ]);
      } catch (err) {
        console.warn('API shift create notice:', err);
      }

      showToast(`Đã áp dụng ca cả ngày (08:00 - 17:30) cho ${staffName}!`);
    } else {
      const isMorning = type === 'morning';
      const newItem: ScheduleItem = {
        id: `shift-${Date.now()}`,
        staffId,
        date,
        shiftType: isMorning ? 'morning' : 'afternoon',
        startTime: isMorning ? '08:00' : '13:30',
        endTime: isMorning ? '12:00' : '17:30',
        room: 'Ghế tiêu chuẩn',
      };

      setShifts((prev) => [...prev, newItem]);

      try {
        await staffSchedulesApi.create({
          staffId,
          date,
          shiftType: isMorning ? 'MORNING' : 'AFTERNOON',
          startTime: isMorning ? '08:00' : '13:30',
          endTime: isMorning ? '12:00' : '17:30',
        });
      } catch (err) {
        console.warn('API shift create notice:', err);
      }

      showToast(
        `Đã áp dụng ${isMorning ? 'Ca Sáng (08:00 - 12:00)' : 'Ca Chiều (13:30 - 17:30)'} cho ${staffName}!`
      );
    }

    setQuickPicker(null);
  };

  // Auto-generate standard weekly schedule for all staff in branch
  const handleAutoGenerateWeek = async () => {
    try {
      setIsGenerating(true);
      const res = await staffSchedulesApi.autoGenerate({
        branchId: selectedBranchId !== 'all' ? selectedBranchId : undefined,
        weekStart: weekColumns[0].dateFull,
      });
      await loadData();
      showToast(res?.message || 'Đã áp dụng khung giờ tiêu chuẩn T2-T7 cho toàn bộ nhân sự!');
    } catch (err: any) {
      showToast('Tự động tạo ca thất bại: ' + (err.message || 'Lỗi server'), );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save from advanced ShiftModal
  const handleSaveShiftFromModal = async (data: ShiftData) => {
    const isMorning = data.shiftType === 'morning';
    const isAfternoon = data.shiftType === 'afternoon';
    const startTime = data.startTime || (isMorning ? '08:00' : isAfternoon ? '13:30' : '08:00');
    const endTime = data.endTime || (isMorning ? '12:00' : isAfternoon ? '17:30' : '17:30');

    const newShiftItem: ScheduleItem = {
      id: data.id || `shift-${Date.now()}`,
      staffId: data.staffId,
      date: data.date,
      shiftType: data.shiftType === 'leave' ? 'leave' : data.shiftType === 'overtime' ? 'overtime' : isAfternoon ? 'afternoon' : 'morning',
      startTime,
      endTime,
      room: data.room,
    };

    setShifts((prev) => [...prev, newShiftItem]);

    try {
      await staffSchedulesApi.create({
        staffId: data.staffId,
        date: data.date,
        shiftType: isMorning ? 'MORNING' : isAfternoon ? 'AFTERNOON' : 'FULL_DAY',
        startTime,
        endTime,
      });
    } catch (err) {
      console.warn('API shift create notice:', err);
    }

    showToast(`Đã thêm ca trực mới cho ${data.staffName || 'nhân sự'} thành công!`);
  };

  // Delete a shift
  const handleDeleteShift = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    try {
      await staffSchedulesApi.delete(shiftId);
    } catch (err) {
      // Ignored if local-only ID
    }
    showToast('Đã xóa ca trực khỏi lịch!');
  };

  // Excel export using real OpenXML format and UTF-8
  const handleExportSchedule = () => {
    const excelRows: any[] = [];
    filteredStaff.forEach((doc) => {
      weekColumns.forEach((col) => {
        const cellShifts = shifts.filter((s) => s.staffId === doc.id && s.date === col.dateFull);
        if (cellShifts.length > 0) {
          cellShifts.forEach((s) => {
            excelRows.push({
              'Mã nhân sự': doc.code || doc.id,
              'Họ và tên': doc.name,
              'Chuyên môn': doc.specialty,
              'Khoa phòng': doc.department,
              'Thứ': col.label,
              'Ngày': col.dateStr,
              'Ca trực':
                s.shiftType === 'morning'
                  ? 'Ca Sáng (08:00 - 12:00)'
                  : s.shiftType === 'afternoon'
                  ? 'Ca Chiều (13:30 - 17:30)'
                  : s.shiftType === 'leave'
                  ? 'Nghỉ phép'
                  : 'Tăng ca',
              'Khung giờ': `${s.startTime} - ${s.endTime}`,
              'Phòng / Ghế': s.room || 'Phòng khám tiêu chuẩn',
            });
          });
        } else {
          excelRows.push({
            'Mã nhân sự': doc.code || doc.id,
            'Họ và tên': doc.name,
            'Chuyên môn': doc.specialty,
            'Khoa phòng': doc.department,
            'Thứ': col.label,
            'Ngày': col.dateStr,
            'Ca trực': col.isSunday ? 'Nghỉ hàng tuần (OFF)' : 'Chưa phân ca',
            'Khung giờ': '—',
            'Phòng / Ghế': '—',
          });
        }
      });
    });

    const branchName = branches.find((b) => b.id === selectedBranchId)?.name || 'Tat_ca_chi_nhanh';
    exportToExcel(excelRows, `Bang_phan_ca_${branchName.replace(/\s+/g, '_')}_${weekColumns[0].dateStr.replace('/', '_')}`);
    showToast('Đã xuất file Excel bảng phân ca thành công!');
  };

  // Calculate statistics
  const totalStaffCount = filteredStaff.length;
  const totalHours = useMemo(() => {
    return shifts.reduce((acc, s) => {
      if (s.shiftType === 'morning') return acc + 4;
      if (s.shiftType === 'afternoon') return acc + 4; // 13:30 - 17:30 = 4h
      if (s.shiftType === 'overtime') return acc + 2.5;
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
            Quản lý phân ca làm việc &amp; Lịch trực nhân sự
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
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1.5 select-none font-extrabold text-xs">
              {currentWeekDateRangeStr}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Button: Áp dụng ca tiêu chuẩn tuần này */}
          <button
            type="button"
            onClick={handleAutoGenerateWeek}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Tự động gán ca sáng 08:00-12:00 và ca chiều 13:30-17:30 từ T2 đến T7"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span>Áp dụng ca tiêu chuẩn tuần này</span>
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportSchedule}
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
            <option value="Lễ tân">Lễ tân &amp; Điều phối</option>
          </select>

          <span className="hidden lg:inline text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
            💡 Nhấp vào ô bất kỳ để gán nhanh Ca Sáng (08:00 - 12:00) hoặc Ca Chiều (13:30 - 17:30)
          </span>
        </div>

        {/* Right: Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 px-1">
          {/* Ca Sáng */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-100 border border-sky-300 flex items-center justify-center">
              <Sun className="w-2.5 h-2.5 text-sky-600" />
            </span>
            <span>Ca Sáng (08:00-12:00)</span>
          </div>

          {/* Ca Chiều */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-900 text-white flex items-center justify-center">
              <Moon className="w-2.5 h-2.5" />
            </span>
            <span>Ca Chiều (13:30-17:30)</span>
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
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
            <span className="text-xs font-semibold">Đang tải bảng phân ca thực tế...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  {/* Staff Column Header */}
                  <th className="py-3 px-4 text-xs font-extrabold text-slate-700 w-52 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200">
                    Nhân sự ({filteredStaff.length})
                  </th>

                  {/* Weekday Column Headers */}
                  {weekColumns.map((col) => {
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

              {/* Table Body (5 Staff Per Page) */}
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedStaff.map((doc) => (
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
                    {weekColumns.map((col) => {
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
                                      {shift.startTime || '13:30'} - {shift.endTime || '17:30'}
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
                                    {shift.startTime || '18:00'} - {shift.endTime || '20:30'}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Empty Cell Quick Add hint */}
                            {cellShifts.length === 0 && (
                              <div className="h-full flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity py-4">
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-dashed border-slate-300">
                                  <Plus className="w-3 h-3 text-sky-500" /> Gán ca chuẩn
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
        )}

        {/* ─── Pagination Bar (Chính xác 5 nhân sự / trang) ────────────────── */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-semibold">
            Hiển thị <strong>{paginatedStaff.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> -{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</strong> trên tổng số{' '}
            <strong>{filteredStaff.length}</strong> nhân sự (5 người / trang)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
                  currentPage === page
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
            * Lịch trực đồng bộ tự động với hệ thống đặt hẹn và cảnh báo lưu lượng AI SmartSchedule
          </div>
        </div>
      </div>

      {/* ─── Quick Standard Shift Picker Modal ────────────────────────────── */}
      {quickPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Áp Dụng Khung Giờ Tiêu Chuẩn</h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {quickPicker.staffName} • {quickPicker.dateFormatted}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickPicker(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Ca Sáng tiêu chuẩn */}
              <button
                type="button"
                onClick={() => handleApplyStandardShift('morning')}
                className="w-full p-3 rounded-2xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Ca Sáng Tiêu Chuẩn</span>
                    <span className="text-[11px] text-sky-700 font-bold">08:00 - 12:00</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-sky-200/60 text-sky-800 rounded-lg">
                  Áp dụng
                </span>
              </button>

              {/* Ca Chiều tiêu chuẩn */}
              <button
                type="button"
                onClick={() => handleApplyStandardShift('afternoon')}
                className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-900 text-white hover:bg-slate-800 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold border border-slate-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">Ca Chiều Tiêu Chuẩn</span>
                    <span className="text-[11px] text-slate-300 font-medium">13:30 - 17:30</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg">
                  Áp dụng
                </span>
              </button>

              {/* Cả ngày tiêu chuẩn */}
              <button
                type="button"
                onClick={() => handleApplyStandardShift('fullday')}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Cả Ngày (Sáng &amp; Chiều)</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      08:00 - 17:30 (Nghỉ trưa 12:00 - 13:30)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg">
                  Áp dụng
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const current = quickPicker;
                  setQuickPicker(null);
                  setModalInitialStaffId(current.staffId);
                  setModalInitialDate(current.date);
                  setIsShiftModalOpen(true);
                }}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Tùy chỉnh chi tiết (phòng, ghi chú)...</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickPicker(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
