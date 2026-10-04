import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Stethoscope,
  Camera,
  Trash2,
  Calendar,
  ChevronDown,
  Check,
  Clock,
  Utensils,
  Globe,
  Lock,
  Unlock,
  Save,
  Plus,
  Pencil,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Search,
  Sparkles,
} from 'lucide-react';
import { staffApi, uploadApi, dentalServicesApi } from '../../services/api';

export interface DoctorEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: {
    id?: string;
    code?: string;
    employeeCode?: string;
    name?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    avatarUrl?: string;
    initials?: string;
    specialty?: string;
    branch?: string;
    role?: string;
    roleRaw?: string;
    department?: string;
    status?: string;
    commissionRate?: number;
    joinedDate?: string;
    title?: string;
    bio?: string;
    services?: string[];
    workDays?: string[];
    workHours?: string;
    lunchBreak?: string;
  } | null;
  onSave?: (updatedDoctor: any) => void;
}

const AVAILABLE_SERVICES = [
  'Sứ toàn phần Cercon (Đức)',
  'Sứ toàn phần Emax',
  'Mặt dán Veneer Emax',
  'Cấy ghép Implant Straumann',
  'Niềng răng trong suốt Invisalign',
  'Tẩy trắng răng Laser Whitening',
  'Nhổ răng khôn không đau Piezotome',
  'Điều trị tủy công nghệ vi phẫu',
];

