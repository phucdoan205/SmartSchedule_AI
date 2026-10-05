import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  Calendar,
  Edit,
  Printer,
  Download,
  Plus,
  Clock,
  Users,
  DollarSign,
  ThumbsUp,
  Search,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SERVICES } from '../../services/mockData';
import { ShiftModal } from './ShiftModal';
import { DoctorEditModal } from './DoctorEditModal';
import { staffApi, staffSchedulesApi, appointmentsApi, dentalServicesApi } from '../../services/api';
import { exportToExcel } from '../../utils/excelExport';

// ─── Mock data for tabs ─────────────────────────────────────────────────────
const WEEK_DAYS = [
  { label: 'THỨ 2', date: '17/08' },
  { label: 'THỨ 3', date: '18/08' },
  { label: 'THỨ 4', date: '19/08' },
  { label: 'THỨ 5', date: '20/08', isToday: true },
  { label: 'THỨ 6', date: '21/08' },
  { label: 'THỨ 7', date: '22/08' },
  { label: 'CN', date: '23/08' },
];

type ShiftType = 'morning' | 'afternoon' | 'fullday' | 'off' | null;

interface DayShift {
  type: ShiftType;
  time?: string;
  room?: string;
  patients?: number;
  isToday?: boolean;
  badge?: string;
  extra?: ShiftType;
  extraTime?: string;
}

const DOCTOR_SHIFTS: DayShift[] = [
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 3 },
  { type: null },
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 0 },
  { type: 'afternoon', time: '13:30 - 18:00', room: 'Ghế 01', isToday: true, patients: 2, badge: 'Hôm nay', extra: 'morning', extraTime: '2 ca hôm nay' },
  { type: 'morning', time: '08:00 - 12:00', room: 'Ghế 02', patients: 0 },
  { type: 'fullday', time: 'Ca Sáng & Ca Chiều', room: 'Ghế 02', patients: 0 },
  { type: 'off', time: 'Nghỉ hàng tuần (OFF)' },
];

const MOCK_TREATMENT_HISTORY = [
  {
    id: '#CA-2026-845',
    date: '18/08/2026',
    patient: 'Trần Thị Cẩm Tú',
    phone: '0933 *** 123',
    service: 'Mặt dán Veneer Emax (4 răng)',
    duration: 90,
    revenue: 32000000,
    commission: 4800000,
  },
  {
    id: '#CA-2026-831',
    date: '15/08/2026',
    patient: 'Lê Hoàng Long',
    phone: '0912 *** 678',
    service: 'Bọc 2 răng sứ Cercon (Đức)',
    duration: 60,
    revenue: 12000000,
    commission: 1800000,
  },
  {
    id: '#CA-2026-799',
    date: '12/08/2026',
    patient: 'Phạm Minh Anh',
    phone: '0908 *** 999',
    service: 'Sứ toàn phần Emax (Khám & Lấy dấu)',
    duration: 45,
    revenue: 7000000,
    commission: 1050000,
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    initials: 'DP',
    patient: 'Đoàn Văn Phúc',
    patientCode: '#BN26-0001',
    date: '18/08/2026',
    rating: 5,
    service: 'Mặt dán Veneer Emax',
    comment:
      'Bác sĩ An làm rất nhẹ nhàng, không hề bị ê buốt. Form răng thiết kế tự nhiên và khớp cắn ăn nhai rất thoải mái. Cảm ơn bác sĩ nhiều!',
    verified: true,
    branch: 'Cơ sở Biên Hòa',
    showOnWeb: true,
  },
  {
    id: 2,
    initials: 'TT',
    patient: 'Trần Minh Tâm',
    patientCode: '#BN26-0002',
    date: '15/08/2026',
    rating: 5,
    service: 'Sứ toàn phần Cercon (Đức)',
    comment:
      'Rất hài lòng với màu răng sứ BS. An tư vấn, nhìn y hệt răng thật. Bác sĩ dặn dò chu đáo sau khi lắp răng.',
    verified: false,
    branch: '',
    showOnWeb: true,
  },
];