export const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with doctor or default values
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(doctor?.avatar || doctor?.avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [code, setCode] = useState(doctor?.code || doctor?.employeeCode || 'NV001');
  const [name, setName] = useState(doctor?.name || doctor?.fullName || 'BS. Nguyễn Thị An');
  const [title, setTitle] = useState(doctor?.title || 'Bác sĩ Chuyên khoa - Răng Hàm Mặt');
  const [phone, setPhone] = useState(doctor?.phone || '090 123 4567');
  const [joinedDate, setJoinedDate] = useState(doctor?.joinedDate || '12/05/2021');
  const [email, setEmail] = useState(doctor?.email || 'bs.an@vietanhduc.vn');
  const [status, setStatus] = useState<'active' | 'leave' | 'resigned'>('active');

  const [branch, setBranch] = useState(doctor?.branch || 'Chi nhánh Biên Hòa (Trụ sở chính)');
  const [specialty, setSpecialty] = useState(doctor?.specialty || 'Phục hình Răng sứ thẩm mỹ');

  // Selected services
  const [services, setServices] = useState<string[]>([
    'Sứ toàn phần Cercon (Đức)',
    'Sứ toàn phần Emax',
    'Mặt dán Veneer Emax',
  ]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');

  // Real data from DB for service picker
  const [realServicesList, setRealServicesList] = useState<any[]>([]);
  const [realCategoriesList, setRealCategoriesList] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);

  // Commission & default working schedule
  const [commissionRate, setCommissionRate] = useState<number | string>(
    doctor?.commissionRate !== undefined ? doctor.commissionRate : 15
  );
  const [workDays, setWorkDays] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
  const [workHours, setWorkHours] = useState('08:00 - 17:30');
  const [lunchBreak, setLunchBreak] = useState('12:00 - 13:30');
  const [isEditingHours, setIsEditingHours] = useState(false);

  // Bio
  const [bio, setBio] = useState(
    doctor?.bio ||
      'Chuyên gia phục hình nụ cười với hơn 8 năm kinh nghiệm, tu nghiệp chuyên sâu về dán sứ Veneer bảo tồn men răng.'
  );

  // Online booking portal switch
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true);

  // Quyền tự chọn ca làm việc
  const [allowSelfSchedule, setAllowSelfSchedule] = useState(true);

  // Account locked status
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Role detection: is doctor vs non-clinical staff
  const isDoctor = useMemo(() => {
    if (!doctor) return true;
    const rRaw = ((doctor.roleRaw || '') as string).toUpperCase();
    const r = ((doctor.role || '') as string).toLowerCase();
    const docName = (doctor.name || doctor.fullName || name || '');
    if (rRaw === 'DOCTOR') return true;
    if (['TECHNICIAN', 'RECEPTIONIST', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'NURSE'].includes(rRaw)) return false;
    if (r.includes('kỹ thuật') || r.includes('lễ tân') || r.includes('quản lý') || r.includes('quản trị') || r.includes('điều dưỡng')) return false;
    if (docName.startsWith('KTV.') || docName.startsWith('LT.')) return false;
    return true;
  }, [doctor, name]);

  // Fetch real categories and services from backend
  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        setIsLoadingServices(true);
        const [cats, srvs] = await Promise.all([
          dentalServicesApi.getCategories().catch(() => []),
          dentalServicesApi.getAll({ isActive: true }).catch(() => []),
        ]);
        if (Array.isArray(cats) && cats.length > 0) setRealCategoriesList(cats);
        if (Array.isArray(srvs) && srvs.length > 0) setRealServicesList(srvs);
      } catch (e) {
        console.warn('Lỗi tải danh mục & dịch vụ trong modal:', e);
      } finally {
        setIsLoadingServices(false);
      }
    };
    if (isOpen) {
      fetchServicesAndCategories();
    }
  }, [isOpen]);

  // Sync state whenever modal opens or doctor changes
  useEffect(() => {
    if (isOpen && doctor) {
      setAvatarPreview(doctor.avatar || doctor.avatarUrl);
      setCode(doctor.code || doctor.employeeCode || 'NV001');
      setName(doctor.name || doctor.fullName || 'BS. Nguyễn Thị An');
      setTitle(doctor.title || 'Bác sĩ Chuyên khoa - Răng Hàm Mặt');
      setPhone(doctor.phone || '090 123 4567');
      setEmail(doctor.email || 'bs.an@vietanhduc.vn');
      setBranch(doctor.branch || 'Chi nhánh Biên Hòa (Trụ sở chính)');
      setSpecialty(doctor.specialty || 'Phục hình Răng sứ thẩm mỹ');
      if (doctor.bio) setBio(doctor.bio);

      const staffKey = doctor.id || doctor.code || doctor.employeeCode || '';

      // 1. Synchronize services
      const savedServices = localStorage.getItem(`staff_services_${staffKey}`);
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed);
          }
        } catch (e) {}
      } else if (doctor.services && Array.isArray(doctor.services) && doctor.services.length > 0) {
        setServices(doctor.services);
      } else if (doctor.code === 'NV002' || doctor.specialty?.includes('Implant')) {
        setServices([
          'Cấy ghép Implant Straumann',
          'Trụ Osstem No mount (Hàn Quốc)',
          'Trụ Osstem SA (Hàn Quốc)',
        ]);
      } else {
        setServices([
          'Sứ toàn phần Cercon (Đức)',
          'Sứ toàn phần Emax',
          'Mặt dán Veneer Emax',
        ]);
      }

      // 2. Synchronize commission rate
      const savedCommission = localStorage.getItem(`staff_commission_${staffKey}`);
      if (savedCommission !== null) {
        setCommissionRate(Number(savedCommission));
      } else if (doctor.commissionRate !== undefined) {
        setCommissionRate(Number(doctor.commissionRate));
      } else if (doctor.code === 'NV002' || doctor.specialty?.includes('Implant')) {
        setCommissionRate(20);
      } else {
        setCommissionRate(15);
      }

      // 3. Synchronize working days, hours & lunch break
      const savedWorkDays = localStorage.getItem(`staff_workdays_${staffKey}`);
      if (savedWorkDays) {
        try {
          const parsed = JSON.parse(savedWorkDays);
          if (Array.isArray(parsed)) setWorkDays(parsed);
        } catch (e) {}
      } else if (doctor.workDays && Array.isArray(doctor.workDays)) {
        setWorkDays(doctor.workDays);
      } else {
        setWorkDays(['T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
      }

      const savedWorkHours = localStorage.getItem(`staff_workhours_${staffKey}`);
      if (savedWorkHours) {
        setWorkHours(savedWorkHours);
      } else if (doctor.workHours) {
        setWorkHours(doctor.workHours);
      } else {
        setWorkHours('08:00 - 17:30');
      }

      const savedLunchBreak = localStorage.getItem(`staff_lunchbreak_${staffKey}`);
      if (savedLunchBreak) {
        setLunchBreak(savedLunchBreak);
      } else if (doctor.lunchBreak) {
        setLunchBreak(doctor.lunchBreak);
      } else {
        setLunchBreak('12:00 - 13:30');
      }

      const savedSelf = localStorage.getItem(`staff_self_schedule_${staffKey}`);
      if (savedSelf !== null) {
        setAllowSelfSchedule(savedSelf === 'true');
      } else if ((doctor as any).allowSelfSchedule !== undefined) {
        setAllowSelfSchedule(Boolean((doctor as any).allowSelfSchedule));
      } else {
        setAllowSelfSchedule(true);
      }

      const lockedStorage =
        localStorage.getItem(`account_locked_${(doctor.email || '').toLowerCase()}`) === 'true' ||
        localStorage.getItem(`account_locked_${(doctor.code || doctor.employeeCode || '').toLowerCase()}`) === 'true';
      const isDocLocked = Boolean(doctor.status === 'Locked' || (doctor as any).isActive === false || lockedStorage);
      setIsLocked(isDocLocked);

      setIsEditingHours(false);
      setIsAddingService(false);
      setShowToast(null);
    }
  }, [isOpen, doctor]);

  const doctorDisplayName = name || doctor?.name || doctor?.fullName || 'Bác sĩ';
  const doctorShortName = doctorDisplayName.trim()
    ? doctorDisplayName.trim().split(/\s+/).slice(-2).join(' ')
    : 'bác sĩ';

  // Handle avatar upload to Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local preview while uploading
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingAvatar(true);
      setShowToast({ message: 'Đang tải ảnh lên Cloudinary...', type: 'warn' });
      const res = await uploadApi.uploadImage(file, 'doctors');
      if (res?.url) {
        setAvatarPreview(res.url);
        setShowToast({ message: 'Đã tải ảnh lên Cloudinary thành công!', type: 'success' });
      }
    } catch (err: any) {
      console.error('Lỗi upload Cloudinary:', err);
      setShowToast({
        message: 'Lỗi tải ảnh lên Cloudinary: ' + (err?.response?.data?.message || err.message || 'Thất bại'),
        type: 'warn',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle work day (T2 - CN)
  const toggleWorkDay = (day: string) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle service
  const removeService = (srv: string) => {
    setServices((prev) => prev.filter((s) => s !== srv));
  };

  const addService = (srv: string) => {
    if (srv && !services.includes(srv)) {
      setServices((prev) => [...prev, srv]);
      setShowToast({ message: `Đã thêm dịch vụ: ${srv}`, type: 'success' });
    }
    setCustomServiceName('');
  };

  // Handle Save
  const handleSave = async () => {
    const commRateNum = Number(commissionRate) || 0;
    const updatedData = {
      ...(doctor || {}),
      name,
      fullName: name,
      title,
      phone,
      email,
      avatar: avatarPreview,
      branch,
      specialty,
      services,
      commissionRate: commRateNum,
      joinedDate,
      status: isLocked ? 'Locked' : status === 'active' ? 'Active' : status === 'leave' ? 'On Leave' : 'Resigned',
      isActive: !isLocked,
      isLocked,
      allowSelfSchedule,
      bio,
      workDays,
      workHours,
      lunchBreak,
      onlineBookingEnabled,
    };

    const staffKey = doctor?.id || doctor?.code || doctor?.employeeCode || code;
    const prevCommRate = Number(doctor?.commissionRate !== undefined ? doctor.commissionRate : 15);
    if (commRateNum !== prevCommRate) {
      const nowIso = new Date().toISOString();
      if (staffKey) {
        localStorage.setItem(`staff_commission_changed_at_${staffKey}`, nowIso);
        localStorage.setItem(`staff_prev_commission_${staffKey}`, String(prevCommRate));
      }
      if (code) {
        localStorage.setItem(`staff_commission_changed_at_${code}`, nowIso);
        localStorage.setItem(`staff_prev_commission_${code}`, String(prevCommRate));
      }
    }

    if (staffKey) {
      localStorage.setItem(`staff_self_schedule_${staffKey}`, String(allowSelfSchedule));
      localStorage.setItem(`staff_services_${staffKey}`, JSON.stringify(services));
      localStorage.setItem(`staff_commission_${staffKey}`, String(commRateNum));
      localStorage.setItem(`staff_workdays_${staffKey}`, JSON.stringify(workDays));
      localStorage.setItem(`staff_workhours_${staffKey}`, String(workHours));
      localStorage.setItem(`staff_lunchbreak_${staffKey}`, String(lunchBreak));
    }
    if (code) {
      localStorage.setItem(`staff_self_schedule_${code}`, String(allowSelfSchedule));
      localStorage.setItem(`staff_services_${code}`, JSON.stringify(services));
      localStorage.setItem(`staff_commission_${code}`, String(commRateNum));
      localStorage.setItem(`staff_workdays_${code}`, JSON.stringify(workDays));
      localStorage.setItem(`staff_workhours_${code}`, String(workHours));
      localStorage.setItem(`staff_lunchbreak_${code}`, String(lunchBreak));
    }

    const docKeyEmail = (email || doctor?.email || '').toLowerCase();
    const docKeyCode = (code || doctor?.code || doctor?.employeeCode || '').toLowerCase();
    if (isLocked) {
      if (docKeyEmail) localStorage.setItem(`account_locked_${docKeyEmail}`, 'true');
      if (docKeyCode) localStorage.setItem(`account_locked_${docKeyCode}`, 'true');
    } else {
      if (docKeyEmail) localStorage.removeItem(`account_locked_${docKeyEmail}`);
      if (docKeyCode) localStorage.removeItem(`account_locked_${docKeyCode}`);
    }

    try {
      if (doctor?.id) {
        await staffApi.updateStaff(doctor.id, {
          fullName: name,
          phone,
          email,
          specialty,
          bio,
          avatarUrl: avatarPreview,
          isActive: !isLocked,
          commissionRate: commRateNum,
          services,
          workDays,
          workHours,
          lunchBreak,
        });
      }
    } catch (err) {
      console.warn('Backend updateStaff notice:', err);
    }

    // Broadcast sync event to all open tabs / admin view
    try {
      const channel = new BroadcastChannel('smartschedule_sync');
      channel.postMessage({ type: 'STAFF_UPDATED', doctorId: doctor?.id, data: updatedData });
      channel.close();
    } catch (e) {
      // BroadcastChannel fallback
    }

    if (onSave) {
      onSave(updatedData);
    }

    setShowToast({
      message: isLocked
        ? 'Đã cập nhật hồ sơ & khóa tài khoản thành công!'
        : 'Cập nhật hồ sơ bác sĩ thành công!',
      type: 'success',
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleToggleLock = async () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);

    const docKeyEmail = (email || doctor?.email || '').toLowerCase();
    const docKeyCode = (code || doctor?.code || doctor?.employeeCode || '').toLowerCase();

    if (nextLocked) {
      if (docKeyEmail) localStorage.setItem(`account_locked_${docKeyEmail}`, 'true');
      if (docKeyCode) localStorage.setItem(`account_locked_${docKeyCode}`, 'true');
    } else {
      if (docKeyEmail) localStorage.removeItem(`account_locked_${docKeyEmail}`);
      if (docKeyCode) localStorage.removeItem(`account_locked_${docKeyCode}`);
    }

    // Synchronize to backend if staff id exists
    if (doctor?.id) {
      try {
        await staffApi.updateStaff(doctor.id, { isActive: !nextLocked });
      } catch (err) {
        console.warn('Backend updateStaff isActive notice:', err);
      }
    }

    setShowToast({
      message: nextLocked
        ? 'Đã khóa tài khoản! Nhân sự này sẽ không thể đăng nhập cho đến khi quản trị viên mở khóa.'
        : 'Đã mở khóa tài khoản! Nhân sự hiện có thể đăng nhập bình thường.',
      type: nextLocked ? 'warn' : 'success',
    });
  };

  const fmtVND = (n: number) => Number(n).toLocaleString('vi-VN') + 'đ';

  const categoriesToDisplay = React.useMemo(() => {
    if (realCategoriesList.length > 0) return realCategoriesList;
    return [
      { id: 'cat-1', slug: 'rang-su-tham-my', name: 'Răng sứ thẩm mỹ' },
      { id: 'cat-2', slug: 'cay-ghep-implant', name: 'Cấy ghép Implant' },
      { id: 'cat-3', slug: 'chinh-nha', name: 'Chỉnh nha & Niềng răng' },
      { id: 'cat-4', slug: 'tong-quat', name: 'Nha khoa tổng quát' },
    ];
  }, [realCategoriesList]);

  const filteredServicesToDisplay = React.useMemo(() => {
    let list = realServicesList.length > 0 ? realServicesList : AVAILABLE_SERVICES.map((s, idx) => ({
      id: `srv-${idx}`,
      name: s,
      code: `DV-${String(idx + 1).padStart(2, '0')}`,
      durationMinutes: 60,
      standardPrice: 5000000,
      category: { name: 'Nha khoa' },
    }));

    if (selectedCategoryFilter !== 'ALL') {
      list = list.filter((s: any) => {
        const catIdMatch = s.categoryId === selectedCategoryFilter;
        const catSlugMatch = s.category?.slug === selectedCategoryFilter;
        const catNameMatch = s.category?.name?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
        return catIdMatch || catSlugMatch || catNameMatch;
      });
    }

    if (serviceSearchTerm.trim()) {
      const q = serviceSearchTerm.toLowerCase();
      list = list.filter((s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.category?.name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [realServicesList, selectedCategoryFilter, serviceSearchTerm]);

  const ALL_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden relative border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Toast Notification */}
          {showToast && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce transition-all ${
                showToast.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{showToast.message}</span>
            </div>
          )}

          {/* ─── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/80 shadow-2xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {isDoctor ? 'Chỉnh Sửa Hồ Sơ Bác Sĩ & Chuyên Gia' : 'Chỉnh Sửa Hồ Sơ Nhân Sự'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Cập nhật thông tin định danh, chuyên môn{isDoctor ? ', tỷ lệ hoa hồng' : ''} và khung giờ làm việc chuẩn cho{' '}
                  <span className="font-bold text-slate-800">{doctorDisplayName}</span>{' '}
                  <span className="text-sky-600 font-semibold">(#{code})</span>
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

          {/* ─── Body (2 Columns) ──────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* ════ LEFT COLUMN: Thông tin cá nhân & định danh (5 cols) ════ */}
              <div className="md:col-span-5 space-y-4">
                {/* Avatar Box */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative group">
                  <div className="relative mb-2.5">
                    {avatarPreview ? (
                      <div className="relative w-20 h-20">
                        <img
                          src={avatarPreview}
                          alt={name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-bold">
                            <Loader2 className="w-5 h-5 animate-spin mb-1 text-sky-400" />
                            <span>Cloudinary</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-20 h-20 rounded-xl bg-sky-100 text-sky-600 font-bold text-xl flex items-center justify-center border-2 border-white shadow-sm">
                        {isUploadingAvatar ? (
                          <div className="flex flex-col items-center justify-center text-sky-600 text-[10px] font-bold">
                            <Loader2 className="w-5 h-5 animate-spin mb-1" />
                            <span>Cloudinary</span>
                          </div>
                        ) : (
                          doctor?.initials || name.slice(0, 2).toUpperCase() || 'BS'
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                      title="Chỉnh sửa ảnh (Cloudinary)"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      Thay đổi ảnh
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                      title="Xóa ảnh đại diện"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Mã NV (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã NV
                  </label>
                  <input
                    type="text"
                    value={code}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs font-bold text-slate-600 cursor-not-allowed select-none"
                  />
                </div>

                {/* Họ và tên * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="BS. Nguyễn Thị An"
                  />
                </div>

                {/* Chức danh * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chức danh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="Bác sĩ Chuyên khoa - Răng Hàm Mặt"
                  />
                </div>

                {/* SĐT * & Ngày gia nhập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SĐT <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                      placeholder="090 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ngày gia nhập
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        placeholder="12/05/2021"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="bs.an@vietanhduc.vn"
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      Đang hoạt động
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('leave')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        status === 'leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tạm nghỉ phép
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('resigned')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        status === 'resigned'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Đã nghỉ việc
                    </button>
                  </div>
                </div>
              </div>

              {/* ════ RIGHT COLUMN: Chuyên môn, Dịch vụ & Thiết lập (7 cols) ════ */}
              <div className="md:col-span-7 space-y-4">
                {/* Chi nhánh làm việc & Chuyên môn chính */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chi nhánh làm việc
                    </label>
                    <div className="relative">
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                      >
                        <option>Chi nhánh Biên Hòa (Trụ sở chính)</option>
                        <option>Cơ sở Quận 1 (Trung tâm)</option>
                        <option>Cơ sở Bình Dương</option>
                        <option>Cơ sở Quận 7</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chuyên môn chính
                    </label>
                    <div className="relative">
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                      >
                        {isDoctor ? (
                          <>
                            <option>Phục hình Răng sứ thẩm mỹ</option>
                            <option>Cấy ghép Implant Nha Khoa</option>
                            <option>Chỉnh nha - Niềng răng</option>
                            <option>Nha khoa tổng quát & Điều trị tủy</option>
                            <option>Phẫu thuật Tạo hình Hàm mặt</option>
                          </>
                        ) : ((doctor as any)?.roleRaw === 'TECHNICIAN' || doctor?.role?.includes('Kỹ thuật') || name.startsWith('KTV.')) ? (
                          <>
                            <option>Vô trùng & Kỹ thuật</option>
                            <option>Thiết bị phòng mổ & Tiệt khuẩn</option>
                            <option>Kỹ thuật hình ảnh X-quang & CT 3D</option>
                            <option>Quản lý vật tư & Dụng cụ phẫu thuật</option>
                            <option>Phục hình thạch cao & Labo</option>
                          </>
                        ) : ((doctor as any)?.roleRaw === 'RECEPTIONIST' || doctor?.role?.includes('Lễ tân') || name.startsWith('LT.')) ? (
                          <>
                            <option>Lễ tân & Điều phối</option>
                            <option>Tiếp đón & Chăm sóc khách hàng</option>
                            <option>Thu ngân & Thanh toán viện phí</option>
                            <option>Quản lý hồ sơ & Lịch hẹn</option>
                          </>
                        ) : (
                          <>
                            <option>Điều hành & Quản lý chi nhánh</option>
                            <option>Quản trị hệ thống & Vận hành</option>
                            <option>Điều phối nhân sự & Kế hoạch</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Dịch vụ thực hiện (Chỉ áp dụng cho Bác sĩ) */}
                {isDoctor && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Dịch vụ thực hiện ({services.length})
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dịch vụ phụ trách thực tế của bác sĩ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingService((v) => !v)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1 cursor-pointer bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAddingService ? 'Thu gọn' : 'Thêm dịch vụ'}
                    </button>
                  </div>

                  {/* Add service panel with REAL categories and REAL services */}
                  {isAddingService && (
                    <div className="mb-3.5 p-3.5 bg-white rounded-xl border border-sky-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                          <span className="text-xs font-bold text-slate-800">
                            Danh Mục &amp; Dịch Vụ Nha Khoa Hệ Thống
                          </span>
                        </div>
                        {isLoadingServices && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                            Đang tải...
                          </div>
                        )}
                      </div>

                      {/* Search box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                          placeholder="Tìm nhanh dịch vụ (VD: Cercon, Emax, Veneer, Implant, Tẩy trắng...)"
                          className="w-full pl-8.5 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-400 bg-slate-50/50"
                        />
                        {serviceSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setServiceSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Category Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter('ALL')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            selectedCategoryFilter === 'ALL'
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Tất cả ({filteredServicesToDisplay.length})
                        </button>
                        {categoriesToDisplay.map((cat: any) => {
                          const catId = cat.id || cat.slug || cat.name;
                          const isSelected = selectedCategoryFilter === catId;
                          return (
                            <button
                              key={catId}
                              type="button"
                              onClick={() => setSelectedCategoryFilter(catId)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Services List */}
                      <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/30">
                        {filteredServicesToDisplay.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            Không tìm thấy dịch vụ phù hợp với &ldquo;{serviceSearchTerm}&rdquo;
                          </div>
                        ) : (
                          filteredServicesToDisplay.map((srv: any) => {
                            const isSelected = services.includes(srv.name);
                            const priceNum = Number(srv.standardPrice || srv.price || 0);
                            return (
                              <div
                                key={srv.id || srv.code || srv.name}
                                className="p-2.5 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-800">{srv.name}</span>
                                    {srv.code && (
                                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                                        {srv.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
                                    <span>⏱ {srv.durationMinutes || 60}p</span>
                                    <span>•</span>
                                    <span className="font-bold text-teal-600">
                                      {priceNum ? fmtVND(priceNum) : 'Liên hệ'}
                                    </span>
                                    {srv.category?.name && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[130px]">{srv.category.name}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                                    <Check className="w-3 h-3" /> Đã chọn
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => addService(srv.name)}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Thêm
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Custom Service Input */}
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <input
                          type="text"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                          placeholder="Hoặc nhập tên dịch vụ tùy chỉnh..."
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customServiceName.trim()) addService(customServiceName.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customServiceName.trim()) addService(customServiceName.trim());
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          Thêm dịch vụ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected service tags */}
                  <div className="flex flex-wrap gap-2">
                    {services.map((srv) => (
                      <span
                        key={srv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-2xs group hover:border-slate-300 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => removeService(srv)}
                          className="text-slate-300 hover:text-rose-500 ml-0.5 transition-colors cursor-pointer"
                          title="Xóa dịch vụ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {services.length === 0 && (
                      <span className="text-xs text-rose-500 italic">Chưa chọn dịch vụ nào phụ trách</span>
                    )}
                  </div>
                </div>
                )}

                {/* Hoa hồng (%) & Khung giờ làm việc (Mặc định) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  {/* Hoa hồng (Chỉ áp dụng cho Bác sĩ) */}
                  {isDoctor && (
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Hoa hồng (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value)}
                          className="w-full px-3 py-2 pr-7 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                          placeholder="15"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          %
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Tự động tính hoa hồng mỗi ca khám</p>
                    </div>
                  )}

                  {/* Khung giờ làm việc */}
                  <div className={isDoctor ? 'sm:col-span-8' : 'sm:col-span-12'}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Khung giờ làm việc (Mặc định)
                      </label>
                      {workDays.length === 0 ? (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Nghỉ tất cả các ngày
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {workDays.length} ngày/tuần
                        </span>
                      )}
                    </div>

                    {/* Day selector buttons: T2 - CN */}
                    <div className="flex items-center gap-1 mb-1.5">
                      {ALL_DAYS.map((day) => {
                        const isSelected = workDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWorkDay(day)}
                            className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer select-none text-center ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                            title={`Nhấp để ${isSelected ? 'bỏ chọn' : 'chọn'} ${day}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Schedule action presets (Cho phép xóa tất cả hoặc chọn nhanh) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-2">
                      <button
                        type="button"
                        onClick={() => setWorkDays([])}
                        className={`px-2 py-0.5 rounded border transition-colors cursor-pointer font-semibold ${
                          workDays.length === 0
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                        title="Xóa tất cả ngày làm việc để chuyển thành nghỉ (OFF)"
                      >
                        ✕ Xóa lịch (Nghỉ hết)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkDays(['T2', 'T3', 'T4', 'T5', 'T6'])}
                        className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
                      >
                        T2 - T6
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkDays(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'])}
                        className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
                      >
                        T2 - T7 (Chuẩn)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkDays(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'])}
                        className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
                      >
                        Cả tuần (T2-CN)
                      </button>
                    </div>

                    {/* Work hours card */}
                    <div className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
                      {!isEditingHours ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">{workHours}</span>
                            <span className="text-slate-300">|</span>
                            <Utensils className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Nghỉ trưa: {lunchBreak}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingHours(true)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 cursor-pointer"
                            title="Sửa khung giờ"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={workHours}
                            onChange={(e) => setWorkHours(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs w-28 bg-white"
                            placeholder="08:00 - 17:30"
                          />
                          <span className="text-slate-300">|</span>
                          <input
                            type="text"
                            value={lunchBreak}
                            onChange={(e) => setLunchBreak(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs w-28 bg-white"
                            placeholder="12:00 - 13:30"
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingHours(false)}
                            className="ml-auto px-2 py-0.5 bg-sky-600 text-white rounded text-[11px] font-bold"
                          >
                            Xong
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tiểu sử chuyên môn (Bio) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tiểu sử chuyên môn (Bio)
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      value={bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setBio(e.target.value);
                        }
                      }}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none leading-relaxed placeholder:text-slate-300"
                      placeholder="Mô tả quá trình đào tạo, chuyên sâu và kinh nghiệm điều trị..."
                    />
                    <div className="text-right text-[11px] text-slate-400 mt-1 font-medium select-none">
                      {bio.length}/500 ký tự
                    </div>
                  </div>
                </div>

                {/* Quyền tự chọn ca làm việc (Công tắc cho phép/khóa quyền) */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      allowSelfSchedule ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Quyền tự chọn ca làm việc
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          allowSelfSchedule
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {allowSelfSchedule ? 'Nhân sự tự chọn ca' : 'Khóa quyền (Quản lý chọn)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {allowSelfSchedule
                          ? `Cho phép ${doctorShortName} tự đăng ký & điều chỉnh ca làm việc trên hệ thống`
                          : `Đã khóa quyền tự chọn ca. Lịch làm việc do Quản lý/Admin trực tiếp phân bổ`}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setAllowSelfSchedule((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      allowSelfSchedule ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        allowSelfSchedule ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Cổng Đặt lịch trực tuyến (Chỉ áp dụng cho Bác sĩ) */}
                {isDoctor && (
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Cổng Đặt lịch trực tuyến
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Cho phép khách hàng chọn {doctorShortName} trên website/app đặt lịch
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setOnlineBookingEnabled((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      onlineBookingEnabled ? 'bg-sky-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        onlineBookingEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer ─────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Khóa tài khoản bác sĩ button */}
              <button
                type="button"
                onClick={handleToggleLock}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isLocked
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
                }`}
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mở khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isDoctor ? 'Khóa tài khoản bác sĩ' : 'Khóa tài khoản nhân sự'}</span>
                  </>
                )}
              </button>

              {/* Primary action: CẬP NHẬT HỒ SƠ */}
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>ĐANG TẢI ẢNH LÊN...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>CẬP NHẬT HỒ SƠ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);  }
        }
      `}</style>
    </>
  );
};