// ─── Utility ────────────────────────────────────────────────────────────────
const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const ShiftBadge: React.FC<{ type: ShiftType; time?: string; room?: string; patients?: number; isToday?: boolean }> = ({
  type,
  time,
  room,
  patients,
  isToday,
}) => {
  if (!type) return <span className="text-xs text-slate-300 italic">—</span>;
  if (type === 'off') return <span className="text-xs text-slate-400 italic">{time}</span>;

  const isMorning = type === 'morning';
  const isAfternoon = type === 'afternoon';
  const isFullday = type === 'fullday';

  const bg = isToday
    ? 'bg-sky-100 border-sky-300 text-sky-900'
    : isMorning
    ? 'bg-slate-100 border-slate-200 text-slate-700'
    : isAfternoon
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-slate-100 border-slate-200 text-slate-700';

  const label = isMorning ? 'Ca Sáng' : isAfternoon ? 'Ca Chiều' : 'Ca Sáng & Ca Chiều';

  return (
    <div className={`rounded-xl border px-2.5 py-2 text-[11px] font-bold ${bg}`}>
      <div className="font-extrabold">{label}</div>
      <div className={`font-normal text-[10px] mt-0.5 ${isAfternoon && !isToday ? 'text-slate-300' : 'text-slate-500'}`}>
        {isFullday ? '08:00 - 18:00' : time}
      </div>
      {room && <div className={`text-[10px] font-medium mt-0.5 ${isAfternoon && !isToday ? 'text-slate-400' : 'text-slate-400'}`}>{room}</div>}
      {patients !== undefined && patients > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-sky-600">
          <Users className="w-2.5 h-2.5" /> {patients} bệnh nhân
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('services');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  
  // Independent toggle per review id with persistence
  const [reviewVisibilityMap, setReviewVisibilityMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('public_reviews_visibility');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'rev-1': true,
      'rev-2': true,
      'rev-3': true,
    };
  });

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic real data state
  const [realServices, setRealServices] = useState<any[]>([]);
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState<number>(0);
  const [weekShiftsData, setWeekShiftsData] = useState<any[]>([]);
  const [doctorAppointmentsList, setDoctorAppointmentsList] = useState<any[]>([]);

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDoctorMonday = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff + offset * 7, 0, 0, 0, 0);
    return monday;
  };

  const currentWeekDays = useMemo(() => {
    const monday = getDoctorMonday(scheduleWeekOffset);
    const labels = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'];
    const todayStr = formatLocalDate(new Date());

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dateFull = formatLocalDate(d);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        label: labels[i],
        date: dateStr,
        dateFull,
        isToday: dateFull === todayStr,
      };
    });
  }, [scheduleWeekOffset]);

  const weekDateRangeStr = currentWeekDays.length === 7
    ? `${currentWeekDays[0].date}/${currentWeekDays[0].dateFull.slice(0, 4)} – ${currentWeekDays[6].date}/${currentWeekDays[6].dateFull.slice(0, 4)}`
    : '';

  // Load real services from DB
  const loadServices = async () => {
    try {
      const srvData = await dentalServicesApi.getAll({ isActive: true });
      if (Array.isArray(srvData) && srvData.length > 0) {
        const activeOnly = srvData.filter((s: any) => s.isActive !== false);
        setRealServices(activeOnly);
      }
    } catch (e) {
      console.warn('Lỗi khi tải dịch vụ:', e);
    }
  };

  // Load real schedules & appointments for this doctor
  const loadDoctorSchedulesAndAppts = async (doctorId: string) => {
    if (!doctorId || currentWeekDays.length === 0) return;
    try {
      const start = currentWeekDays[0].dateFull;
      const end = currentWeekDays[6].dateFull;

      const [schedules, appts] = await Promise.all([
        staffSchedulesApi.getAll({
          userId: doctorId,
          startDate: start,
          endDate: end,
        }).catch(() => []),
        appointmentsApi.getAll({
          doctorId: doctorId,
        }).catch(() => []),
      ]);

      if (Array.isArray(schedules)) {
        setWeekShiftsData(schedules);
      }
      if (Array.isArray(appts)) {
        setDoctorAppointmentsList(appts);
      }
    } catch (err) {
      console.warn('Lỗi khi tải lịch và ca khám của bác sĩ:', err);
    }
  };

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getDoctorById(id || 'NV001');
      if (data) {
        const resolvedName = data.name || data.fullName || 'Bác sĩ';
        const resolvedCode = data.code || data.employeeCode || `NV-${String(data.id).slice(0, 4)}`;
        const resolvedAvatar = data.avatar || data.avatarUrl;
        const staffKey = data.id || resolvedCode;

        // Synchronize services (priority: localStorage > API > defaults based on specialty/code)
        let docServices = data.services;
        const savedServices = localStorage.getItem(`staff_services_${staffKey}`);
        if (savedServices) {
          try {
            const parsed = JSON.parse(savedServices);
            if (Array.isArray(parsed) && parsed.length > 0) docServices = parsed;
          } catch (e) {}
        }
        const isDocRole =
          data.roleRaw === 'DOCTOR' ||
          data.role === 'Bác sĩ chuyên khoa' ||
          data.role === 'Bác sĩ' ||
          resolvedName.startsWith('BS.') ||
          resolvedName.startsWith('TS.BS.') ||
          resolvedName.startsWith('BS.CKI') ||
          (data.role?.toLowerCase().includes('bác sĩ') && !data.role?.toLowerCase().includes('kế toán'));

        if (!docServices || docServices.length === 0) {
          if (isDocRole) {
            docServices = resolvedCode === 'NV002' || data.specialty?.includes('Implant')
              ? ['Cấy ghép Implant Straumann', 'Trụ Osstem No mount (Hàn Quốc)', 'Trụ Osstem SA (Hàn Quốc)']
              : ['Sứ toàn phần Cercon (Đức)', 'Sứ toàn phần Emax', 'Mặt dán Veneer Emax'];
          } else {
            docServices = [];
          }
        }

        // Synchronize commission rate
        let docCommission = data.commissionRate;
        const savedCommission = localStorage.getItem(`staff_commission_${staffKey}`);
        if (savedCommission !== null && savedCommission !== '') {
          docCommission = Number(savedCommission);
        } else if (docCommission === undefined) {
          docCommission = isDocRole ? (resolvedCode === 'NV002' || data.specialty?.includes('Implant') ? 20 : 15) : 0;
        }

        // Synchronize working schedule
        let docWorkDays = data.workDays;
        const savedWorkDays = localStorage.getItem(`staff_workdays_${staffKey}`);
        if (savedWorkDays) {
          try { docWorkDays = JSON.parse(savedWorkDays); } catch (e) {}
        }
        if (!docWorkDays || !Array.isArray(docWorkDays)) {
          docWorkDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        }

        let docWorkHours = data.workHours;
        const savedWorkHours = localStorage.getItem(`staff_workhours_${staffKey}`);
        if (savedWorkHours) docWorkHours = savedWorkHours;
        if (!docWorkHours) docWorkHours = '08:00 - 17:30';

        let docLunchBreak = data.lunchBreak;
        const savedLunchBreak = localStorage.getItem(`staff_lunchbreak_${staffKey}`);
        if (savedLunchBreak) docLunchBreak = savedLunchBreak;
        if (!docLunchBreak) docLunchBreak = '12:00 - 13:30';

        setDoctor({
          id: data.id,
          code: resolvedCode,
          employeeCode: resolvedCode,
          name: resolvedName,
          fullName: resolvedName,
          initials: resolvedName
            ? resolvedName.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(-2).toUpperCase()
            : 'NV',
          role: data.role || (isDocRole ? 'Bác sĩ chuyên khoa' : 'Nhân sự'),
          roleRaw: data.roleRaw,
          specialty: data.specialty || data.doctorProfile?.specialty || data.department || (isDocRole ? 'Phục hình Răng sứ & Thẩm mỹ' : 'Kỹ thuật chuyên trách'),
          department: data.department || (data.doctorProfile?.specialty ? `Khoa ${data.doctorProfile.specialty}` : 'Nha khoa'),
          branch: data.branch?.name || data.branch || 'Chi nhánh Biên Hòa (Trụ sở chính)',
          branchId: data.branchId,
          phone: data.phone || '090 123 4567',
          email: data.email || 'staff@smartschedule.ai',
          avatar: resolvedAvatar,
          avatarUrl: resolvedAvatar,
          rating: isDocRole || data.roleRaw === 'NURSE' ? (data.rating || data.doctorProfile?.rating || data.doctorProfile?.ratingAverage || 4.9) : 0,
          totalAppointments: isDocRole || data.roleRaw === 'NURSE' ? (data.totalAppointments || data.doctorProfile?.totalAppointments || data.doctorAppointments?.length || 128) : 0,
          commissionRate: Number(docCommission),
          joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : (data.joinedDate || '12/05/2021'),
          title: data.title || data.doctorProfile?.title || data.role || (isDocRole ? 'Bác sĩ Chuyên khoa - Răng Hàm Mặt' : 'Nhân sự phòng khám'),
          bio: data.bio || data.doctorProfile?.bio || (isDocRole ? 'Chuyên gia phục hình nụ cười với hơn 8 năm kinh nghiệm...' : 'Nhân sự tận tâm, chuyên nghiệp tại hệ thống SmartSchedule.'),
          doctorAppointments: data.doctorAppointments || [],
          staffSchedules: data.staffSchedules || [],
          services: docServices,
          workDays: docWorkDays,
          workHours: docWorkHours,
          lunchBreak: docLunchBreak,
        });
        loadDoctorSchedulesAndAppts(data.id);
      } else {
        const fallback = MOCK_DOCTORS.find((d) => d.id === id || d.code === id) || MOCK_DOCTORS[0];
        setDoctor(fallback);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông tin bác sĩ:', err);
      const fallback = MOCK_DOCTORS.find((d) => d.id === id || d.code === id) || MOCK_DOCTORS[0];
      setDoctor(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    loadServices();

    // Listen to real-time sync when schedule, staff or appointment updates
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'STAFF_UPDATED') {
          fetchDoctor();
        }
        if (event.data?.type === 'SCHEDULE_UPDATED' || event.data?.type === 'APPOINTMENT_UPDATED') {
          if (doctor?.id) {
            loadDoctorSchedulesAndAppts(doctor.id);
          } else {
            fetchDoctor();
          }
        }
      };
    } catch (e) {
      // BroadcastChannel fallback
    }
    return () => channel?.close();
  }, [id]);

  useEffect(() => {
    if (doctor?.id) {
      loadDoctorSchedulesAndAppts(doctor.id);
    }
  }, [doctor?.id, scheduleWeekOffset]);

  // Dynamically calculate shifts for 7 days linked with doctor's workDays & workHours
  const computedDoctorShifts: DayShift[] = useMemo(() => {
    const docDays: string[] = Array.isArray(doctor?.workDays) ? doctor.workDays : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const docHours = doctor?.workHours || '08:00 - 17:30';

    const dayMap: Record<string, string> = {
      'THỨ 2': 'T2',
      'THỨ 3': 'T3',
      'THỨ 4': 'T4',
      'THỨ 5': 'T5',
      'THỨ 6': 'T6',
      'THỨ 7': 'T7',
      'CN': 'CN',
    };

    return currentWeekDays.map((d: any) => {
      const shortDay = dayMap[d.label] || d.label;
      const isScheduledWorkDay = docDays.includes(shortDay);

      const dayShifts = weekShiftsData.filter((s: any) => s.date?.split('T')[0] === d.dateFull);
      const dayAppts = doctorAppointmentsList.filter((a: any) => {
        const aptDate = a.startTime ? formatLocalDate(new Date(a.startTime)) : (a.date || '');
        return aptDate === d.dateFull;
      });

      // If doctor does not work on this day according to workDays
      if (!isScheduledWorkDay) {
        return {
          type: 'off',
          time: 'Nghỉ hàng tuần (OFF)',
          patients: dayAppts.length,
          isToday: d.isToday,
        };
      }

      // If no custom shifts recorded yet in database for this working day, fallback to default hours
      if (dayShifts.length === 0) {
        return {
          type: 'fullday',
          time: docHours,
          room: 'Ghế 02',
          patients: dayAppts.length,
          isToday: d.isToday,
          extraTime: d.isToday && dayAppts.length > 0 ? `${dayAppts.length} ca hôm nay` : undefined,
        };
      }

      const hasMorning = dayShifts.some((s: any) => s.shiftType === 'morning');
      const hasAfternoon = dayShifts.some((s: any) => s.shiftType === 'afternoon');
      const hasFull = dayShifts.some((s: any) => s.shiftType === 'full_day' || s.shiftType === 'fullday');
      const hasOvertime = dayShifts.some((s: any) => s.shiftType === 'evening' || s.shiftType === 'overtime');
      const hasLeave = dayShifts.some((s: any) => s.isLeave || s.shiftType === 'leave');

      const room = dayShifts[0]?.room || 'Ghế 02';

      if (hasLeave) {
        return { type: 'off', time: 'Nghỉ phép', room, patients: 0, isToday: d.isToday };
      }
      if (hasFull || (hasMorning && hasAfternoon)) {
        return {
          type: 'fullday',
          time: docHours,
          room,
          patients: dayAppts.length,
          isToday: d.isToday,
          extraTime: d.isToday && dayAppts.length > 0 ? `${dayAppts.length} ca hôm nay` : undefined,
        };
      }
      if (hasMorning) {
        return {
          type: 'morning',
          time: '08:00 - 12:00',
          room,
          patients: dayAppts.length,
          isToday: d.isToday,
          extraTime: d.isToday && dayAppts.length > 0 ? `${dayAppts.length} ca hôm nay` : undefined,
        };
      }
      if (hasAfternoon) {
        return {
          type: 'afternoon',
          time: '13:30 - 18:00',
          room,
          patients: dayAppts.length,
          isToday: d.isToday,
          extraTime: d.isToday && dayAppts.length > 0 ? `${dayAppts.length} ca hôm nay` : undefined,
        };
      }
      if (hasOvertime) {
        return {
          type: 'afternoon',
          time: '18:00 - 20:30 (Tăng ca)',
          room,
          patients: dayAppts.length,
          isToday: d.isToday,
        };
      }
      return {
        type: 'fullday',
        time: docHours,
        room: 'Ghế 02',
        patients: dayAppts.length,
        isToday: d.isToday,
      };
    });
  }, [currentWeekDays, weekShiftsData, doctorAppointmentsList, doctor?.workDays, doctor?.workHours]);

  // Tab 2 stats
  const totalShiftsCount = computedDoctorShifts.filter((s) => s.type && s.type !== 'off').length || 6;
  const totalHoursCount = computedDoctorShifts.reduce((acc, s) => {
    if (s.type === 'fullday') return acc + 8.5;
    if (s.type === 'morning' || s.type === 'afternoon') return acc + 4.5;
    return acc;
  }, 0) || 40.5;
  const totalWeekPatients = computedDoctorShifts.reduce((acc, s) => acc + (s.patients || 0), 0);

  // Tab 1: Assigned services mapped from modal & database
  const assignedDoctorServices = useMemo(() => {
    const assignedNames: string[] = Array.isArray(doctor?.services) ? doctor.services : [];
    if (assignedNames.length === 0) {
      return [];
    }

    const icons = ['🦷', '🔩', '✨', '💎', '🩺', '🔬', '🌟', '🛡️'];

    return assignedNames.map((name, i) => {
      const match = realServices.find(
        (s) => s.name?.toLowerCase().trim() === name.toLowerCase().trim() || s.id === name
      );
      const duration = match?.durationMinutes || (name.includes('Implant') ? 90 : name.includes('Veneer') ? 60 : 45);
      const price = Number(match?.standardPrice ?? match?.price ?? (name.includes('Implant') ? 18000000 : name.includes('Cercon') ? 5500000 : 5000000));
      const category = match?.category?.name || (name.includes('Implant') ? 'Cấy ghép Implant' : 'Phục hình Thẩm mỹ');

      return {
        id: match?.id || `srv-${i}`,
        name: match?.name || name,
        duration,
        price,
        category,
        icon: icons[i % icons.length],
      };
    });
  }, [doctor?.services, realServices]);

  // Tab 3 treatments: Historical snapshot commission preservation algorithm
  const displayedTreatments = useMemo(() => {
    const activeRate = Number(doctor?.commissionRate !== undefined ? doctor.commissionRate : 15);
    const staffKey = doctor?.id || doctor?.code || doctor?.employeeCode || 'NV001';
    const changedAtStr = localStorage.getItem(`staff_commission_changed_at_${staffKey}`);
    const changedAtTime = changedAtStr ? new Date(changedAtStr).getTime() : 0;
    const prevRateStr = localStorage.getItem(`staff_prev_commission_${staffKey}`);
    const prevRate = prevRateStr ? Number(prevRateStr) : (doctor?.code === 'NV002' ? 20 : 15);

    // Load persisted treatment snapshots
    let snapshots: Record<string, { rate: number; commission: number }> = {};
    try {
      const saved = localStorage.getItem('treatment_commission_snapshots');
      if (saved) snapshots = JSON.parse(saved);
    } catch (e) {}

    const raw = doctorAppointmentsList.length > 0 ? doctorAppointmentsList : (doctor?.doctorAppointments || []);
    let updatedSnapshots = false;
    let result: any[] = [];

    if (raw.length > 0) {
      result = raw.map((a: any, idx: number) => {
        const srv = a.services?.[0]?.service;
        // MUST convert standardPrice (Prisma string) to Number!
        const rev = Number(srv?.standardPrice ?? srv?.price ?? 5500000);
        const code = a.appointmentCode || `#CA-2026-${String(845 - idx).padStart(3, '0')}`;
        const rawDate = a.startTime ? new Date(a.startTime) : new Date();
        const dateStr = `${String(rawDate.getDate()).padStart(2, '0')}/${String(rawDate.getMonth() + 1).padStart(2, '0')}/${rawDate.getFullYear()}`;
        const apptTime = rawDate.getTime();

        // Check if treatment already has a preserved snapshot
        let rateToApply = activeRate;
        let commToApply = 0;

        if (snapshots[code]) {
          rateToApply = snapshots[code].rate;
          commToApply = snapshots[code].commission;
        } else {
          // If treatment occurred before the commission rate change, preserve the historical rate (e.g. 15%)
          // If after the change (or new ca), use the active rate (e.g. 20%)
          if (changedAtTime > 0 && apptTime < changedAtTime) {
            rateToApply = prevRate;
          } else if (changedAtTime === 0) {
            // Seed baseline for existing historical treatments
            rateToApply = prevRate || 15;
          } else {
            rateToApply = activeRate;
          }
          commToApply = Math.round((rev * rateToApply) / 100);
          snapshots[code] = { rate: rateToApply, commission: commToApply };
          updatedSnapshots = true;
        }

        return {
          id: code,
          date: dateStr,
          patient: a.patient?.fullName || 'Trần Thị Cẩm Tú',
          phone: a.patient?.phone ? `${a.patient.phone.slice(0, 4)} *** ${a.patient.phone.slice(-3)}` : '0933 *** 123',
          service: srv?.name || a.notes || 'Tẩy Trắng Răng Chuyên Sâu Công Nghệ Laser Whitening',
          duration: srv?.durationMinutes || 45,
          revenue: rev,
          commission: commToApply,
          commissionRate: rateToApply,
        };
      });
    } else {
      result = MOCK_TREATMENT_HISTORY.map((t) => {
        const rev = Number(t.revenue || 0);
        let rateToApply = 15;
        let commToApply = Math.round((rev * rateToApply) / 100);

        if (snapshots[t.id]) {
          rateToApply = snapshots[t.id].rate;
          commToApply = snapshots[t.id].commission;
        } else {
          snapshots[t.id] = { rate: rateToApply, commission: commToApply };
          updatedSnapshots = true;
        }

        return {
          ...t,
          revenue: rev,
          commission: commToApply,
          commissionRate: rateToApply,
        };
      });
    }

    if (updatedSnapshots) {
      try {
        localStorage.setItem('treatment_commission_snapshots', JSON.stringify(snapshots));
      } catch (e) {}
    }

    return result;
  }, [doctor?.commissionRate, doctor?.id, doctor?.code, doctorAppointmentsList, doctor?.doctorAppointments]);

  const filteredTreatments = useMemo(() => {
    return displayedTreatments.filter((row: any) => {
      const matchSearch =
        row.patient.toLowerCase().includes(historySearch.toLowerCase()) ||
        row.id.toLowerCase().includes(historySearch.toLowerCase()) ||
        row.service.toLowerCase().includes(historySearch.toLowerCase());
      if (!matchSearch) return false;

      if (historyFilter === 'all') return true;
      if (historyFilter === 'cercon') return row.service.toLowerCase().includes('cercon');
      if (historyFilter === 'veneer') return row.service.toLowerCase().includes('veneer');
      if (historyFilter === 'revisit') return row.service.toLowerCase().includes('tái khám') || row.service.toLowerCase().includes('lấy dấu');
      return true;
    });
  }, [displayedTreatments, historySearch, historyFilter]);

  const totalTreatmentsCount = doctor?.totalAppointments || displayedTreatments.length || 128;
  // Strict Number sum to guarantee no concatenation
  const totalRevenueNumber = useMemo(() => {
    return displayedTreatments.reduce((sum: number, t: any) => sum + (Number(t.revenue) || 0), 0);
  }, [displayedTreatments]);

  // Tab 4 reviews: Seed and synchronize to public reviews for homepage
  const displayedReviews = useMemo(() => {
    const docName = doctor?.name || doctor?.fullName || 'BS. Nguyễn Thị An';
    const branchName = typeof doctor?.branch === 'string' ? doctor.branch : doctor?.branch?.name || 'Chi nhánh Biên Hòa';
    const docKey = doctor?.id || doctor?.code || 'NV001';

    const baseList = [
      {
        id: `rev-${docKey}-1`,
        initials: 'TL',
        patient: 'Lê Trần Tiến Luật',
        patientCode: '#BN26-0004',
        date: '25/09/2026',
        rating: 5,
        service: 'Tẩy Trắng Răng Chuyên Sâu Công Nghệ Laser Whitening',
        comment: `Bác sĩ ${docName} làm rất nhẹ nhàng, không hề bị ê buốt. Form răng thiết kế tự nhiên và khớp cắn ăn nhai rất thoải mái. Cảm ơn bác sĩ nhiều!`,
        verified: true,
        branch: branchName,
        doctorName: docName,
        doctorSpecialty: doctor?.specialty || 'Phục hình Răng sứ & Thẩm mỹ',
      },
      {
        id: `rev-${docKey}-2`,
        initials: 'VT',
        patient: 'Nguyen Van Test',
        patientCode: '#BN26-0005',
        date: '24/09/2026',
        rating: 5,
        service: 'Bọc 2 răng sứ Cercon (Đức)',
        comment: `Rất hài lòng với màu răng sứ BS. ${docName} tư vấn, nhìn y hệt răng thật. Bác sĩ dặn dò chu đáo sau khi lắp răng.`,
        verified: true,
        branch: branchName,
        doctorName: docName,
        doctorSpecialty: doctor?.specialty || 'Phục hình Răng sứ & Thẩm mỹ',
      },
      {
        id: `rev-${docKey}-3`,
        initials: 'TH',
        patient: 'Tran Van Hen',
        patientCode: '#BN26-0006',
        date: '23/09/2026',
        rating: 5,
        service: 'Mặt dán Veneer Emax',
        comment: `Bác sĩ điều trị rất cẩn thận, giải thích rõ ràng từng bước trước khi làm. Rất an tâm khi được bác sĩ trực tiếp thăm khám!`,
        verified: true,
        branch: branchName,
        doctorName: docName,
        doctorSpecialty: doctor?.specialty || 'Phục hình Răng sứ & Thẩm mỹ',
      },
    ];

    return baseList;
  }, [doctor]);

  // Synchronize public reviews for homepage whenever visibility changes
  const syncPublicReviews = (visMap: Record<string, boolean>) => {
    try {
      const publicReviews = displayedReviews
        .filter((r) => visMap[r.id] !== false)
        .map((r) => ({ ...r, showOnWeb: true }));
      localStorage.setItem('public_patient_reviews', JSON.stringify(publicReviews));

      const channel = new BroadcastChannel('smartschedule_sync');
      channel.postMessage({ type: 'REVIEWS_UPDATED', visibilityMap: visMap });
      channel.close();
    } catch (e) {}
  };

  const handleToggleReviewVisibility = (reviewId: string) => {
    setReviewVisibilityMap((prev) => {
      const currentVal = prev[reviewId] ?? true;
      const nextVal = !currentVal;
      const updated = { ...prev, [reviewId]: nextVal };
      localStorage.setItem('public_reviews_visibility', JSON.stringify(updated));
      syncPublicReviews(updated);
      return updated;
    });
  };

  const handleExportSchedule = () => {
    const targetDoc = doctor || currentDoctor;
    if (!targetDoc) return;
    const scheduleData = currentWeekDays.map((d: any, i: number) => {
      const shift = computedDoctorShifts[i];
      return {
        'Thứ': d.label,
        'Ngày': d.date,
        'Bác sĩ': targetDoc.name || targetDoc.fullName || 'Bác sĩ',
        'Mã bác sĩ': targetDoc.code || targetDoc.employeeCode || 'NV001',
        'Ca trực': shift?.type === 'morning' ? 'Ca Sáng' : shift?.type === 'afternoon' ? 'Ca Chiều' : shift?.type === 'fullday' ? 'Cả ngày' : 'Nghỉ (OFF)',
        'Khung giờ': shift?.time || '—',
        'Phòng / Ghế': shift?.room || '—',
        'Số ca hẹn': shift?.patients || 0,
      };
    });
    exportToExcel(scheduleData, `Lich_truc_${targetDoc.code || targetDoc.employeeCode || 'BS'}_Tuan`);
  };

  const handleExportTreatments = () => {
    const targetDoc = doctor || currentDoctor;
    if (!targetDoc) return;
    const exportData = displayedTreatments.map((a: any) => ({
      'Mã ca': a.id,
      'Ngày khám': a.date,
      'Bệnh nhân': a.patient,
      'SĐT': a.phone,
      'Dịch vụ kỹ thuật': a.service,
      'Thời lượng (phút)': a.duration,
      'Doanh thu (VNĐ)': a.revenue,
      'Hoa hồng (VNĐ)': a.commission,
    }));
    exportToExcel(exportData, `Lich_su_ca_kham_${targetDoc.code || targetDoc.employeeCode || 'BS'}`);
  };

  // Star distribution mock
  const starDist = [
    { star: 5, pct: 92, count: 118 },
    { star: 4, pct: 6, count: 6 },
    { star: 3, pct: 2, count: 4 },
    { star: 2, pct: 0, count: 0 },
    { star: 1, pct: 0, count: 0 },
  ];

  const currentDoctor = doctor || MOCK_DOCTORS[0];

  const isAccountant = useMemo(() => {
    if (!currentDoctor) return false;
    const rRaw = ((currentDoctor.roleRaw || '') as string).toUpperCase();
    const r = ((currentDoctor.role || '') as string).toLowerCase();
    const name = (currentDoctor.name || currentDoctor.fullName || '').toLowerCase();
    return (
      rRaw === 'ACCOUNTANT' ||
      rRaw.includes('KẾ TOÁN') ||
      rRaw.includes('KE TOAN') ||
      r.includes('kế toán') ||
      r.includes('tài chính') ||
      name.includes('dinh')
    );
  }, [currentDoctor]);

  const isDoctor = useMemo(() => {
    if (!currentDoctor) return false;
    const rRaw = ((currentDoctor.roleRaw || '') as string).toUpperCase();
    const r = ((currentDoctor.role || '') as string).toLowerCase();
    const name = currentDoctor.name || currentDoctor.fullName || '';
    if (rRaw === 'DOCTOR') return true;
    if (['TECHNICIAN', 'RECEPTIONIST', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'NURSE', 'ACCOUNTANT'].includes(rRaw)) return false;
    if (rRaw.includes('KẾ TOÁN') || rRaw.includes('KE TOAN')) return false;
    if (r.includes('kỹ thuật') || r.includes('lễ tân') || r.includes('quản lý') || r.includes('quản trị') || r.includes('điều dưỡng') || r.includes('kế toán')) return false;
    if (name.startsWith('KTV.') || name.startsWith('LT.') || name.startsWith('ĐD.') || name.includes('Đoàn Thị Dinh')) return false;
    if (name.startsWith('BS.') || name.startsWith('TS.BS.') || name.startsWith('ThS.BS.') || name.startsWith('BS.CKI') || name.startsWith('BS.CKII') || r.includes('bác sĩ')) return true;
    return false;
  }, [currentDoctor]);

  const isNurse = useMemo(() => {
    if (!currentDoctor) return false;
    const rRaw = ((currentDoctor.roleRaw || '') as string).toUpperCase();
    const r = ((currentDoctor.role || '') as string).toLowerCase();
    return rRaw === 'NURSE' || r.includes('điều dưỡng');
  }, [currentDoctor]);

  const tabs = useMemo(() => {
    if (isDoctor) {
      return [
        { id: 'services', label: 'Dịch vụ phụ trách' },
        { id: 'schedule', label: 'Lịch trực tuần này' },
        { id: 'history', label: 'Lịch sử ca điều trị' },
        { id: 'reviews', label: 'Đánh giá từ bệnh nhân' },
      ];
    }
    if (isNurse) {
      return [
        { id: 'schedule', label: 'Lịch trực tuần này' },
        { id: 'history', label: 'Ca hỗ trợ điều trị' },
        { id: 'reviews', label: 'Đánh giá từ bệnh nhân' },
      ];
    }
    if (isAccountant) {
      return [
        { id: 'schedule', label: 'Lịch trực & Làm việc tuần này' },
        { id: 'duties', label: 'Nhiệm vụ & Nghiệp vụ Kế toán' },
        { id: 'attendance', label: 'Lương & Chấm công tháng' },
      ];
    }
    // Non-clinical: Kỹ thuật viên, Lễ tân, Quản trị viên, Quản lý
    return [
      { id: 'schedule', label: 'Lịch trực tuần này' },
      { id: 'duties', label: 'Thông tin nhiệm vụ & Chuyên môn' },
      { id: 'attendance', label: 'Lịch sử ca làm & Chấm công' },
    ];
  }, [isDoctor, isNurse, isAccountant]);

  useEffect(() => {
    if (!isDoctor && activeTab === 'services') {
      setActiveTab('schedule');
    }
  }, [isDoctor, activeTab]);

  if (loading && !doctor) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        <p className="text-xs font-semibold text-slate-500">Đang tải hồ sơ nhân sự...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-5">
        <button type="button" onClick={() => navigate('/admin/staff')} className="hover:text-sky-600 transition-colors">
          Bác sĩ &amp; Nhân sự
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <button type="button" onClick={() => navigate('/admin/staff')} className="hover:text-sky-600 transition-colors">
          Danh sách nhân viên
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold">
          Chi tiết: {currentDoctor.name || currentDoctor.fullName || 'Bác sĩ'} ({currentDoctor.code || currentDoctor.employeeCode || 'NV001'})
        </span>
      </nav>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            Chỉnh sửa hồ sơ
          </button>
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            Thêm ca trực
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col items-center text-center">
            <div className="relative mb-3">
              {currentDoctor.avatar ? (
                <img
                  src={currentDoctor.avatar}
                  alt={currentDoctor.name || currentDoctor.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-sky-100 text-sky-700 font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {currentDoctor.initials || (currentDoctor.name || currentDoctor.fullName || 'BS').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Đang hoạt động
              </span>
            </div>

            <h2 className="text-sm font-black text-slate-900 mt-2">{currentDoctor.name || currentDoctor.fullName}</h2>
            <p className="text-[11px] font-bold text-sky-600 mt-0.5">#{currentDoctor.code || currentDoctor.employeeCode}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
              {!isDoctor && currentDoctor.role ? `${currentDoctor.role} • ${currentDoctor.specialty}` : currentDoctor.specialty}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{currentDoctor.branch}</p>

            <div className="w-full h-px bg-slate-100 my-4" />

            <div className="w-full space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{currentDoctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium truncate text-[11px]">{currentDoctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">Gia nhập: {currentDoctor.joinedDate || '12/05/2021'}</span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 my-4" />

            {/* Performance */}
            <div className="w-full text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Hiệu suất &amp; ca trực</p>
              <div className="grid grid-cols-2 gap-2">
                {isDoctor ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Mức hoa hồng</p>
                      <p className="text-base font-black text-slate-800">{currentDoctor.commissionRate ?? 15}%</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Đánh giá ({currentDoctor.totalAppointments})</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-base font-black text-slate-800">{currentDoctor.rating}</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  </>
                ) : isNurse ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Ca phụ tá tháng</p>
                      <p className="text-base font-black text-slate-800">{currentDoctor.totalAppointments || 45} ca</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Đánh giá</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-base font-black text-slate-800">4.9</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Ca làm / tháng</p>
                      <p className="text-base font-black text-slate-800">24 ca</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">Chuyên cần</p>
                      <p className="text-base font-black text-emerald-600">100%</p>
                    </div>
                  </>
                )}
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100 col-span-2">
                  <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Khung giờ chuẩn (Mặc định)</p>
                  <p className="text-xs font-bold text-slate-800">
                    {currentDoctor.workDays && currentDoctor.workDays.length > 0 ? (
                      <>
                        {currentDoctor.workHours || '08:00 - 17:30'}
                        <span className="block text-[10px] font-semibold text-sky-600 mt-0.5">
                          ({currentDoctor.workDays.join(', ')})
                        </span>
                      </>
                    ) : (
                      <span className="text-rose-500 font-semibold text-xs">Đang tạm nghỉ (Chưa gán ca)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs mb-4 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-3.5 text-xs font-bold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-sky-600 bg-sky-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB 1: Dịch vụ phụ trách ─────────────────────────────── */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
              {/* AI tip banner */}
              <div className="flex items-start gap-3 bg-sky-50 border border-sky-200/70 rounded-xl p-3.5 mb-5">
                <TrendingUp className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-700 font-medium leading-relaxed">
                  ✦&nbsp; {currentDoctor.name || 'BS. An'} có tỷ lệ đặt lịch cao nhất cho dịch vụ{' '}
                  <span className="font-bold">
                    {assignedDoctorServices[0]?.name || 'Khám & Điều trị chuyên khoa'}
                  </span> tại chi nhánh{' '}
                  <span className="font-bold">{currentDoctor.branch || 'Biên Hòa (85%).'}</span>
                </p>
              </div>

              {assignedDoctorServices.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 text-xl">
                    ⚠️
                  </div>
                  <p className="text-sm font-bold text-slate-800">Bác sĩ chưa được gán dịch vụ phụ trách</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Vui lòng bấm nút &ldquo;Chỉnh sửa hồ sơ&rdquo; để chọn và thêm các dịch vụ chuyên môn cho bác sĩ.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm dịch vụ ngay
                  </button>
                </div>
              ) : (
                <>
                  {/* Services table header */}
                  <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 px-1">
                    <span className="col-span-6">Tên dịch vụ &amp; Chuyên mục</span>
                    <span className="col-span-3 text-center">Thời gian</span>
                    <span className="col-span-3 text-right">Đơn giá</span>
                  </div>

                  {/* Service rows */}
                  <div className="divide-y divide-slate-50">
                    {assignedDoctorServices.map((srv, i) => (
                      <div key={srv.id || i} className="grid grid-cols-12 items-center py-3.5 px-1 hover:bg-slate-50/50 rounded-xl transition-colors">
                        <div className="col-span-6 flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span className="text-lg shrink-0">{srv.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate block">{srv.name}</span>
                            <span className="text-[11px] font-medium text-slate-400 block">{srv.category}</span>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{srv.duration}p</span>
                        </div>
                        <div className="col-span-3 text-right text-xs sm:text-sm font-bold text-slate-800">
                          {fmtVND(srv.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB 2: Lịch trực tuần này ────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Tổng ca trực tuần này', value: `${totalShiftsCount} ca`, icon: Calendar, color: 'text-sky-600' },
                  { label: 'Tổng giờ làm việc', value: `${totalHoursCount} giờ`, icon: Clock, color: 'text-emerald-600' },
                  { label: 'Ca hẹn đã gán', value: `${totalWeekPatients} ca khám`, icon: Users, color: 'text-amber-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-50 ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly calendar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {/* Calendar header with dynamic week navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleWeekOffset((prev) => prev - 1)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                      title="Tuần trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Tuần: {weekDateRangeStr}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScheduleWeekOffset((prev) => prev + 1)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                      title="Tuần sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      In lịch
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSchedule}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Xuất Excel
                    </button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {currentWeekDays.map((d: any) => (
                          <th
                            key={d.dateFull}
                            className={`px-3 py-3 text-center font-bold w-[13%] ${
                              d.isToday ? 'text-sky-600 bg-sky-50/50' : 'text-slate-500'
                            }`}
                          >
                            <div className={`font-extrabold ${d.isToday ? 'text-sky-600' : 'text-slate-500'}`}>
                              {d.label}
                            </div>
                            <div className={`text-base font-black mt-0.5 ${d.isToday ? 'text-sky-600' : 'text-slate-800'}`}>
                              {d.date}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {computedDoctorShifts.map((shift, i) => (
                          <td key={i} className={`px-2 py-3 align-top ${shift.isToday ? 'bg-sky-50/30' : ''}`}>
                            <div className="flex flex-col gap-1.5">
                              {shift.type && (
                                <ShiftBadge
                                  type={shift.type}
                                  time={shift.time}
                                  room={shift.room}
                                  patients={shift.patients}
                                  isToday={shift.isToday}
                                />
                              )}
                              {!shift.type && shift.type !== 'off' && <span className="text-slate-300 text-xs">—</span>}
                              {shift.type === 'off' && (
                                <span className="text-slate-400 text-[11px] italic">{shift.time}</span>
                              )}
                              {shift.isToday && shift.extraTime && (
                                <div className="rounded-xl border border-sky-200 bg-sky-600 text-white px-2.5 py-2 text-[11px] font-bold">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                    HÔM NAY
                                  </div>
                                  <div className="text-[10px] text-sky-200 font-normal mt-0.5">{shift.extraTime}</div>
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: Lịch sử ca điều trị ───────────────────────────── */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Tổng ca đã thực hiện', value: `${totalTreatmentsCount} ca`, color: 'text-sky-600', bg: 'bg-sky-50', icon: Calendar },
                  { label: 'Tỷ lệ thành công', value: '99.2%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                  { label: 'Doanh thu tháng này', value: Number(totalRevenueNumber).toLocaleString('vi-VN'), suffix: 'VNĐ', color: 'text-amber-600', bg: 'bg-amber-50', icon: DollarSign },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
                    <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                    <div className="flex items-end gap-1 mt-1.5">
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      {s.suffix && <p className="text-xs text-slate-500 font-bold mb-0.5">{s.suffix}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'Tất cả ca khám' },
                      { id: 'cercon', label: 'Bọc răng sứ Cercon/Emax' },
                      { id: 'veneer', label: 'Mặt dán Veneer' },
                      { id: 'revisit', label: 'Tái khám định kỳ' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHistoryFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          historyFilter === f.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex items-center w-full md:w-auto">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm ca, bệnh nhân..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 w-full md:w-52 transition-all"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[640px]">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/60">
                        {['Mã ca / Ngày', 'Bệnh nhân & SĐT', 'Dịch vụ kỹ thuật', 'Thời lượng', 'Doanh thu', 'Hoa hồng (VNĐ)'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTreatments.map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-sky-600">{row.id}</p>
                            <p className="text-slate-400 font-medium mt-0.5">{row.date}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-800">{row.patient}</p>
                            <p className="text-slate-400 font-medium mt-0.5">{row.phone}</p>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700 max-w-[200px]">{row.service}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600">{row.duration} phút</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{fmtVND(row.revenue)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-600">{fmtVND(row.commission)}</span>
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title={`Tỷ lệ hoa hồng áp dụng: ${row.commissionRate}%`}
                              >
                                {row.commissionRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Preservation Policy Banner */}
                <div className="mt-3.5 px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium leading-relaxed">
                    <strong>Chính sách bảo lưu thu nhập:</strong> Tiền hoa hồng được chốt snapshot theo tỷ lệ tại thời điểm thực hiện từng ca khám (ca trước ngày điều chỉnh giữ nguyên mức hoa hồng cũ {currentDoctor.code === 'NV002' ? '20%' : '15%'}, ca sau ngày điều chỉnh áp dụng mức hoa hồng mới {currentDoctor.commissionRate ?? 15}%).
                  </span>
                </div>

                {/* Table footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">
                    Hiển thị 1-{filteredTreatments.length} trong {totalTreatmentsCount} ca điều trị
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportTreatments}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Xuất danh sách ca khám (Excel)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: Đánh giá từ bệnh nhân ─────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Rating summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
                  {/* Overall score */}
                  <div className="text-center shrink-0 w-full lg:w-auto">
                    <p className="text-5xl font-black text-slate-900">{currentDoctor.rating || 4.9}</p>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(currentDoctor.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1.5">/ 5.0</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dựa trên {totalTreatmentsCount} lượt đánh giá trực tiếp từ bệnh nhân
                    </p>
                  </div>

                  {/* Star distribution */}
                  <div className="w-full flex-1 space-y-2">
                    {starDist.map(({ star, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-3 text-[11px] font-bold text-slate-600 text-right shrink-0">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">{pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Notable tags */}
                  <div className="w-full lg:w-44 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Điểm nổi bật</p>
                    {[
                      { label: 'Tay nghề nhẹ nhàng', count: 88 },
                      { label: 'Tư vấn tận tâm', count: 85 },
                      { label: 'Răng sứ tự nhiên', count: 74 },
                      { label: 'Đúng giờ', count: 60 },
                    ].map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200/70 text-xs font-semibold text-sky-700 w-full"
                      >
                        <ThumbsUp className="w-3 h-3 shrink-0" />
                        {tag.label} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Đánh giá gần đây</h3>
                  <div className="flex items-center gap-2">
                    <select className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-400 bg-white">
                      <option>Tất cả sao</option>
                      <option>5 sao</option>
                      <option>4 sao</option>
                    </select>
                    <select className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-400 bg-white">
                      <option>Mới nhất</option>
                      <option>Cũ nhất</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {displayedReviews.map((review: any) => {
                    const isVisible = reviewVisibilityMap[review.id] ?? true;
                    return (
                      <div key={review.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {review.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900 text-sm">{review.patient}</span>
                                <span className="text-[11px] text-slate-400 font-medium ml-2">{review.patientCode}</span>
                                <p className="text-[11px] text-slate-400 mt-0.5">{review.date}</p>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs font-semibold text-sky-600 mt-1.5">Dịch vụ: {review.service}</p>
                            <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                              <div className="flex items-center gap-3">
                                {review.verified && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Đã xác thực điều trị tại cơ sở {review.branch}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <button type="button" className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold transition-colors cursor-pointer">
                                  Phản hồi đánh giá
                                </button>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                                    isVisible
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {isVisible ? 'Đang hiển thị trên Web' : 'Đã ẩn trên Web'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleReviewVisibility(review.id)}
                                    className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${isVisible ? 'bg-sky-500' : 'bg-slate-200'}`}
                                    title={isVisible ? 'Bấm để ẩn đánh giá trên trang chủ' : 'Bấm để hiển thị đánh giá trên trang chủ'}
                                  >
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isVisible ? 'left-4' : 'left-0.5'}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add review button */}
                <div className="px-5 py-4 border-t border-slate-100 flex justify-center">
                  <button type="button" className="text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                    Tải thêm đánh giá
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Thông tin nhiệm vụ & Chuyên môn (Dành cho Kỹ thuật viên, Lễ tân, Quản lý) ── */}
          {activeTab === 'duties' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Vị trí đảm nhiệm: {currentDoctor.role || 'Kỹ thuật viên chuyên trách'}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Khoa / Bộ phận: {currentDoctor.department || 'Phòng Mổ & Tiệt khuẩn'} • Chi nhánh: {currentDoctor.branch}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Nhân sự chính thức
                  </span>
                </div>

                {/* Scope of duties & checklist */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Quy trình chuyên môn &amp; Danh mục trách nhiệm
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isAccountant ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Quản trị Quỹ lương &amp; Hoa hồng Thủ thuật</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Tính toán lương cứng, hoa hồng theo từng ca điều trị (Implant, Răng sứ), phụ cấp chuyên môn, thưởng KPI và chốt bảng lương định kỳ hàng tháng cho toàn viện.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Kiểm soát Dòng tiền, Thu - Chi &amp; Đối soát Viện phí</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Đối soát tiền mặt, chuyển khoản ngân hàng và quẹt thẻ POS hàng ngày; kiểm tra chênh lệch thu viện phí thực tế so với phần mềm quản lý.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Công nợ Labo &amp; Nhà cung cấp Vật tư Y tế</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Quản lý hóa đơn nhập trụ Implant, vật liệu sứ Emax/Cercon, thuốc tê nha khoa; thanh toán công nợ theo kỳ hạn cho các xưởng chế tác Labo.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Hóa đơn Điện tử VAT &amp; Báo cáo Tài chính</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Xuất hóa đơn GTGT cho khách hàng theo yêu cầu, lập báo cáo kết quả hoạt động kinh doanh (P&amp;L) và kê khai thuế định kỳ theo đúng quy định.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : currentDoctor.name?.startsWith('KTV') || currentDoctor.role?.includes('Kỹ thuật') || (currentDoctor.roleRaw || '').includes('TECH') ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Kiểm soát vô trùng &amp; Tiệt khuẩn dụng cụ</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Vận hành hệ thống lò hấp Autoclave chuẩn Class B, kiểm định chỉ thị màu sinh học và đóng gói dụng cụ phẫu thuật theo quy chuẩn Bộ Y Tế.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Chụp X-quang CT Cone Beam 3D &amp; Panorama</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Thực hiện chụp phim kỹ thuật số cận chóp, mặt nghiêng Cephalo và Cone Beam CT, dựng hình 3D xương hàm phục vụ cấy ghép Implant.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Bảo trì &amp; Vận hành trang thiết bị máy móc</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Kiểm tra áp lực khí nén, đường nước ghế nha, bảo dưỡng định kỳ máy phẫu thuật Piezotome và máy cắm Implant hàng ngày trước giờ đón khách.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Quản lý vật tư tiêu hao &amp; Giao nhận Labo</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Kiểm kê mũi khoan, vật liệu trám, trụ Implant; tiếp nhận mẫu dấu thạch cao và kiểm tra răng sứ trả về từ xưởng phục hình.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : currentDoctor.name?.startsWith('LT') || currentDoctor.role?.includes('Lễ tân') || (currentDoctor.roleRaw || '').includes('RECEP') ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Tiếp đón &amp; Check-in bệnh nhân</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Chào đón khách hàng tại sảnh chính, hướng dẫn thủ tục check-in theo mã hẹn và cập nhật trạng thái đã đến trên phần mềm.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Điều phối phân luồng ghế khám &amp; Bác sĩ</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Sắp xếp bệnh nhân vào đúng phòng chức năng, thông báo bác sĩ phụ trách và hỗ trợ rút ngắn thời gian chờ đợi.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Thu ngân, Viện phí &amp; Xuất hóa đơn VAT</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Xử lý thanh toán tiền mặt/chuyển khoản/thẻ tín dụng, đối soát bảo hiểm bảo lãnh và xuất hóa đơn điện tử cho bệnh nhân.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Chăm sóc khách hàng sau điều trị</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Thực hiện cuộc gọi thăm hỏi sau 24h thực hiện thủ thuật, hướng dẫn vệ sinh răng miệng và xếp lịch tái khám định kỳ.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Điều phối vận hành &amp; Nhân sự cơ sở</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Phân ca làm việc, giám sát tuân thủ nội quy phòng khám, duyệt đơn nghỉ phép và đánh giá hiệu suất nhân viên định kỳ.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Báo cáo hoạt động &amp; Kiểm soát tài chính</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Tổng hợp doanh thu hàng ngày, báo cáo công suất sử dụng ghế điều trị và phối hợp với ban giám đốc nâng cao chất lượng dịch vụ.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Working schedule details */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Khung giờ làm việc &amp; Cam kết quy chế
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">Ca làm việc tiêu chuẩn</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{currentDoctor.workHours || '08:00 - 17:30'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">Thời gian nghỉ trưa</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{currentDoctor.lunchBreak || '12:00 - 13:30'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">Ngày làm việc cố định</span>
                      <span className="text-xs font-bold text-sky-600 block mt-0.5">
                        {Array.isArray(currentDoctor.workDays) ? currentDoctor.workDays.join(', ') : 'T2 - T7'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Lịch sử ca làm & Chấm công (Dành cho Kỹ thuật viên, Lễ tân, Quản lý) ── */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Bảng chấm công &amp; Lịch sử ca làm việc
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ghi nhận thời gian nhận ca, hoàn thành ca trực và tính chuyên cần
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tỷ lệ đúng giờ: 100%
                  </span>
                </div>
              </div>

              {/* Attendance metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Ca hoàn thành (Tháng)</span>
                  <span className="text-base font-black text-slate-800 block mt-0.5">24 ca</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Tổng giờ công</span>
                  <span className="text-base font-black text-slate-800 block mt-0.5">192 giờ</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Ca tăng ca</span>
                  <span className="text-base font-black text-amber-600 block mt-0.5">2 ca</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Nghỉ phép có lương</span>
                  <span className="text-base font-black text-sky-600 block mt-0.5">1 ngày</span>
                </div>
              </div>

              {/* Shift log table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Ngày</th>
                      <th className="py-2.5 px-3">Loại ca</th>
                      <th className="py-2.5 px-3">Khung giờ</th>
                      <th className="py-2.5 px-3">Vị trí / Khu vực</th>
                      <th className="py-2.5 px-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { date: '04/10/2026', type: 'Ca Sáng & Ca Chiều', hours: '08:00 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                      { date: '03/10/2026', type: 'Ca Sáng & Ca Chiều', hours: '08:00 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                      { date: '02/10/2026', type: 'Ca Sáng & Ca Chiều', hours: '08:00 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                      { date: '01/10/2026', type: 'Ca Sáng & Ca Chiều', hours: '08:00 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                      { date: '30/09/2026', type: 'Ca Chiều', hours: '13:30 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                      { date: '29/09/2026', type: 'Ca Sáng & Ca Chiều', hours: '08:00 - 17:30', loc: 'Trụ sở Biên Hòa', status: 'Hoàn thành' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{row.type}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{row.hours}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.loc}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        initialStaffId={currentDoctor.id}
      />

      {/* Doctor Edit Modal */}
      <DoctorEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doctor={currentDoctor}
        onSave={(updated) => {
          setDoctor((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </div>
  );
};
